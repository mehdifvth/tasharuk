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
  const [showBorrowerReviews, setShowBorrowerReviews] = useState({}); // { bookingId: bool }

  const toggleBorrowerReviews = (id) => {
    setShowBorrowerReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    if (!window.confirm('Voulez-vous rejeter cette demande ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/reject`); loadBookings(); }
    catch (err) { setError('Erreur lors du rejet'); }
    finally { setActionLoad(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Voulez-vous annuler votre demande ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/cancel`); loadBookings(); }
    catch (err) { setError('Erreur lors de l\'annulation'); }
    finally { setActionLoad(null); }
  };

  const handlePickup = async (id, code) => {
    setCodeLoad(id);
    try {
      await api.post(`/bookings/${id}/confirm-pickup`, { code });
      loadBookings();
    } catch (err) {
      setCodeError(prev => ({ ...prev, [`pickup_${id}`]: err.response?.data?.message || 'Code incorrect' }));
    } finally { setCodeLoad(null); }
  };

  const handleReturn = async (id, code) => {
    setCodeLoad(id);
    try {
      await api.post(`/bookings/${id}/confirm-return`, { code });
      loadBookings();
    } catch (err) {
      setCodeError(prev => ({ ...prev, [`return_${id}`]: err.response?.data?.message || 'Code incorrect' }));
    } finally { setCodeLoad(null); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
    </div>
  );

  const filtered = bookings.filter(b => {
    if (activeBlock === 'pending') return b.status === 'pending';
    if (activeBlock === 'approved') return b.status === 'approved';
    if (activeBlock === 'completed') return b.status === 'completed';
    if (activeBlock === 'rejected') return b.status === 'rejected' || b.status === 'cancelled';
    return false;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: 1000, paddingTop: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontWeight: 850, fontSize: '1.75rem', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Mes Réservations</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.35rem' }}>Suivez vos locations en cours et l'historique de vos partages.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', padding: '0.4rem', borderRadius: 16, border: '1px solid #f1f5f9', marginBottom: '2rem', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {BLOCKS.map(b => (
            <button
              key={b.key}
              onClick={() => setActiveBlock(b.key)}
              style={{
                flex: 1, minWidth: '120px', padding: '0.7rem 1rem', borderRadius: 12, border: 'none',
                background: activeBlock === b.key ? b.bg : 'transparent',
                color: activeBlock === b.key ? b.color : '#64748b',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <i className={`fas ${b.icon}`} style={{ fontSize: '0.9rem', opacity: activeBlock === b.key ? 1 : 0.6 }}></i>
              {b.label}
              <span style={{ fontSize: '0.75rem', background: activeBlock === b.key ? 'rgba(0,0,0,0.08)' : '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 6, marginLeft: '0.2rem' }}>
                {bookings.filter(x => b.key === 'rejected' ? (x.status === 'rejected' || x.status === 'cancelled') : x.status === b.key).length}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', border: '1px solid #fca5a5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: '#fff', borderRadius: 24, border: '1px dashed #e2e8f0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className={`fas ${BLOCKS.find(b => b.key === activeBlock)?.icon}`} style={{ fontSize: '1.5rem', color: '#cbd5e1' }}></i>
            </div>
            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>Aucune réservation dans cette catégorie.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map(b => {
              const isOwner = user?.id === b.tool?.user_id;
              const s = STATUS[b.status];
              const myReview = b.reviews?.find(r => r.reviewer_id === user.id);
              const hasReview = !!myReview;
              const isOverdue = b.picked_up_at && !b.returned_at && new Date() > new Date(b.end_date + 'Z');

              return (
                <div key={b.id} style={{ background: '#fff', borderRadius: 20, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
                  
                  {/* Card Header */}
                  <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                        {b.tool?.image_url 
                          ? <img src={b.tool.image_url} alt={b.tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#cbd5e1' }}><i className="fas fa-wrench"></i></div>
                        }
                      </div>
                      <div>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                          <i className={`fas ${s.icon}`}></i> {s.text}
                        </span>
                        <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0 }}>{b.tool?.title || 'Outil supprimé'}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                            {isOwner ? (
                              <>
                                <i className="fas fa-user me-1"></i>Emprunteur : 
                                <strong 
                                  onClick={() => navigate(`/profile/${b.borrower_id}`, { state: { tab: 'reviews', reviewType: 'as_borrower' } })}
                                  style={{ color: '#2563eb', cursor: 'pointer', marginLeft: '0.3rem', textDecoration: 'underline' }}
                                >
                                  {b.borrower?.name}
                                </strong>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-user-tie me-1"></i>Propriétaire : 
                                <strong 
                                  onClick={() => navigate(`/profile/${b.tool?.user_id}`, { state: { tab: 'reviews', reviewType: 'as_owner' } })}
                                  style={{ color: '#2563eb', cursor: 'pointer', marginLeft: '0.3rem', textDecoration: 'underline' }}
                                >
                                  {b.tool?.user?.name}
                                </strong>
                              </>
                            )}
                          </p>
                          {isOwner && b.borrower?.borrower_rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#fef9c3', padding: '0.1rem 0.4rem', borderRadius: 6 }}>
                              <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.65rem' }}></i>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e' }}>{b.borrower.borrower_rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.25rem' }}>Période</p>
                      <p style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {new Date(b.start_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')} 
                          <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i> 
                          {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                      </p>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="card-middle" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      
                      {/* Price Section */}
                      {!b.picked_up_at && (b.status === 'approved' || b.status === 'pending') && (
                        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '0.6rem 0.75rem', marginBottom: '0.5rem' }}>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Prix estimé</p>
                          <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.1rem' }}>{parseFloat(b.display_total_price || 0).toFixed(2)} MAD</span>
                        </div>
                      )}

                      {/* Live price */}
                      {b.picked_up_at && !b.returned_at && (
                        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '0.6rem 0.75rem', border: '1px solid #fef3c7' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <div>
                               <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Temps écoulé</p>
                               <ElapsedTimer startTime={b.picked_up_at} />
                             </div>
                             <div style={{ textAlign: 'right' }}>
                               <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.15rem', textTransform: 'uppercase', fontWeight: 600 }}>Prix en cours</p>
                               <LivePrice startTime={b.picked_up_at} pricePerHour={b.tool?.price || 0} />
                             </div>
                          </div>
                          {isOverdue && <p style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.75rem', margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><i className="fas fa-exclamation-triangle"></i> PROLONGATION EN COURS</p>}
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
                      
                      {/* Review Section (Bidirectional) */}
                      {b.status === 'completed' && !hasReview && reviewFor !== b.id && (
                        <button className="action-btn" onClick={() => setReviewFor(b.id)} style={{ background: '#fef9c3', color: '#92400e' }}>
                          <i className="fas fa-star"></i> {isOwner ? 'Noter l\'emprunteur' : 'Laisser un avis'}
                        </button>
                      )}
                      {b.status === 'completed' && hasReview && (
                        <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Votre avis</p>
                            <span style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 800 }}>
                              <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.75rem' }}></i> {myReview.rating}/5
                            </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Borrower Reputation (Decision Support for Owner) */}
                  {isOwner && (b.status === 'pending' || b.status === 'approved') && b.borrower && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                <i className="fas fa-shield-check me-1" style={{ color: '#10b981' }}></i>Réputation de l'emprunteur
                            </h5>
                            {b.borrower.reviews_received?.length > 0 && (
                                <button 
                                    onClick={() => toggleBorrowerReviews(b.id)}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    {showBorrowerReviews[b.id] ? 'Masquer les avis' : `Voir les ${b.borrower.borrower_reviews_count} avis`}
                                </button>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                             <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ textAlign: 'center', borderRight: '1.5px solid #e2e8f0', paddingRight: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>{b.borrower.borrower_rating || 'N/A'}</span>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>NOTE MOYENNE</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                                        {b.borrower.borrower_reviews_count > 0 ? `${b.borrower.borrower_reviews_count} évaluation(s) reçue(s)` : "Aucune évaluation en tant qu'emprunteur"}
                                    </p>
                                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                        {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ fontSize: '0.65rem', color: i <= Math.round(b.borrower.borrower_rating || 0) ? '#f59e0b' : '#e2e8f0' }}></i>)}
                                    </div>
                                </div>
                             </div>
                        </div>

                        {showBorrowerReviews[b.id] && b.borrower.reviews_received?.length > 0 && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', borderRadius: 12, padding: '0.75rem', border: '1.5px dashed #e2e8f0' }}>
                                {b.borrower.reviews_received.map(rev => (
                                    <div key={rev.id} style={{ fontSize: '0.8rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: 700 }}>Note: {rev.rating}/5</span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic' }}>"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  )}

                  {/* Codes (Owner sees them, Borrower enters them) */}
                  {isOwner && b.status === 'approved' && (
                    <div style={{ marginTop: '1.25rem', background: '#eff6ff', borderRadius: 16, padding: '1rem 1.25rem', border: '1.5px solid #dbeafe', boxShadow: '0 4px 12px rgba(37,99,235,0.06)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              {b.picked_up_at ? 'Code de retour' : 'Code de récupération'}
                            </p>
                            <p style={{ margin: '0.3rem 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace', letterSpacing: 3 }}>
                              {b.picked_up_at ? b.return_code : b.confirmation_code}
                            </p>
                          </div>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(b.picked_up_at ? b.return_code : b.confirmation_code); alert('Code copié !'); }}
                            style={{ background: '#fff', border: '1px solid #dbeafe', width: 44, height: 44, borderRadius: 12, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Copier le code"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                       </div>
                       <p style={{ margin: '0.8rem 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className="fas fa-shield-halved" style={{ color: '#2563eb' }}></i>
                          Donnez ce code à l'emprunteur pour confirmer la {b.picked_up_at ? 'restitution' : 'réception'}.
                       </p>
                    </div>
                  )}

                  {!isOwner && b.status === 'approved' && !b.picked_up_at && (
                    <CodeInput label="Entrez le code de récupération" onSubmit={code => handlePickup(b.id, code)} loading={codeLoad === b.id} error={codeError[`pickup_${b.id}`]} placeholder="TAS-XXXX" />
                  )}
                  {!isOwner && b.status === 'approved' && b.picked_up_at && !b.returned_at && (
                    <CodeInput label="Entrez le code de retour" onSubmit={code => handleReturn(b.id, code)} loading={codeLoad === b.id} error={codeError[`return_${b.id}`]} placeholder="RET-XXXX" />
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

      <style>{`
        .card-top { flex-direction: row; }
        .action-btn {
          width: 100%; padding: 0.6rem; border: none; border-radius: 10px;
          font-weight: 700; font-size: 0.85rem; cursor: pointer;
          display: flex; alignItems: center; justifyContent: center; gap: 0.5rem;
          transition: transform 0.1s, opacity 0.15s;
        }
        .action-btn:active { transform: scale(0.97); }
        .action-btn:hover { opacity: 0.9; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 600px) {
          .card-top { flex-direction: column !important; align-items: flex-start !important; }
          .card-top > div:last-child { text-align: left !important; }
          .actions-col { width: 100% !important; flex-direction: row !important; }
          .action-btn { flex: 1; }
        }
      `}</style>
    </div>
  );
}