import { Router } from 'express';
import * as applicationController from '../controllers/applicationController.js';
import * as jobController from '../controllers/jobController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Públicas (/mine vem antes de /:id)
router.get('/', jobController.list);
router.get('/mine', auth('recruiter'), jobController.listMine);
router.get('/:id', jobController.getOne);

// Somente recruiter
router.post('/', auth('recruiter'), jobController.create);
router.patch('/:id', auth('recruiter'), jobController.update);
router.delete('/:id', auth('recruiter'), jobController.remove);
router.get('/:id/applications', auth('recruiter'), applicationController.listByJob);

export default router;
