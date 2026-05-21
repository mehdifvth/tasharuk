// src/pages/BookingsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ReviewForm from '../components/reviews/ReviewForm';

const STATUS_COLORS = {
  pending:   { background: '#fef9c3', color: '#854d0e' },
  approved:  { background: '#dcfce7', color: '#166534' },
  rejected:  { background: '#fee2e2', color: '#991b1b' },
  completed: { background: '#dbeafe', color: '#1e40af' },
  cancelled: { background: '#f1f5f9', color: '#64748b' },
};

const STATUS_LABEL = {
  pending:   { icon: 'fa-hourglass-half', text: 'En attente' },
  approved:  { icon: 'fa-check-circle',   text: 'Approuvée' },
  rejected:  { icon: 'fa-times-circle',   text: 'Rejetée' },
  completed: { icon: 'fa-flag-checkered', text: 'Terminée' },
  cancelled: { icon: 'fa-ban',            text: 'Annulée' },
};

const BLOCKS = [
  { key: 'pending',   label: 'En attente',        emoji: '🟡', color: '#f59e0b', bg: '#fef9c3' },
  { key: 'approved',  label: 'Approuvées',         emoji: '🟢', color: '#16a34a', bg: '#dcfce7' },
  { key: 'completed', label: 'Terminées',           emoji: '🏁', color: '#2563eb', bg: '#dbeafe' },
  { key: 'rejected',  label: 'Rejetées / Annulées', emoji: '🔴', color: '#dc2626', bg: '#fee2e2' },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings,    setBookings]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [activeBlock, setActiveBlock]= useState('pending');
  const [reviewFor,   setReviewFor]  = useState(null);
  const [actionLoad,  setActionLoad] = useState(null);
  const [error,       setError]      = useState(null);

  const loadBookings = () => {
    setLoading(true);
    api.get('/bookings')
      .then((r) => setBookings(r.data))
      .catch(() => setError('Impossible de charger les réservations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, []);

  const handleApprove = async (id) => {
    setActionLoad(id); setError(null);
    try { await api.put(`/bookings/${id}/approve`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rejeter cette réservation ?')) return;
    setActionLoad(id); setError(null);
    try { await api.put(`/bookings/${id}/reject`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setActionLoad(id); setError(null);
    try { await api.put(`/bookings/${id}/cancel`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  // Filtrer selon le rôle
  const isOwnerRole = user?.role === 'owner';
  const myBookings  = isOwnerRole
    ? bookings.filter(b => b.tool?.user_id === user?.id)
    : bookings.filter(b => b.borrower_id  === user?.id);

  // Grouper
  const groups = {
    pending:   myBookings.filter(b => b.status === 'pending'),
    approved:  myBookings.filter(b => b.status === 'approved'),
    completed: myBookings.filter(b => b.status === 'completed'),
    rejected:  myBookings.filter(b => b.status === 'rejected' || b.status === 'cancelled'),
  };

  const activeList = groups[activeBlock] || [];

  if (loading) return <p className="spinner">Chargement...</p>;

  return (
    <div className="container">
      <h1 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        <i className="fas fa-clipboard-list me-2 text-primary"></i>Mes Réservations
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b', marginLeft: '0.75rem' }}>
          {isOwnerRole ? '🔧 Propriétaire' : '👤 Emprunteur'}
        </span>
      </h1>

      {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

      {/* 4 blocs statut */}
      <div style={styles.blocksGrid}>
        {BLOCKS.map(block => (
          <div
            key={block.key}
            onClick={() => setActiveBlock(block.key)}
            style={{
              ...styles.block,
              border: activeBlock === block.key
                ? `2px solid ${block.color}`
                : '2px solid transparent',
              background: activeBlock === block.key ? block.bg : '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{block.emoji}</span>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151', margin: '0.25rem 0 0' }}>
              {block.label}
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.5rem', color: block.color, margin: 0 }}>
              {groups[block.key].length}
            </p>
          </div>
        ))}
      </div>

      {/* Liste des réservations du bloc actif */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeList.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            Aucune réservation dans cette catégorie.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeList.map(b => {
              const isOwner   = b.tool?.user_id === user?.id;
              const badge     = STATUS_COLORS[b.status] || {};
              const hasReview = !!b.review;

              return (
                <div key={b.id} className="card" style={styles.bookingCard}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.bookingHeader}>
                      <strong>{b.tool?.title}</strong>
                      <span style={{ ...styles.badge, ...badge }}>
                        <i className={`fas ${STATUS_LABEL[b.status]?.icon} me-1`}></i>
                        {STATUS_LABEL[b.status]?.text || b.status}
                      </span>
                    </div>
                    <p style={styles.meta}><i className="fas fa-calendar-alt me-1"></i> {b.start_date} → {b.end_date}</p>
                    <p style={styles.meta}>
                      {isOwner
                        ? <span><i className="fas fa-user me-1"></i> Emprunteur : {b.borrower?.name}</span>
                        : <span><i className="fas fa-wrench me-1"></i> Propriétaire : {b.tool?.user?.name}</span>
                      }
                    </p>
                    {b.tool?.category && (
                      <p style={{ ...styles.meta, color: '#94a3b8' }}>
                        <i className="fas fa-folder me-1"></i> {b.tool.category.name} · {b.tool.price} MAD/jour
                      </p>
                    )}
                  </div>

                  <div style={styles.actionsCol}>
                    {(b.status === 'approved' || b.status === 'pending') && (
                      <button className="btn-outline" onClick={() => navigate(`/messages/${b.id}`)}>
                        <i className="fas fa-comments me-1"></i> Chat
                      </button>
                    )}
                    {isOwner && b.status === 'pending' && (
                      <>
                        <button className="btn-success" disabled={actionLoad === b.id} onClick={() => handleApprove(b.id)}>
                          {actionLoad === b.id ? '...' : <span><i className="fas fa-check me-1"></i> Approuver</span>}
                        </button>
                        <button className="btn-danger" disabled={actionLoad === b.id} onClick={() => handleReject(b.id)}>
                          {actionLoad === b.id ? '...' : <span><i className="fas fa-times me-1"></i> Rejeter</span>}
                        </button>
                      </>
                    )}
                    {!isOwner && b.status === 'pending' && (
                      <button className="btn-danger" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)}>
                        {actionLoad === b.id ? '...' : <span><i className="fas fa-ban me-1"></i> Annuler</span>}
                      </button>
                    )}
                    {!isOwner && b.status === 'completed' && !hasReview && reviewFor !== b.id && (
                      <button className="btn-primary" onClick={() => setReviewFor(b.id)}>
                        <i className="fas fa-star me-1"></i> Laisser un avis
                      </button>
                    )}
                    {!isOwner && b.status === 'completed' && hasReview && (
                      <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                        <i className="fas fa-check-circle me-1"></i> Avis donné ({b.review.rating}/5)
                      </span>
                    )}
                  </div>

                  {reviewFor === b.id && (
                    <div style={{ width: '100%', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                      <ReviewForm
                        bookingId={b.id}
                        onSuccess={() => { setReviewFor(null); loadBookings(); }}
                        onCancel={() => setReviewFor(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  blocksGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  block:        { borderRadius: 12, padding: '1.25rem', textAlign: 'center',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  bookingCard:  { display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  bookingHeader:{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' },
  badge:        { padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  meta:         { color: '#64748b', fontSize: '0.88rem', marginBottom: '0.2rem' },
  actionsCol:   { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 150 },
};