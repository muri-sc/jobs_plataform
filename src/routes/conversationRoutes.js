import { Router } from 'express';
import * as controller from '../controllers/messageController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Cada conversa é identificada pelo id da candidatura
router.get('/', auth(), controller.listConversations);
router.get('/unread', auth(), controller.unreadCount);
router.get('/:applicationId/messages', auth(), controller.listMessages);
router.post('/:applicationId/messages', auth(), controller.send);

export default router;
