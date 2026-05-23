import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function MessagesPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const bottomRef  = useRef(null);
  const intervalRef = useRef(null);

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
      setText(''); loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="container" style={{ maxWidth: 680, paddingTop: '1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/bookings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.45rem 0.9rem', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <i className="fas fa-arrow-left"></i> Retour
          </button>
          <Logo size={28} showText={false} />
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              <i className="fas fa-comments"></i>
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>Conversation</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>Réservation #{bookingId}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }}></div>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>En ligne</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding: '1.25rem', minHeight: 380, maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#fafafa' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <i className="fas fa-spinner fa-spin" style={{ color: '#2563eb', fontSize: '1.5rem' }}></i>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', color: '#dc2626', padding: '2rem', fontSize: '0.88rem' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
                {error}
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-comment-dots" style={{ fontSize: '2.5rem', color: '#e2e8f0', marginBottom: '0.75rem' }}></i>
                <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>Aucun message</p>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Commencez la conversation !</p>
              </div>
            ) : messages.map(msg => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', maxWidth: '78%', alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
                  {!isMine && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', paddingLeft: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{msg.sender?.name}</span>
                    </div>
                  )}
                  <div style={{ padding: '0.65rem 1rem', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? '#2563eb' : '#fff', color: isMine ? '#fff' : '#1e293b', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: isMine ? 'none' : '1px solid #f1f5f9' }}>
                    {msg.message}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.25rem 0 0', paddingLeft: 4, paddingRight: 4 }}>
                    {new Date(msg.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message... (Entrée pour envoyer)"
                rows={2}
                disabled={sending || !!error}
                style={{ flex: 1, resize: 'none', padding: '0.65rem 0.9rem', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', lineHeight: 1.5, fontFamily: 'inherit' }}
              />
              <button
                type="submit"
                disabled={sending || !text.trim() || !!error}
                style={{ padding: '0.65rem 1.1rem', borderRadius: 12, border: 'none', background: text.trim() ? '#2563eb' : '#e2e8f0', color: text.trim() ? '#fff' : '#94a3b8', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, alignSelf: 'flex-end' }}
              >
                {sending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              </button>
            </form>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.35rem 0 0', paddingLeft: 2 }}>
              Entrée pour envoyer · Maj+Entrée pour saut de ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}