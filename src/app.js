import express from 'express';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { apiLimiter, chatLimiter } from './middlewares/rateLimit.js';
import conversationRoutes from './routes/conversationRoutes.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

// CORS simples (defina CORS_ORIGIN no .env)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Conversas ficam antes de /api para não passarem pelo apiLimiter
app.use('/api/conversations', chatLimiter, conversationRoutes);
app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
