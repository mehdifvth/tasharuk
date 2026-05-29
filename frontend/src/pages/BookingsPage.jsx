// src/pages/BookingsPage.jsx
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
  return (
    <span style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', fontSize: '0.95rem' }}>
      <i className="fas fa-stopwatch me-1"></i>{elapsed}
    </span>
  );
}

function LivePrice({ startTime, pricePerHour }) {
  const [price, setPrice] = useState('0.00');
  useEffect(() => {
    const update = () => {
      const hours = (Date.now() - new Date(startTime + 'Z')) / 3600000;
      setPrice((hours * pricePerHour).toFixed(2));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [startTime, pricePerHour]);
  return (
    <span style={{ fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace', fontSize: '1rem' }}>
      <i className="fas fa-coins me-1"></i>{price} MAD
    </span>
  );
}

function CodeInput({ label, onSubmit, loading, error, placeholder = 'TAS-XXXX' }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ marginTop: '1rem', background: '#f8fafc', borderRadius: 12, padding: '1rem', border: '1px solid #e2e8f0' }}>
      <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <i className="fas fa-key" style={{ color: '#2563eb' }}></i>{label}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder={placeholder}
          maxLength={8}
          style={{ flex: 1, fontFamily: 'monospace', fontWeight: 800, letterSpacing: 4, padding: '0.65rem 0.85rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '1rem', textAlign: 'center', outline: 'none', transition: 'border-color 0.15s' }}
        />
        <button
          disabled={loading || !code}
          onClick={() => onSubmit(code)}
          style={{ padding: '0.65rem 1.1rem', borderRadius: 8, border: 'none', background: code ? '#2563eb' : '#e2e8f0', color: code ? '#fff' : '#94a3b8', fontWeight: 700, cursor: code ? 'pointer' : 'not-allowed', transition: 'all 0.15s', fontSize: '0.85rem' }}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirmer'}
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>{error}</p>}
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
  const [codeLoad, setCodeLoad] = useState(null);
  const [codeError, setCodeError] = useState({});
  const [error, setError] = useState(null);
  const [showBorrowerReviews, setShowBorrowerReviews] = useState({});

  useEffect(() => {
    if (location.state?.block) setActiveBlock(location.state.block);
  }, [location.state]);

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
    if (!window.confirm('Rejeter cette demande ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/reject`); loadBookings(); }
    catch { setError('Erreur lors du rejet'); }
    finally { setActionLoad(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler votre demande ?')) return;
    setActionLoad(id);
    try { await api.put(`/bookings/${id}/cancel`); loadBookings(); }
    catch { setError('Erreur lors de l\'annulation'); }
    finally { setActionLoad(null); }
  };

  const handlePickup = async (id, code) => {
    setCodeLoad(id);
    try { await api.post(`/bookings/${id}/confirm-pickup`, { code }); loadBookings(); }
    catch (err) { setCodeError(p => ({ ...p, [`pickup_${id}`]: err.response?.data?.message || 'Code incorrect' })); }
    finally { setCodeLoad(null); }
  };

  const handleReturn = async (id, code) => {
    setCodeLoad(id);
    try { await api.post(`/bookings/${id}/confirm-return`, { code }); loadBookings(); }
    catch (err) { setCodeError(p => ({ ...p, [`return_${id}`]: err.response?.data?.message || 'Code incorrect' })); }
    finally { setCodeLoad(null); }
  };

  const filtered = bookings.filter(b => {
    if (activeBlock === 'pending') return b.status === 'pending';
    if (activeBlock === 'approved') return b.status === 'approved';
    if (activeBlock === 'completed') return b.status === 'completed';
    if (activeBlock === 'rejected') return b.status === 'rejected' || b.status === 'cancelled';
    return false;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
      <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
    </div>
  );

  return (
    <>
      <style>{`
        /* ── Tabs Navigation ── */
        .bp-tabs-container {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f8fafc;
          margin: 0 -1rem 1.5rem;
          padding: 0.5rem 1rem;
        }

        .bp-tabs-scroll-area {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* Subtle gradient to show there is more content */
        .bp-tabs-scroll-area::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 50px;
          background: linear-gradient(to left, #f8fafc, transparent);
          pointer-events: none;
          z-index: 2;
          border-radius: 0 18px 18px 0;
        }

        @media (min-width: 769px) {
          .bp-tabs-scroll-area::after { display: none; }
        }
        
        .bp-tabs { 
          display: flex; 
          gap: 0.5rem; 
          background: #fff; 
          padding: 0.4rem; 
          border-radius: 18px; 
          border: 1.5px solid #e2e8f0; 
          overflow-x: auto;
          scrollbar-width: none; 
          -ms-overflow-style: none;
          width: 100%;
          scroll-behavior: smooth;
        }
        .bp-tabs::-webkit-scrollbar { display: none; }

        /* Animated Arrow Hint */
        .bp-scroll-hint {
          position: absolute;
          right: 12px;
          width: 28px;
          height: 28px;
          background: #2563eb;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          z-index: 3;
          box-shadow: 0 4px 10px rgba(37,99,235,0.3);
          animation: slideHint 1.5s infinite;
          pointer-events: none;
        }

        @keyframes slideHint {
          0% { transform: translateX(0); opacity: 0.2; }
          50% { transform: translateX(-8px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.2; }
        }

        @media (min-width: 769px) {
          .bp-scroll-hint { display: none; }
        }

        .bp-tab { 
          flex: 0 0 auto;
          padding: 0.7rem 1.25rem; 
          border-radius: 14px; 
          border: none; 
          font-weight: 700; 
          font-size: 0.85rem; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 0.6rem; 
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
          color: #64748b;
          background: transparent;
          white-space: nowrap;
        }
        .bp-tab:hover:not(.active) {
          background: #f1f5f9;
          color: #0f172a;
        }
        .bp-tab.active {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* ── Card ── */
        .bp-card { background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 1rem; }
        .bp-card-header { padding: 1.1rem 1.25rem; border-bottom: 1px solid #f8fafc; display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap; }
        .bp-card-body { padding: 1.1rem 1.25rem; }

        /* Action buttons */
        .act-btn { padding: 0.55rem 0.85rem; border-radius: 9px; border: none; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem; transition: all 0.15s; white-space: nowrap; }
        .act-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .act-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Price boxes */
        .price-box { border-radius: 10px; padding: 0.75rem 1rem; }

        /* Code box owner */
        .code-owner-box { background: linear-gradient(135deg, #eff6ff, #eef2ff); border-radius: 14px; padding: 1rem 1.25rem; border: 1.5px solid #dbeafe; margin-top: 1rem; }

        /* Responsive */
        @media (max-width: 600px) {
          .bp-card-header { flex-direction: column; }
          .bp-card-header .period { text-align: left !important; }
          .bp-body-inner { flex-direction: column !important; }
          .bp-actions { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; }
          .act-btn { flex: 1; min-width: 80px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 850, fontSize: '1.6rem', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Mes Réservations</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.35rem 0 0', fontWeight: 500 }}>
          Gérez vos locations et l'historique de vos partages.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bp-tabs-container">
        <div className="bp-tabs-scroll-area">
          <div className="bp-tabs" id="bp-tabs-scroll" onScroll={(e) => {
            const hint = e.currentTarget.parentElement.querySelector('.bp-scroll-hint');
            if (hint) hint.style.opacity = e.currentTarget.scrollLeft > 20 ? '0' : '1';
          }}>
            {BLOCKS.map(b => {
              const count = bookings.filter(x => b.key === 'rejected' ? (x.status === 'rejected' || x.status === 'cancelled') : x.status === b.key).length;
              const isActive = activeBlock === b.key;
              return (
                <button
                  key={b.key}
                  className={`bp-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveBlock(b.key)}
                  style={{
                    background: isActive ? b.bg : 'transparent',
                    color: isActive ? b.color : '#64748b'
                  }}
                >
                  <i className={`fas ${b.icon}`} style={{ fontSize: '0.9rem' }}></i>
                  <span>{b.label}</span>
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.5)' : '#f1f5f9',
                    color: isActive ? b.color : '#94a3b8',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    marginLeft: '2px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="bp-scroll-hint">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1rem', border: '1px solid #fca5a5', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <i className={`fas ${BLOCKS.find(b => b.key === activeBlock)?.icon}`} style={{ fontSize: '1.5rem', color: '#cbd5e1' }}></i>
          </div>
          <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.92rem', margin: 0 }}>
            Aucune réservation dans cette catégorie.
          </p>
        </div>
      ) : (
        <div>
          {filtered.map(b => {
            const isOwner = user?.id === b.tool?.user_id;
            const s = STATUS[b.status];
            const myReview = b.reviews?.find(r => r.reviewer_id === user.id);
            const hasReview = !!myReview;
            const isOverdue = b.picked_up_at && !b.returned_at && new Date() > new Date(b.end_date + 'Z');

            return (
              <div key={b.id} className="bp-card">

                {/* Card Header */}
                <div className="bp-card-header">
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    {/* Tool image */}
                    <div style={{ width: 58, height: 58, borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                      {b.tool?.image_url
                        ? <img src={b.tool.image_url} alt={b.tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#cbd5e1' }}><i className="fas fa-wrench"></i></div>
                      }
                    </div>

                    <div style={{ minWidth: 0 }}>
                      {/* Status badge */}
                      <span style={{ padding: '0.18rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                        <i className={`fas ${s.icon}`} style={{ fontSize: '0.65rem' }}></i>{s.text}
                      </span>
                      {/* Title */}
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.tool?.title || 'Outil supprimé'}
                      </h4>
                      {/* User link */}
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <i className={`fas ${isOwner ? 'fa-user' : 'fa-user-tie'}`} style={{ fontSize: '0.7rem' }}></i>
                        {isOwner ? 'Emprunteur :' : 'Propriétaire :'}
                        <strong
                          onClick={() => navigate(`/profile/${isOwner ? b.borrower_id : b.tool?.user_id}`)}
                          style={{ color: '#2563eb', cursor: 'pointer' }}
                        >
                          {isOwner ? b.borrower?.name : b.tool?.user?.name}
                        </strong>
                        {isOwner && b.borrower?.borrower_rating > 0 && (
                          <span style={{ background: '#fef9c3', color: '#854d0e', padding: '0.1rem 0.4rem', borderRadius: 6, fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <i className="fas fa-star" style={{ fontSize: '0.6rem', color: '#f59e0b' }}></i>
                            {b.borrower.borrower_rating}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Period */}
                  <div className="period" style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.2rem' }}>Période</p>
                    <p style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600, margin: 0 }}>
                      {new Date(b.start_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      <i className="fas fa-arrow-down" style={{ fontSize: '0.6rem' }}></i>
                      {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="bp-card-body">
                  <div className="bp-body-inner" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

                    {/* Price section */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Estimated price */}
                      {!b.picked_up_at && (b.status === 'approved' || b.status === 'pending') && (
                        <div className="price-box" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                          <p style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.2rem' }}>Prix estimé</p>
                          <span style={{ fontWeight: 900, color: '#1e40af', fontSize: '1.15rem' }}>
                            {parseFloat(b.display_total_price || 0).toFixed(2)} MAD
                          </span>
                        </div>
                      )}

                      {/* Live price */}
                      {b.picked_up_at && !b.returned_at && (
                        <div className="price-box" style={{ background: isOverdue ? '#fff1f2' : '#fffbeb', border: `1px solid ${isOverdue ? '#fecdd3' : '#fef3c7'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>Temps écoulé</p>
                              <ElapsedTimer startTime={b.picked_up_at} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>Prix en cours</p>
                              <LivePrice startTime={b.picked_up_at} pricePerHour={b.tool?.price || 0} />
                            </div>
                          </div>
                          {isOverdue ? (
                            <p style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.72rem', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className="fas fa-triangle-exclamation"></i> PROLONGATION EN COURS
                            </p>
                          ) : (
                            <p style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className="fas fa-circle-check"></i>
                              Retour avant le {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Final price */}
                      {b.picked_up_at && b.returned_at && (
                        <div className="price-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>Durée totale</p>
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
                              <p style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.2rem' }}>Prix final</p>
                              <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#16a34a' }}>
                                {parseFloat(b.display_final_price || 0).toFixed(2)} MAD
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="bp-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 130 }}>
                      {(b.status === 'approved' || b.status === 'pending') && (
                        <button className="act-btn" onClick={() => navigate(`/messages/${b.id}`)} style={{ background: '#f1f5f9', color: '#374151' }}>
                          <i className="fas fa-comments"></i> Chat
                        </button>
                      )}
                      {isOwner && b.status === 'pending' && (
                        <>
                          <button className="act-btn" disabled={actionLoad === b.id} onClick={() => handleApprove(b.id)} style={{ background: '#dcfce7', color: '#16a34a' }}>
                            {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check"></i> Approuver</>}
                          </button>
                          <button className="act-btn" disabled={actionLoad === b.id} onClick={() => handleReject(b.id)} style={{ background: '#fee2e2', color: '#dc2626' }}>
                            {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-times"></i> Rejeter</>}
                          </button>
                        </>
                      )}
                      {!isOwner && b.status === 'pending' && (
                        <button className="act-btn" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)} style={{ background: '#fee2e2', color: '#dc2626' }}>
                          {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-ban"></i> Annuler</>}
                        </button>
                      )}
                      {b.status === 'completed' && !hasReview && reviewFor !== b.id && (
                        <button className="act-btn" onClick={() => setReviewFor(b.id)} style={{ background: '#fef9c3', color: '#92400e' }}>
                          <i className="fas fa-star"></i> {isOwner ? 'Noter' : 'Avis'}
                        </button>
                      )}
                      {b.status === 'completed' && hasReview && (
                        <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: 8, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Votre avis</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center', marginTop: '0.15rem' }}>
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className="fas fa-star" style={{ fontSize: '0.65rem', color: i < myReview.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Borrower reputation */}
                  {isOwner && (b.status === 'pending' || b.status === 'approved') && b.borrower && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fas fa-shield-halved" style={{ color: '#10b981' }}></i> Réputation emprunteur
                        </p>
                        {b.borrower.reviews_received?.length > 0 && (
                          <button
                            onClick={() => setShowBorrowerReviews(p => ({ ...p, [b.id]: !p[b.id] }))}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {showBorrowerReviews[b.id] ? 'Masquer' : `${b.borrower.borrower_reviews_count} avis`}
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.85rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ textAlign: 'center', paddingRight: '0.75rem', borderRight: '1px solid #e2e8f0' }}>
                          <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>{b.borrower.borrower_rating || 'N/A'}</p>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <i key={i} className="fas fa-star" style={{ fontSize: '0.6rem', color: i <= Math.round(b.borrower.borrower_rating || 0) ? '#f59e0b' : '#e2e8f0' }}></i>
                            ))}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                          {b.borrower.borrower_reviews_count > 0
                            ? `${b.borrower.borrower_reviews_count} évaluation(s)`
                            : 'Aucune évaluation'
                          }
                        </p>
                      </div>
                      {showBorrowerReviews[b.id] && b.borrower.reviews_received?.length > 0 && (
                        <div style={{ marginTop: '0.6rem', background: '#fff', borderRadius: 10, border: '1px dashed #e2e8f0', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {b.borrower.reviews_received.map(rev => (
                            <div key={rev.id} style={{ fontSize: '0.78rem', borderBottom: '1px solid #f8fafc', paddingBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                                <div style={{ display: 'flex', gap: '1px' }}>
                                  {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star" style={{ fontSize: '0.65rem', color: i < rev.rating ? '#f59e0b' : '#e2e8f0' }}></i>)}
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{new Date(rev.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                              {rev.comment && <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic' }}>"{rev.comment}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner code display */}
                  {isOwner && b.status === 'approved' && (
                    <div className="code-owner-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.68rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            {b.picked_up_at ? 'Code de retour' : 'Code de récupération'}
                          </p>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace', letterSpacing: 4 }}>
                            {b.picked_up_at ? b.return_code : b.confirmation_code}
                          </p>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(b.picked_up_at ? b.return_code : b.confirmation_code); }}
                          style={{ background: '#fff', border: '1px solid #dbeafe', width: 40, height: 40, borderRadius: 10, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          title="Copier"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                      <p style={{ margin: '0.6rem 0 0', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="fas fa-shield-halved" style={{ color: '#2563eb' }}></i>
                        Donnez ce code à l'emprunteur pour confirmer la {b.picked_up_at ? 'restitution' : 'réception'}.
                      </p>
                    </div>
                  )}

                  {/* Borrower code input */}
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}