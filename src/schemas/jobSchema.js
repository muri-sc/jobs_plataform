import { z } from 'zod';

const jobFields = z.object({
  company: z.string().min(2).max(150),
  title: z.string().min(2).max(150),
  description: z.string().min(10),
  requirements: z.string().optional(),
  location: z.string().max(150).optional(),
  work_model: z.enum(['remote', 'hybrid', 'onsite']),
  salary_min: z.number().nonnegative().optional(),
  salary_max: z.number().nonnegative().optional(),
});

export const jobSchema = jobFields.refine(
  (d) => d.salary_min == null || d.salary_max == null || d.salary_max >= d.salary_min,
  { message: 'salary_max deve ser maior ou igual a salary_min', path: ['salary_max'] }
);

// Atualização parcial (inclui status para abrir/fechar a vaga)
export const jobUpdateSchema = jobFields.extend({ status: z.enum(['open', 'closed']) }).partial();

export const jobQuerySchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  work_model: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  status: z.enum(['open', 'closed']).default('open'),
});
