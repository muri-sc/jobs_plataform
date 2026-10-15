import { pool } from '../config/db.js';

const fields = 'id, name, email, phone, role, preferred_role, created_at';

export async function create({ name, email, password_hash, phone, role, preferred_role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, role, preferred_role)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${fields}`,
    [name, email, password_hash, phone, role, preferred_role]
  );
  return rows[0];
}

// Retorna o password_hash também (só usado no login)
export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT ${fields} FROM users WHERE id = $1`, [id]);
  return rows[0];
}
