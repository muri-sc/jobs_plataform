import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const notFound = (req, res) => res.status(404).json({ error: 'Rota não encontrada' });

// Erros conhecidos do Postgres
const pgErrors = {
  '22P02': [400, 'Valor inválido'],
  '23505': [409, 'Já existe um registro com esses dados'],
  '23503': [400, 'Registro relacionado não encontrado'],
  '23514': [400, 'Dados violam uma regra (ex.: faixa salarial)'],
};

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ error: 'Dados inválidos', details });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });

  if (pgErrors[err.code]) {
    const [status, error] = pgErrors[err.code];
    return res.status(status).json({ error });
  }

  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
}
