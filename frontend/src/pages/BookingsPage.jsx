// src/pages/BookingsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ReviewForm from '../components/reviews/ReviewForm';

const STATUS_COLORS = {
  pending: { background: '#fef9c3', color: '#854d0e' },
  approved: { background: '#dcfce7', color: '#166534' },
  rejected: { background: '#fee2e2', color: '#991b1b' },
  completed: { background: '#dbeafe', color: '#1e40af' },
  cancelled: { background: '#f1f5f9', color: '#64748b' },
};

const STATUS_LABEL = {
  pending: { icon: 'fa-hourglass-half', text: 'En attente' },
  approved: { icon: 'fa-check-circle', text: 'Approuvée' },
  rejected: { icon: 'fa-times-circle', text: 'Rejetée' },
  completed: { icon: 'fa-flag-checkered', text: 'Terminée' },
  cancelled: { icon: 'fa-ban', text: 'Annulée' },
};

const BLOCKS = [
  { key: 'pending', label: 'En attente', emoji: '🟡', color: '#f59e0b', bg: '#fef9c3' },
  { key: 'approved', label: 'Approuvées', emoji: '🟢', color: '#16a34a', bg: '#dcfce7' },
  { key: 'completed', label: 'Terminées', emoji: '🏁', color: '#2563eb', bg: '#dbeafe' },
  { key: 'rejected', label: 'Rejetées / Annulées', emoji: '🔴', color: '#dc2626', bg: '#fee2e2' },
];

// Timer component
function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(startTime + 'Z')) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.1rem', fontFamily: 'monospace' }}>
      ⏱ {elapsed}
    </span>
  );
}

