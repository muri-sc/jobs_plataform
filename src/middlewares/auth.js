import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

// auth() exige login | auth('recruiter') exige login + role
export const auth = (...roles) => (req, res, next) => {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) throw new AppError('Token não informado', 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), role: payload.role };
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }

  if (roles.length && !roles.includes(req.user.role)) throw new AppError('Acesso negado', 403);
  next();
};
