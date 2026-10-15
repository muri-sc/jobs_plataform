import { Router } from 'express';
import * as controller from '../controllers/applicationController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth('dev'), controller.apply);
router.get('/me', auth('dev'), controller.listMine);
router.patch('/:id/status', auth('recruiter'), controller.updateStatus);

export default router;
