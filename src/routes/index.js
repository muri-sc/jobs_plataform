import { Router } from 'express';
import applicationRoutes from './applicationRoutes.js';
import authRoutes from './authRoutes.js';
import jobRoutes from './jobRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export default router;
