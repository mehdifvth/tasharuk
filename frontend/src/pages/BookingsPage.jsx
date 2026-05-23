import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ReviewForm from '../components/reviews/ReviewForm';
import { useNavigate, useLocation } from 'react-router-dom';

const STATUS = {
  pending: { icon: 'fa-hourglass-half', text: 'En attente', bg: '#fef9c3', color: '#854d0e' },
  approved: { icon: 'fa-check-circle', text: 'Approuvée', bg: '#dcfce7', color: '#166534' },
  rejected: { icon: 'fa-times-circle', text: 'Rejetée', bg: '#fee2e2', color: '#991b1b' },
  completed: { icon: 'fa-flag-checkered', text: 'Terminée', bg: '#dbeafe', color: '#1e40af' },
  cancelled: { icon: 'fa-ban', text: 'Annulée', bg: '#f1f5f9', color: '#64748b' },
};

const BLOCKS = [
  { key: 'pending', label: 'En attente', color: '#f59e0b', bg: '#fef9c3', icon: 'fa-hourglass-half' },
  { key: 'approved', label: 'Approuvées', color: '#16a34a', bg: '#dcfce7', icon: 'fa-check-circle' },
  { key: 'completed', label: 'Terminées', color: '#2563eb', bg: '#dbeafe', icon: 'fa-flag-checkered' },
  { key: 'rejected', label: 'Rejetées / Annulées', color: '#dc2626', bg: '#fee2e2', icon: 'fa-times-circle' },
];

function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(startTime + 'Z')) / 1000);
      const d = Math.floor(diff / 86400);
      const hh = Math.floor((diff % 86400) / 3600);
      const mm = Math.floor((diff % 3600) / 60);
      const ss = diff % 60;
      setElapsed(d > 0
        ? `${d}j ${String(hh).padStart(2, '0')}h ${String(mm).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s`
        : `${String(hh).padStart(2, '0')}h ${String(mm).padStart(2, '0')}m ${String(ss).padStart(2, '0')}s`
      );
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [startTime]);
  return <span style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', fontSize: '1rem' }}><i className="fas fa-history me-1"></i> {elapsed}</span>;
}

