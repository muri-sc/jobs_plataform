import * as messageModel from '../models/messageModel.js';
import { idSchema } from '../schemas/commonSchema.js';
import { messageSchema, messagesQuerySchema } from '../schemas/messageSchema.js';
import { AppError } from '../utils/AppError.js';

// Carrega a conversa e garante que o usuário logado é o dev ou o dono da vaga
async function findConversationFor(applicationId, user) {
  const conversation = await messageModel.findConversation(applicationId);
  if (!conversation) throw new AppError('Conversa não encontrada', 404);

  const isDev = Number(conversation.dev_id) === user.id;
  const isRecruiter = Number(conversation.recruiter_id) === user.id;
  if (!isDev && !isRecruiter) throw new AppError('Acesso negado', 403);

  // Motivo pelo qual não é possível enviar mensagens (null = pode enviar)
  let blocked_reason = null;
  if (!conversation.recruiter_id) blocked_reason = 'Recrutador ainda não atribuído a esta vaga';
  else if (conversation.status === 'rejected') blocked_reason = 'Candidatura recusada';
  else if (conversation.job_status === 'closed') blocked_reason = 'Vaga fechada';

  return { ...conversation, blocked_reason };
}

export async function listConversations(req, res) {
  res.json(await messageModel.findConversationsByUser(req.user.id));
}

export async function unreadCount(req, res) {
  res.json({ unread: await messageModel.countUnread(req.user.id) });
}

export async function listMessages(req, res) {
  const applicationId = idSchema.parse(req.params.applicationId);
  const { after } = messagesQuerySchema.parse(req.query);
  const conversation = await findConversationFor(applicationId, req.user);

  await messageModel.markRead(applicationId, req.user.id);
  const messages = await messageModel.findByApplication(applicationId, after);
  res.json({ conversation, messages });
}

export async function send(req, res) {
  const applicationId = idSchema.parse(req.params.applicationId);
  const { body } = messageSchema.parse(req.body);
  const conversation = await findConversationFor(applicationId, req.user);
  if (conversation.blocked_reason) throw new AppError(conversation.blocked_reason, 409);

  res.status(201).json(await messageModel.create(applicationId, req.user.id, body));
}
