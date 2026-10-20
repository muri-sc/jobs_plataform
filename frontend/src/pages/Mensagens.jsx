import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import * as conversationsApi from '../api/conversations';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../utils/errors';
import { formatDateTime } from '../utils/format';

const THREAD_POLL_MS = 5000;
const LIST_POLL_MS = 30000;

export default function Mensagens() {
  const { applicationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadConversations() {
    try {
      setConversations(await conversationsApi.listConversations());
      setError('');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    const timer = setInterval(loadConversations, LIST_POLL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`page chat${applicationId ? ' chat--open' : ''}`}>
      <header className="page-header">
        <h1>Mensagens</h1>
        <p className="muted">Converse sobre as candidaturas em andamento.</p>
      </header>

      <Alert>{error}</Alert>

      <div className="chat-layout panel">
        <aside className="chat-list" aria-label="Conversas">
          {loading ? (
            <p className="muted chat-list__empty">Carregando…</p>
          ) : conversations.length === 0 ? (
            <p className="muted chat-list__empty">
              Nenhuma conversa ainda. Use o botão “Conversar” em uma candidatura.
            </p>
          ) : (
            conversations.map((c) => (
              <NavLink
                key={c.application_id}
                to={`/mensagens/${c.application_id}`}
                className="chat-list__item"
              >
                <span className="chat-list__top">
                  <strong>{c.other_name || 'Recrutador'}</strong>
                  {c.unread > 0 && <span className="badge">{c.unread}</span>}
                </span>
                <span className="chat-list__job">
                  {c.title} · {c.company}
                </span>
                <span className="chat-list__preview">{c.last_message}</span>
              </NavLink>
            ))
          )}
        </aside>

        {applicationId ? (
          <Thread
            key={applicationId}
            applicationId={applicationId}
            onActivity={loadConversations}
          />
        ) : (
          <div className="chat-thread chat-thread--empty">
            <p className="muted">Selecione uma conversa.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Thread({ applicationId, onActivity }) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const lastIdRef = useRef(null);
  const bottomRef = useRef(null);

  function append(incoming) {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const known = new Set(prev.map((m) => String(m.id)));
      return [...prev, ...incoming.filter((m) => !known.has(String(m.id)))];
    });
    lastIdRef.current = incoming[incoming.length - 1].id;
  }

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await conversationsApi.listMessages(applicationId, lastIdRef.current);
        if (!active) return;
        setConversation(data.conversation);
        // Mensagens novas do outro lado mudam a lista (preview e não lidas)
        if (data.messages.length > 0 && lastIdRef.current) onActivity();
        append(data.messages);
        setError('');
      } catch (err) {
        if (active) setError(formatApiError(err));
      }
    }

    poll();
    const timer = setInterval(poll, THREAD_POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError('');
    try {
      const message = await conversationsApi.sendMessage(applicationId, body);
      append([message]);
      setDraft('');
      onActivity();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSending(false);
    }
  }

  const isDev = user?.role === 'dev';
  const otherName = conversation
    ? isDev
      ? conversation.recruiter_name || 'Recrutador'
      : conversation.dev_name
    : '';

  return (
    <div className="chat-thread">
      <header className="chat-thread__header">
        <Link className="back-link chat-thread__back" to="/mensagens">
          ← Conversas
        </Link>
        {conversation && (
          <>
            <h2>{otherName}</h2>
            <p className="muted">
              {conversation.title} · {conversation.company}
            </p>
          </>
        )}
      </header>

      <div className="chat-thread__messages">
        {conversation && messages.length === 0 && (
          <p className="muted chat-thread__hint">
            Nenhuma mensagem ainda. Comece a conversa!
          </p>
        )}
        {messages.map((m) => {
          const mine = String(m.sender_id) === String(user?.id);
          return (
            <div key={m.id} className={`bubble${mine ? ' bubble--mine' : ''}`}>
              <p className="pre-wrap">{m.body}</p>
              <time dateTime={m.created_at}>{formatDateTime(m.created_at)}</time>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <Alert>{error}</Alert>

      {conversation?.blocked_reason ? (
        <p className="chat-thread__blocked">
          {conversation.blocked_reason}. Não é possível enviar novas mensagens.
        </p>
      ) : (
        <form className="chat-thread__form" onSubmit={handleSubmit}>
          <textarea
            rows={2}
            maxLength={2000}
            placeholder="Escreva uma mensagem…"
            value={draft}
            disabled={!conversation}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia, Shift+Enter quebra linha
              if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e);
            }}
            aria-label="Mensagem"
          />
          <button
            className="btn btn--primary"
            type="submit"
            disabled={sending || !draft.trim() || !conversation}
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  );
}
