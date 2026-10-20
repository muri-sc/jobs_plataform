import { request } from './client';

export function listConversations() {
  return request('/conversations');
}

export function getUnreadCount() {
  return request('/conversations/unread');
}

/** after = id da última mensagem já carregada (polling incremental). */
export function listMessages(applicationId, after) {
  const qs = after ? `?after=${after}` : '';
  return request(`/conversations/${applicationId}/messages${qs}`);
}

export function sendMessage(applicationId, body) {
  return request(`/conversations/${applicationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}
