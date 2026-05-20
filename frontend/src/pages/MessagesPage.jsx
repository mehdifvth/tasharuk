// src/pages/MessagesPage.jsx
// FIX: cleanup correct du setInterval + gestion erreur accès non autorisé

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MessagesPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState(null);
  const bottomRef   = useRef(null);
  const intervalRef = useRef(null);

  const loadMessages = useCallback(() => {
    api.get('/messages', { params: { booking_id: bookingId } })
      .then((r) => {
        setMessages(r.data);
        setError(null);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Vous n\'êtes pas autorisé à accéder à cette conversation.');
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Chargement initial
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Polling toutes les 5 secondes
  useEffect(() => {
    intervalRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(intervalRef.current); // cleanup au unmount
  }, [loadMessages]);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post('/messages', {
        booking_id: Number(bookingId),
        message:    text.trim(),
      });
      setText('');
      loadMessages(); // rechargement immédiat après envoi
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  // Envoi avec Enter (Shift+Enter = saut de ligne)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <button
        onClick={() => navigate('/bookings')}
        style={{ background: 'none', color: '#2563eb', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}
      >
        ← Retour aux réservations
      </button>

      <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>
        <i className="fas fa-comments me-2"></i>Conversation — Réservation #{bookingId}
      </h2>

      {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

      {/* Zone de messages */}
      <div style={styles.chatBox}>
        {loading ? (
          <p className="spinner">Chargement des messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
            Aucun message pour l'instant.<br />
            <span style={{ fontSize: '0.85rem' }}>Commencez la conversation !</span>
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{
                ...styles.bubble,
                alignSelf: isMine ? 'flex-end' : 'flex-start',
              }}>
                {!isMine && (
                  <p style={styles.sender}>{msg.sender?.name}</p>
                )}
                <div style={{
                  ...styles.msgBox,
                  background: isMine ? '#2563eb' : '#f1f5f9',
                  color:      isMine ? '#fff'    : '#1e293b',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}>
                  {msg.message}
                </div>
                <p style={{ ...styles.time, textAlign: isMine ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleString('fr-FR', {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
                  })}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend} style={styles.inputRow}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={2}
          style={{ flex: 1, resize: 'none' }}
          disabled={sending || !!error}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={sending || !text.trim() || !!error}
          style={{ alignSelf: 'flex-end', padding: '0.6rem 1.25rem' }}
        >
          {sending ? '...' : '➤ Envoyer'}
        </button>
      </form>
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
        Entrée pour envoyer · Maj+Entrée pour un saut de ligne
      </p>
    </div>
  );
}

const styles = {
  chatBox:  {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
    padding: '1.25rem', minHeight: 400, maxHeight: 500, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
  },
  bubble:   { display: 'flex', flexDirection: 'column', maxWidth: '75%' },
  sender:   { fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem', fontWeight: 600, paddingLeft: 4 },
  msgBox:   { padding: '0.6rem 1rem', fontSize: '0.95rem', lineHeight: 1.5, wordBreak: 'break-word' },
  time:     { fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem', paddingLeft: 4, paddingRight: 4 },
  inputRow: { display: 'flex', gap: '0.75rem', marginTop: '0.85rem', alignItems: 'flex-end' },
};
