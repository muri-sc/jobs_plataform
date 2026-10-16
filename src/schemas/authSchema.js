import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(72),
  phone: z.string().max(20).optional(),
  role: z.enum(['dev', 'recruiter']),
  preferred_role: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
