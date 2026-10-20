import { pool } from '../config/db.js';

// Filtros opcionais: quando o valor é nulo, a condição é ignorada
export async function findAll({ search, location, work_model, status, recruiter_id = null }) {
  const { rows } = await pool.query(
    `SELECT * FROM jobs
     WHERE status = $1
       AND ($2::text IS NULL OR location ILIKE '%' || $2::text || '%')
       AND ($3::text IS NULL OR work_model = $3::text)
       AND ($4::text IS NULL
            OR title ILIKE '%' || $4::text || '%'
            OR company ILIKE '%' || $4::text || '%'
            OR description ILIKE '%' || $4::text || '%')
       AND ($5::bigint IS NULL OR recruiter_id = $5::bigint)
     ORDER BY created_at DESC`,
    [status, location, work_model, search, recruiter_id]
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
  return rows[0];
}

export async function create(recruiterId, d) {
  const { rows } = await pool.query(
    `INSERT INTO jobs (recruiter_id, company, title, description, requirements, location, work_model, salary_min, salary_max)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [recruiterId, d.company, d.title, d.description, d.requirements, d.location, d.work_model, d.salary_min, d.salary_max]
  );
  return rows[0];
}

// Campos não enviados (null) mantêm o valor atual
export async function update(id, d) {
  const { rows } = await pool.query(
    `UPDATE jobs SET
       company = COALESCE($1, company),
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       requirements = COALESCE($4, requirements),
       location = COALESCE($5, location),
       work_model = COALESCE($6, work_model),
       salary_min = COALESCE($7, salary_min),
       salary_max = COALESCE($8, salary_max),
       status = COALESCE($9, status)
     WHERE id = $10 RETURNING *`,
    [d.company, d.title, d.description, d.requirements, d.location, d.work_model, d.salary_min, d.salary_max, d.status, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
  return rowCount > 0;
}