function LivePrice({ startTime, pricePerHour }) {
  const [price, setPrice] = useState('0.00');
  useEffect(() => {
    const update = () => {
      const hours = (Date.now() - new Date(startTime + 'Z')) / 3600000;
      const p = hours * pricePerHour;
      setPrice(p.toFixed(2));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [startTime, pricePerHour]);
  return (
    <div>
      <span style={{ fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace', fontSize: '1.1rem' }}><i className="fas fa-coins me-1"></i> {price} MAD</span>
      <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.2rem 0 0' }}><i className="fas fa-info-circle me-1"></i> Facturation à l'heure ({parseFloat(pricePerHour).toFixed(2)} MAD/h)</p>
    </div>
  );
}

function CodeInput({ label, onSubmit, loading, error, placeholder = 'TAS-XXXX' }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ marginTop: '1rem', background: '#f8fafc', borderRadius: 12, padding: '1rem', border: '1px solid #e2e8f0' }}>
      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.6rem' }}>
        <i className="fas fa-key me-1" style={{ color: '#2563eb' }}></i>{label}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder={placeholder}
          maxLength={8}
          style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 3, padding: '0.6rem 0.85rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '1rem', textAlign: 'center' }}
        />
        <button
          disabled={loading || !code}
          onClick={() => onSubmit(code)}
          style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: 'none', background: code ? '#2563eb' : '#e2e8f0', color: code ? '#fff' : '#94a3b8', fontWeight: 700, cursor: code ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirmer'}
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.4rem' }}>{error}</p>}
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState(location.state?.block || 'pending');
  const [reviewFor, setReviewFor] = useState(null);
  const [actionLoad, setActionLoad] = useState(null);

  // Sync active block with navigation state (from notification clicks)
  useEffect(() => {
    if (location.state?.block) {
      setActiveBlock(location.state.block);
    }
  }, [location.state]);
  const [codeLoad, setCodeLoad] = useState(null);
  const [codeError, setCodeError] = useState({});
  const [error, setError] = useState(null);

  const loadBookings = useCallback(() => {
    setLoading(true);
    api.get('/bookings')
      .then(r => setBookings(r.data))
      .catch(() => setError('Impossible de charger les réservations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const handleApprove = async (id) => {
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/approve`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Rejeter cette réservation ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/reject`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/cancel`); loadBookings(); }
    catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setActionLoad(null); }
  };

  const handlePickup = async (id, code) => {
    setCodeLoad(id); setCodeError({});
    try { await api.post(`/bookings/${id}/confirm-pickup`, { code }); loadBookings(); }
    catch (err) { setCodeError(p => ({ ...p, [`pickup_${id}`]: err.response?.data?.message || 'Code incorrect' })); }
    finally { setCodeLoad(null); }
  };

  const handleReturn = async (id, code) => {
    setCodeLoad(id); setCodeError({});
    try { await api.post(`/bookings/${id}/confirm-return`, { code }); loadBookings(); }
    catch (err) { setCodeError(p => ({ ...p, [`return_${id}`]: err.response?.data?.message || 'Code incorrect' })); }
    finally { setCodeLoad(null); }
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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        <p style={{ marginTop: '0.75rem' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <style>{`
        .booking-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; padding: 1.25rem; transition: box-shadow 0.2s; }
        .booking-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .action-btn { padding: 0.45rem 1rem; border-radius: 8px; border: none; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.4rem; }
        @media (max-width: 768px) {
          .blocks-grid { grid-template-columns: repeat(2,1fr) !important; }
          .booking-inner { flex-direction: column !important; }
          .actions-col { flex-direction: row !important; flex-wrap: wrap !important; min-width: unset !important; }
        }
      `}</style>

      <div className="container" style={{ paddingTop: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>
            Mes Réservations
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
            {isOwnerRole ? <><i className="fas fa-tools me-2"></i>Vue Propriétaire</> : <><i className="fas fa-user me-2"></i>Vue Emprunteur</>}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.88rem' }}>
            <i className="fas fa-exclamation-circle me-1"></i>{error}
          </div>
        )}

        {/* Status blocks */}
        <div className="blocks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {BLOCKS.map(block => (
            <div
              key={block.key}
              onClick={() => setActiveBlock(block.key)}
              style={{
                background: activeBlock === block.key ? block.bg : '#fff',
                border: `2px solid ${activeBlock === block.key ? block.color : '#f1f5f9'}`,
                borderRadius: 14, padding: '1.1rem', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeBlock === block.key ? `0 4px 12px ${block.color}22` : 'none',
              }}
            >
              <i className={`fas ${block.icon}`} style={{ fontSize: '1.25rem', color: block.color, marginBottom: '0.4rem', display: 'block' }}></i>
              <p style={{ fontWeight: 800, fontSize: '1.5rem', color: block.color, margin: '0 0 0.2rem' }}>
                {groups[block.key].length}
              </p>
              <p style={{ fontWeight: 600, fontSize: '0.78rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {block.label}
              </p>
            </div>
          ))}
        </div>

        {/* List */}
        {groups[activeBlock]?.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '3rem', textAlign: 'center' }}>
            <i className="fas fa-inbox" style={{ fontSize: '2.5rem', color: '#e2e8f0', marginBottom: '0.75rem', display: 'block' }}></i>
            <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.25rem' }}>Aucune réservation</p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Aucune réservation dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {groups[activeBlock].map(b => {
              const isOwner = b.tool?.user_id === user?.id;
              const s = STATUS[b.status] || STATUS.pending;
              const hasReview = !!b.review;
              const isOverdue = b.picked_up_at && !b.returned_at && new Date() > new Date(b.end_date + 'Z');

              return (
                <div key={b.id} className="booking-card">

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.1rem', flexShrink: 0 }}>
                        <i className="fas fa-wrench"></i>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>{b.tool?.title}</p>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>#{b.id} · {b.tool?.category?.name}</p>
                      </div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className={`fas ${s.icon}`}></i> {s.text}
                    </span>
                  </div>

                  <div className="booking-inner" style={{ display: 'flex', gap: '1rem' }}>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 0.15rem', textTransform: 'uppercase' }}>Dates</p>
                          <p style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {new Date(b.start_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')} 
                              <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i> 
                              {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                          </p>

                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 0.15rem', textTransform: 'uppercase' }}>
                            {isOwner ? 'Emprunteur' : 'Propriétaire'}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600, margin: 0 }}>
                            {isOwner ? b.borrower?.name : b.tool?.user?.name}
                          </p>
                        </div>
                      </div>

                      {/* Code box owner */}
                      {isOwner && b.status === 'approved' && b.confirmation_code && (
                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.85rem', border: '1px dashed #93c5fd', textAlign: 'center', marginBottom: '0.75rem' }}>
                          {!b.picked_up_at ? (
                            <>
                              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-key"></i> Code de récupération
                              </p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.5rem', color: '#2563eb', margin: '0 0 0.2rem', letterSpacing: 4 }}>{b.confirmation_code}</p>
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>Donnez ce code à l'emprunteur</p>
                            </>
                          ) : b.return_code ? (
                            <>
                              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-key"></i> Code de retour
                              </p>
                              <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.5rem', color: '#16a34a', margin: '0 0 0.2rem', letterSpacing: 4 }}>{b.return_code}</p>
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>Donnez ce code à l'emprunteur lors du retour</p>
                            </>
                          ) : null}
                        </div>
                      )}

                      {/* Prix estimé avant pickup */}
                      {!b.picked_up_at && (b.status === 'approved' || b.status === 'pending') && (
                        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '0.6rem 0.75rem', marginBottom: '0.5rem' }}>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Prix estimé</p>
                          <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.1rem' }}>{parseFloat(b.display_total_price || 0).toFixed(2)} MAD</span>
                        </div>
                      )}

                      {/* Live price */}
                      {b.picked_up_at && !b.returned_at && (
                        <div style={{ background: isOverdue ? '#fef2f2' : '#fffbeb', borderRadius: 10, padding: '0.85rem', border: `1px solid ${isOverdue ? '#fca5a5' : '#fcd34d'}`, marginBottom: '0.5rem' }}>
                          {isOverdue && <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', margin: '0 0 0.4rem' }}><i className="fas fa-exclamation-triangle me-1"></i> Prolongation — date de fin dépassée</p>}
                          <div style={{ marginBottom: '0.4rem' }}><ElapsedTimer startTime={b.picked_up_at} /></div>
                          <LivePrice startTime={b.picked_up_at} pricePerHour={b.tool?.price || 0} />
                          {!isOverdue && (
                            <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, margin: '0.4rem 0 0' }}>
                              <i className="fas fa-check-circle me-1"></i> Retournez avant le {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Final price */}
                      {b.picked_up_at && b.returned_at && (
                        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.85rem', border: '1px solid #86efac' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Durée totale</p>
                              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.9rem' }}>
                                {(() => {
                                  const diff = Math.floor((new Date(b.returned_at) - new Date(b.picked_up_at)) / 1000);
                                  const h = Math.floor(diff / 3600);
                                  const m = Math.floor((diff % 3600) / 60);
                                  return `${h}h ${m}min`;
                                })()}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Prix final</p>
                              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#16a34a' }}>{parseFloat(b.display_final_price || 0).toFixed(2)} MAD</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="actions-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 140 }}>
                      {(b.status === 'approved' || b.status === 'pending') && (
                        <button className="action-btn" onClick={() => navigate(`/messages/${b.id}`)} style={{ background: '#f1f5f9', color: '#374151' }}>
                          <i className="fas fa-comments"></i> Chat
                        </button>
                      )}
                      {isOwner && b.status === 'pending' && (
                        <>
                          <button className="action-btn" disabled={actionLoad === b.id} onClick={() => handleApprove(b.id)} style={{ background: '#dcfce7', color: '#16a34a' }}>
                            {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check"></i> Approuver</>}
                          </button>
                          <button className="action-btn" disabled={actionLoad === b.id} onClick={() => handleReject(b.id)} style={{ background: '#fee2e2', color: '#dc2626' }}>
                            {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-times"></i> Rejeter</>}
                          </button>
                        </>
                      )}
                      {!isOwner && b.status === 'pending' && (
                        <button className="action-btn" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)} style={{ background: '#fee2e2', color: '#dc2626' }}>
                          {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-ban"></i> Annuler</>}
                        </button>
                      )}
                      {!isOwner && b.status === 'completed' && !hasReview && reviewFor !== b.id && (
                        <button className="action-btn" onClick={() => setReviewFor(b.id)} style={{ background: '#fef9c3', color: '#92400e' }}>
                          <i className="fas fa-star"></i> Avis
                        </button>
                      )}
                      {!isOwner && b.status === 'completed' && hasReview && (
                        <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="fas fa-check-circle"></i> {b.review.rating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code inputs */}
                  {!isOwner && b.status === 'approved' && !b.picked_up_at && (
                    <CodeInput label="Code de récupération" onSubmit={code => handlePickup(b.id, code)} loading={codeLoad === b.id} error={codeError[`pickup_${b.id}`]} placeholder="TAS-XXXX" />
                  )}
                  {!isOwner && b.status === 'approved' && b.picked_up_at && !b.returned_at && (
                    <CodeInput label="Code de retour" onSubmit={code => handleReturn(b.id, code)} loading={codeLoad === b.id} error={codeError[`return_${b.id}`]} placeholder="RET-XXXX" />
                  )}

                  {/* Review form */}
                  {reviewFor === b.id && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      <ReviewForm bookingId={b.id} onSuccess={() => { setReviewFor(null); loadBookings(); }} onCancel={() => setReviewFor(null)} />
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