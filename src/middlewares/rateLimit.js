import rateLimit from 'express-rate-limit';

// Máx. 100 requisições por IP a cada 15 minutos
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
});

// Chat faz polling (5s na conversa, 30s no contador): limite próprio e mais alto
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
});