function LivePrice({ startTime, pricePerDay }) {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const update = () => {
      const minutes = (Date.now() - new Date(startTime + 'Z')) / 60000;
      const pricePerMinute = pricePerDay / 24 / 60;
      setPrice((minutes * pricePerMinute).toFixed(2));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, pricePerDay]);

  return (
    <div>
      <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem', fontFamily: 'monospace' }}>
        💰 {price} MAD
      </span>
      {/* Ajouter ce commentaire */}
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
        ⚠️ Minimum 1 jour facturé ({pricePerDay} MAD) même en cas de retour anticipé
      </p>
    </div>
  );
}
// Code input component
// Composant CodeInput — ajouter prop `placeholder`
function CodeInput({ label, onSubmit, loading, error, placeholder = 'TAS-XXXX' }) {
  const [code, setCode] = useState('');

  return (
    <div style={{ marginTop: '0.75rem', background: '#f8fafc', borderRadius: 8, padding: '0.75rem' }}>
      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '0.5rem' }}>
        <i className="fas fa-key me-1 text-primary"></i>{label}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder={placeholder}   // ← dynamique
          style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }}
          maxLength={8}
        />
        <button
          className="btn-primary"
          disabled={loading || !code}
          onClick={() => onSubmit(code)}
          style={{ padding: '0.4rem 0.85rem' }}
        >
          {loading ? '...' : 'Confirmer'}
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.4rem' }}>{error}</p>}
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState('pending');
  const [reviewFor, setReviewFor] = useState(null);
  const [actionLoad, setActionLoad] = useState(null);
  const [codeLoad, setCodeLoad] = useState(null);
  const [codeError, setCodeError] = useState({});
  const [error, setError] = useState(null);

  const loadBookings = useCallback(() => {
    setLoading(true);
    api.get('/bookings')
      .then((r) => setBookings(r.data))
      .catch(() => setError('Impossible de charger les réservations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

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

  const handlePickup = async (id, code) => {
    setCodeLoad(id); setCodeError({});
    try {
      await api.post(`/bookings/${id}/confirm-pickup`, { code });
      loadBookings();
    } catch (err) {
      setCodeError(prev => ({ ...prev, [`pickup_${id}`]: err.response?.data?.message || 'Code incorrect' }));
    } finally { setCodeLoad(null); }
  };

  const handleReturn = async (id, code) => {
    setCodeLoad(id); setCodeError({});
    try {
      await api.post(`/bookings/${id}/confirm-return`, { code });
      loadBookings();
    } catch (err) {
      setCodeError(prev => ({ ...prev, [`return_${id}`]: err.response?.data?.message || 'Code incorrect' }));
    } finally { setCodeLoad(null); }
  };

  const isOwnerRole = user?.role === 'owner';
  const myBookings = isOwnerRole
    ? bookings.filter(b => b.tool?.user_id === user?.id)
    : bookings.filter(b => b.borrower_id === user?.id);

  const groups = {
    pending: myBookings.filter(b => b.status === 'pending'),
    approved: myBookings.filter(b => b.status === 'approved'),
    completed: myBookings.filter(b => b.status === 'completed'),
    rejected: myBookings.filter(b => b.status === 'rejected' || b.status === 'cancelled'),
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
              border: activeBlock === block.key ? `2px solid ${block.color}` : '2px solid transparent',
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

      {/* Liste */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeList.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            Aucune réservation dans cette catégorie.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeList.map(b => {
              const isOwner = b.tool?.user_id === user?.id;
              const badge = STATUS_COLORS[b.status] || {};
              const hasReview = !!b.review;

              return (
                <div key={b.id} className="card" style={{ padding: '1rem' }}>

                  {/* Header */}
                  <div style={styles.bookingHeader}>
                    <strong style={{ fontSize: '1rem' }}>{b.tool?.title}</strong>
                    <span style={{ ...styles.badge, ...badge }}>
                      <i className={`fas ${STATUS_LABEL[b.status]?.icon} me-1`}></i>
                      {STATUS_LABEL[b.status]?.text || b.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Infos */}
                    <div style={{ flex: 1, minWidth: 200 }}>
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

                      {/* Code affiché au propriétaire */}
                      {isOwner && b.status === 'approved' && b.confirmation_code && (
                        <div style={styles.codeBox}>
                          {/* Avant récupération : affiche confirmation_code */}
                          {!b.picked_up_at && (
                            <>
                              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Code de récupération :</p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.3rem', color: '#2563eb', margin: 0, letterSpacing: 3 }}>
                                {b.confirmation_code}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                                Donnez ce code à l'emprunteur pour qu'il récupère l'outil
                              </p>
                            </>
                          )}

                          {/* Après récupération : affiche return_code */}
                          {b.picked_up_at && !b.returned_at && b.return_code && (
                            <>
                              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Code de retour :</p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', margin: 0, letterSpacing: 3 }}>
                                {b.return_code}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                                Donnez ce code à l'emprunteur lors du retour
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      {/* Prix estimé avant pickup */}
                      {!b.picked_up_at && b.status === 'approved' && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.2rem' }}>Prix estimé :</p>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>{b.total_price} MAD</span>
                        </div>
                      )}

                      {/* Timer + prix en cours pendant l'emprunt */}
                      {b.picked_up_at && !b.returned_at && (
                        <div style={{ marginTop: '0.5rem', background: '#fffbeb', borderRadius: 8, padding: '0.6rem', border: '1px solid #fcd34d' }}>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.2rem' }}>Durée en cours :</p>
                          <ElapsedTimer startTime={b.picked_up_at} />
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.4rem 0 0.2rem' }}>Prix en cours :</p>
                          <LivePrice startTime={b.picked_up_at} pricePerDay={b.tool?.price || 0} />
                        </div>
                      )}

                      {/* Durée totale + prix final après retour */}
                      {b.picked_up_at && b.returned_at && (
                        <div style={{ marginTop: '0.5rem', background: '#f0fdf4', borderRadius: 8, padding: '0.6rem', border: '1px solid #86efac' }}>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.2rem' }}>Durée totale :</p>
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>
                            {(() => {
                              const diff = Math.floor((new Date(b.returned_at) - new Date(b.picked_up_at)) / 1000);
                              const h = Math.floor(diff / 3600);
                              const m = Math.floor((diff % 3600) / 60);
                              return `${h}h ${m}min`;
                            })()}
                          </span>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.4rem 0 0.2rem' }}>💳 Prix final :</p>
                          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#16a34a' }}>{b.final_price} MAD</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={styles.actionsCol}>
                      {(b.status === 'approved' || b.status === 'pending') && (
                        <button className="btn-outline" onClick={() => navigate(`/messages/${b.id}`)}>
                          <i className="fas fa-comments me-1"></i> Chat
                        </button>
                      )}

                      {/* Propriétaire : approuver/rejeter */}
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

                      {/* Emprunteur : annuler */}
                      {!isOwner && b.status === 'pending' && (
                        <button className="btn-danger" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)}>
                          {actionLoad === b.id ? '...' : <span><i className="fas fa-ban me-1"></i> Annuler</span>}
                        </button>
                      )}

                      {/* Avis */}
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
                  </div>

                  {/* Emprunteur — pickup */}
                  {!isOwner && b.status === 'approved' && !b.picked_up_at && (
                    <CodeInput
                      label="Tapez le code pour confirmer la récupération de l'outil"
                      onSubmit={(code) => handlePickup(b.id, code)}
                      loading={codeLoad === b.id}
                      error={codeError[`pickup_${b.id}`]}
                      placeholder="TAS-XXXX"   // ← code de récupération
                    />
                  )}

                  {/* Emprunteur — return */}
                  {!isOwner && b.status === 'approved' && b.picked_up_at && !b.returned_at && (
                    <CodeInput
                      label="Tapez le code pour confirmer le retour de l'outil"
                      onSubmit={(code) => handleReturn(b.id, code)}
                      loading={codeLoad === b.id}
                      error={codeError[`return_${b.id}`]}
                      placeholder="RET-XXXX"   // ← code de retour
                    />
                  )}
                  {/* Formulaire avis */}
                  {reviewFor === b.id && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
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
  blocksGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  block: {
    borderRadius: 12, padding: '1.25rem', textAlign: 'center',
    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  bookingHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
  badge: { padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  meta: { color: '#64748b', fontSize: '0.88rem', marginBottom: '0.2rem' },
  actionsCol: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 150 },
  codeBox: {
    marginTop: '0.75rem', background: '#eff6ff', borderRadius: 8, padding: '0.75rem',
    border: '1px dashed #93c5fd', textAlign: 'center'
  },
};