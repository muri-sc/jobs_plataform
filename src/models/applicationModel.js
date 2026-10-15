import { pool } from '../config/db.js';

export async function create(userId, jobId) {
  const { rows } = await pool.query(
    'INSERT INTO applications (user_id, job_id) VALUES ($1, $2) RETURNING *',
    [userId, jobId]
  );
  return rows[0];
}

export async function findByUser(userId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.status, a.applied_at, j.id AS job_id, j.title, j.company
     FROM applications a JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = $1 ORDER BY a.applied_at DESC`,
    [userId]
  );
  return rows;
}

export async function findByJob(jobId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.status, a.applied_at, u.id AS user_id, u.name, u.email, u.phone, u.preferred_role
     FROM applications a JOIN users u ON u.id = a.user_id
     WHERE a.job_id = $1 ORDER BY a.applied_at DESC`,
    [jobId]
  );
  return rows;
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0];
}
