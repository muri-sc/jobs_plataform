import { z } from 'zod';
import { idSchema } from './commonSchema.js';

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const messagesQuerySchema = z.object({
  after: idSchema.optional(),
});
