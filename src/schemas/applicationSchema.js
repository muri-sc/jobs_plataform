import { z } from 'zod';
import { idSchema } from './commonSchema.js';

export const applySchema = z.object({ job_id: idSchema });

export const applicationStatusSchema = z.object({
  status: z.enum(['submitted', 'reviewing', 'approved', 'rejected']),
});
