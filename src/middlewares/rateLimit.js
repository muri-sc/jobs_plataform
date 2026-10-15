import rateLimit from 'express-rate-limit';

// Máx. 100 requisições por IP a cada 15 minutos
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
});
