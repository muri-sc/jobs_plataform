import { pool } from '../config/db.js';

// Candidatura + vaga + nomes dos dois participantes (dev e dono da vaga)
export async function findConversation(applicationId) {
  const { rows } = await pool.query(
    `SELECT a.id AS application_id, a.status, a.user_id AS dev_id, d.name AS dev_name,
            j.id AS job_id, j.title, j.company, j.status AS job_status,
            j.recruiter_id, r.name AS recruiter_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users d ON d.id = a.user_id
     LEFT JOIN users r ON r.id = j.recruiter_id
     WHERE a.id = $1`,
    [applicationId]
  );
  return rows[0];
}

// Só conversas com pelo menos uma mensagem, da mais recente para a mais antiga
export async function findConversationsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT a.id AS application_id, a.status, j.id AS job_id, j.title, j.company,
            j.status AS job_status,
            CASE WHEN a.user_id = $1 THEN r.name ELSE d.name END AS other_name,
            last.body AS last_message, last.sender_id AS last_sender_id,
            last.created_at AS last_message_at,
            (SELECT count(*)::int FROM messages m
             WHERE m.application_id = a.id AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users d ON d.id = a.user_id
     LEFT JOIN users r ON r.id = j.recruiter_id
     JOIN LATERAL (
       SELECT body, sender_id, created_at FROM messages m
       WHERE m.application_id = a.id ORDER BY m.id DESC LIMIT 1
     ) last ON true
     WHERE a.user_id = $1 OR j.recruiter_id = $1
     ORDER BY last.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function countUnread(userId) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS unread
     FROM messages m
     JOIN applications a ON a.id = m.application_id
     JOIN jobs j ON j.id = a.job_id
     WHERE (a.user_id = $1 OR j.recruiter_id = $1)
       AND m.sender_id <> $1 AND m.read_at IS NULL`,
    [userId]
  );
  return rows[0].unread;
}

// after = último id que o cliente já tem (polling incremental)
export async function findByApplication(applicationId, after = 0) {
  const { rows } = await pool.query(
    `SELECT id, sender_id, body, read_at, created_at FROM messages
     WHERE application_id = $1 AND id > $2 ORDER BY id`,
    [applicationId, after]
  );
  return rows;
}

export async function create(applicationId, senderId, body) {
  const { rows } = await pool.query(
    `INSERT INTO messages (application_id, sender_id, body) VALUES ($1, $2, $3)
     RETURNING id, sender_id, body, read_at, created_at`,
    [applicationId, senderId, body]
  );
  return rows[0];
}

// Marca como lidas as mensagens recebidas (enviadas pelo outro participante)
export async function markRead(applicationId, userId) {
  await pool.query(
    `UPDATE messages SET read_at = CURRENT_TIMESTAMP
     WHERE application_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
    [applicationId, userId]
  );
}
