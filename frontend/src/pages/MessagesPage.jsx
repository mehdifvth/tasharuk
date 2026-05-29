// src/pages/MessagesPage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MessagesPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState(null);
  const bottomRef   = useRef(null);
  const intervalRef = useRef(null);
  const textareaRef = useRef(null);

  const loadMessages = useCallback(() => {
    api.get('/messages', { params: { booking_id: bookingId } })
      .then(r => { setMessages(r.data); setError(null); })
      .catch(err => { if (err.response?.status === 403) setError('Accès non autorisé à cette conversation.'); })
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => {
    intervalRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(intervalRef.current);
  }, [loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post('/messages', { booking_id: Number(bookingId), message: text.trim() });
      setText('');
      loadMessages();
      textareaRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  return (
    <>
      <style>{`
        .msg-wrap {
          max-width: 680px;
          margin: 0 auto;
          height: calc(100vh - 130px);
          display: flex;
          flex-direction: column;
        }
        .msg-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.4rem 0.85rem;
          color: #374151;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 1rem;
        }
        .msg-back:hover { border-color: #2563eb; color: #2563eb; }

        .msg-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        /* Chat header */
        .msg-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* Messages area */
        .msg-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: #f8fafc;
          scroll-behavior: smooth;
        }
        .msg-body::-webkit-scrollbar { width: 4px; }
        .msg-body::-webkit-scrollbar-track { background: transparent; }
        .msg-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* Bubble */
        .bubble-mine {
          align-self: flex-end;
          max-width: 72%;
        }
        .bubble-other {
          align-self: flex-start;
          max-width: 72%;
        }

        /* Input area */
        .msg-input-area {
          padding: 0.85rem 1.25rem;
          border-top: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .msg-textarea {
          flex: 1;
          resize: none;
          padding: 0.65rem 0.9rem;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.88rem;
          outline: none;
          line-height: 1.5;
          font-family: inherit;
          transition: border-color 0.15s;
          background: #f8fafc;
          color: #374151;
        }
        .msg-textarea:focus { border-color: #2563eb; background: #fff; }
        .msg-send {
          padding: 0.65rem 1rem;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
          align-self: flex-end;
        }

        .msg-hint {
          font-size: 0.68rem;
          color: #cbd5e1;
          margin: 0.3rem 0 0;
        }

        @media (max-width: 768px) {
          .msg-wrap { height: calc(100vh - 100px); }
          .bubble-mine, .bubble-other { max-width: 85%; }
          .msg-hint { display: none; }
        }
      `}</style>

      <div className="msg-wrap">
        {/* Back button */}
        <button className="msg-back" onClick={() => navigate('/bookings')}>
          <i className="fas fa-arrow-left"></i> Réservations
        </button>

        <div className="msg-card">
          {/* Header */}
          <div className="msg-header">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe, #eef2ff)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              <i className="fas fa-comments"></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>Conversation</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Réservation #{bookingId}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f0fdf4', padding: '0.25rem 0.65rem', borderRadius: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }}></div>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>En ligne</span>
            </div>
          </div>

          {/* Messages */}
          <div className="msg-body">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <i className="fas fa-circle-notch fa-spin" style={{ color: '#2563eb', fontSize: '1.5rem' }}></i>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <i className="fas fa-lock" style={{ color: '#dc2626', fontSize: '1.1rem' }}></i>
                </div>
                <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <i className="fas fa-comment-dots" style={{ fontSize: '1.75rem', color: '#cbd5e1' }}></i>
                </div>
                <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Aucun message</p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>Commencez la conversation !</p>
              </div>
            ) : messages.map(msg => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={isMine ? 'bubble-mine' : 'bubble-other'}>
                  {/* Sender name (other only) */}
                  {!isMine && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem', paddingLeft: 2 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{msg.sender?.name}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div style={{
                    padding: '0.65rem 0.95rem',
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMine ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : '#fff',
                    color: isMine ? '#fff' : '#1e293b',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    wordBreak: 'break-word',
                    boxShadow: isMine ? '0 4px 12px rgba(37,99,235,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                    border: isMine ? 'none' : '1px solid #f1f5f9',
                  }}>
                    {msg.message}
                  </div>

                  {/* Time */}
                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0.2rem 0 0', textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
                    {new Date(msg.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="msg-input-area">
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                rows={2}
                disabled={sending || !!error}
                className="msg-textarea"
              />
              <button
                type="submit"
                disabled={sending || !text.trim() || !!error}
                className="msg-send"
                style={{ background: text.trim() && !error ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : '#e2e8f0', color: text.trim() && !error ? '#fff' : '#94a3b8', boxShadow: text.trim() && !error ? '0 4px 12px rgba(37,99,235,0.25)' : 'none' }}
              >
                {sending
                  ? <i className="fas fa-spinner fa-spin"></i>
                  : <i className="fas fa-paper-plane"></i>
                }
              </button>
            </form>
            <p className="msg-hint">
              ↵ Envoyer · ⇧↵ Nouvelle ligne
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
