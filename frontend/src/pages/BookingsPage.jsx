// src/pages/BookingsPage.jsx
// FIX: b.review est maintenant chargé par le backend (avec(['review']))
// FIX: b.tool?.user?.name fonctionne car le backend charge tool.user

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
};

const STATUS_LABEL = {
  pending:   { icon: 'fa-hourglass-half', text: 'En attente' },
  approved:  { icon: 'fa-check-circle', text: 'Approuvée' },
  rejected:  { icon: 'fa-times-circle', text: 'Rejetée' },
  completed: { icon: 'fa-flag-checkered', text: 'Terminée' },
};

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings,    setBookings]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [tab,         setTab]        = useState('all');
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

  const filtered = bookings.filter((b) => {
    if (tab === 'as_owner')    return b.tool?.user_id === user?.id;
    if (tab === 'as_borrower') return b.borrower_id   === user?.id;
    return true;
  });

  const handleApprove = async (id) => {
    setActionLoad(id); setError(null);
    try {
      await api.put(`/bookings/${id}/approve`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoad(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rejeter cette réservation ?')) return;
    setActionLoad(id); setError(null);
    try {
      await api.put(`/bookings/${id}/reject`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setActionLoad(null);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '1.25rem' }}>
        <i className="fas fa-clipboard-list me-2 text-primary"></i>Mes Réservations
      </h1>

      {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

      {/* Onglets */}
      <div style={styles.tabs}>
        {[
          ['all',          'Toutes'],
          ['as_owner',     'Proprietaire'],
          ['as_borrower',  'Emprunteur'],
        ].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            style={{
              ...styles.tab,
              background: tab === val ? '#2563eb' : '#e2e8f0',
              color:      tab === val ? '#fff'    : '#374151',
            }}
          >
            {lbl}
            {val !== 'all' && (
              <span style={styles.count}>
                {bookings.filter(b =>
                  val === 'as_owner'
                    ? b.tool?.user_id === user?.id
                    : b.borrower_id === user?.id
                ).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="spinner">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
          Aucune réservation trouvée.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((b) => {
            const isOwner = b.tool?.user_id === user?.id;
            const badge   = STATUS_COLORS[b.status] || {};
            const hasReview = !!b.review; // FIX: b.review est chargé par le backend

            return (
              <div key={b.id} className="card" style={styles.bookingCard}>
                {/* Infos principales */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={styles.bookingHeader}>
                    <strong style={{ fontSize: '1rem' }}>{b.tool?.title}</strong>
                    <span style={{ ...styles.badge, ...badge }}>
                      <i className={`fas ${STATUS_LABEL[b.status]?.icon} me-1`}></i>
                      {STATUS_LABEL[b.status]?.text || b.status}
                    </span>
                  </div>
                  <p style={styles.meta}><i className="fas fa-calendar-alt me-1"></i> {b.start_date} → {b.end_date}</p>
                  <p style={styles.meta}>
                    {isOwner
                      ? <span><i className="fas fa-user me-1"></i> Emprunteur : {b.borrower?.name}</span>
                      : <span><i className="fas fa-wrench me-1"></i> Propriétaire : {b.tool?.user?.name}</span> /* FIX: tool.user chargé */
                    }
                  </p>
                  {b.tool?.category && (
                    <p style={{ ...styles.meta, color: '#94a3b8' }}>
                      <i className="fas fa-folder me-1"></i> {b.tool.category.name} · {b.tool.price} MAD/jour
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={styles.actionsCol}>
                  {/* Chat si pending ou approved */}
                  {(b.status === 'approved' || b.status === 'pending') && (
                    <button
                      className="btn-outline"
                      onClick={() => navigate(`/messages/${b.id}`)}
                    >
                      <i className="fas fa-comments me-1"></i> Chat
                    </button>
                  )}

                  {/* Actions propriétaire : approuver / rejeter */}
                  {isOwner && b.status === 'pending' && (
                    <>
                      <button
                        className="btn-success"
                        disabled={actionLoad === b.id}
                        onClick={() => handleApprove(b.id)}
                      >
                        {actionLoad === b.id ? '...' : <span><i className="fas fa-check me-1"></i> Approuver</span>}
                      </button>
                      <button
                        className="btn-danger"
                        disabled={actionLoad === b.id}
                        onClick={() => handleReject(b.id)}
                      >
                        {actionLoad === b.id ? '...' : <span><i className="fas fa-times me-1"></i> Rejeter</span>}
                      </button>
                    </>
                  )}

                  {/* Emprunteur : laisser un avis si completed ET pas encore reviewé */}
                  {!isOwner && b.status === 'completed' && !hasReview && reviewFor !== b.id && (
                    <button className="btn-primary" onClick={() => setReviewFor(b.id)}>
                      <i className="fas fa-star me-1"></i> Laisser un avis
                    </button>
                  )}

                  {/* Avis déjà donné */}
                  {!isOwner && b.status === 'completed' && hasReview && (
                    <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>
                      <i className="fas fa-check-circle me-1"></i> Avis donné ({b.review.rating}/5)
                    </span>
                  )}
                </div>

                {/* Formulaire d'avis inline */}
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
  );
}

const styles = {
  tabs:        { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab:         { borderRadius: 6, padding: '0.4rem 1rem', border: 'none', cursor: 'pointer',
                 fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  count:       { background: 'rgba(255,255,255,0.3)', borderRadius: 10, padding: '0 6px', fontSize: '0.78rem' },
  bookingCard: { display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  bookingHeader:{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' },
  badge:       { padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  meta:        { color: '#64748b', fontSize: '0.88rem', marginBottom: '0.2rem' },
  actionsCol:  { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 150 },
};
