// src/pages/admin/AdminBookings.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const FILTERS = [
    { key: 'all', label: 'Toutes', color: '#6366f1', bg: '#eef2ff', icon: 'fa-list' },
    { key: 'pending', label: 'En attente', color: '#f59e0b', bg: '#fef9c3', icon: 'fa-hourglass-half' },
    { key: 'approved', label: 'Approuvées', color: '#10b981', bg: '#d1fae5', icon: 'fa-check-circle' },
    { key: 'completed', label: 'Terminées', color: '#0ea5e9', bg: '#e0f2fe', icon: 'fa-flag-checkered' },
    { key: 'cancelled', label: 'Annulées', color: '#dc2626', bg: '#fee2e2', icon: 'fa-ban' },
];

const STATUS_STYLE = {
    pending: { bg: '#fef9c3', color: '#854d0e', text: 'En attente' },
    approved: { bg: '#d1fae5', color: '#065f46', text: 'Approuvée' },
    completed: { bg: '#e0f2fe', color: '#0369a1', text: 'Terminée' },
    rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejetée' },
    cancelled: { bg: '#f1f5f9', color: '#475569', text: 'Annulée' },
};

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [actionLoad, setActionLoad] = useState(null);

    const load = (p = 1, f = filter) => {
        setLoading(true);
        const q = f === 'all' ? '' : `&status=${f}`;
        api.get(`/admin/bookings?page=${p}${q}`)
            .then(r => { 
                const { pagination, counts } = r.data;
                setBookings(pagination.data); 
                setLastPage(pagination.last_page); 
                setPage(pagination.current_page);
                setCounts(counts);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(1, filter); }, [filter]);

    const handleCancel = async (id) => {
        if (!window.confirm('Annuler cette réservation ?')) return;
        setActionLoad(id);
        try { await api.put(`/admin/bookings/${id}/cancel`); load(page); }
        catch (err) { alert(err.response?.data?.message || 'Erreur'); }
        finally { setActionLoad(null); }
    };

    const showActions = ['all', 'pending'].includes(filter);

    return (
        <>
            <style>{`
        /* ── Tabs ── */
        .abk-tabs-wrap { position: relative; margin-bottom: 1.5rem; }
        .abk-tabs-wrap::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 48px; background: linear-gradient(to left, #f8fafc, transparent); pointer-events: none; z-index: 2; }
        .abk-tabs { display: flex; gap: 0.5rem; background: #fff; padding: 0.4rem; border-radius: 18px; border: 1.5px solid #e2e8f0; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; width: 100%; }
        .abk-tabs::-webkit-scrollbar { display: none; }
        .abk-tab { flex: 0 0 auto; padding: 0.55rem 0.75rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); color: #64748b; background: transparent; white-space: nowrap; }
        .abk-tab:hover:not(.abk-active) { background: #f1f5f9; color: #0f172a; }
        .abk-tab.abk-active { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .abk-scroll-hint { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; background: #6366f1; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; z-index: 3; box-shadow: 0 4px 10px rgba(99,102,241,0.3); animation: abkHint 1.5s infinite; pointer-events: none; }
        @keyframes abkHint { 0%,100% { transform: translateY(-50%) translateX(0); opacity: 0.2; } 50% { transform: translateY(-50%) translateX(-6px); opacity: 1; } }
        @media (min-width: 769px) { .abk-tabs-wrap::after, .abk-scroll-hint { display: none !important; } }

        /* ── Table / Cards ── */
        .abk-table { width: 100%; border-collapse: collapse; }
        .abk-th { padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .abk-td { padding: 0.9rem 1rem; vertical-align: middle; border-bottom: 1px solid #f8fafc; }
        .abk-tr:hover { background: #fafafa; }

        .abk-cards { display: none; flex-direction: column; gap: 0.75rem; padding: 0.75rem; }
        .abk-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1rem 1.1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: transform 0.15s; }
        .abk-card:active { transform: scale(0.99); }
        .abk-row { display: flex; justify-content: space-between; align-items: center; padding: 0.28rem 0; }
        .abk-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
        .abk-value { font-size: 0.8rem; font-weight: 600; color: '#0f172a'; }

        .abk-cancel { padding: 0.3rem 0.7rem; border-radius: 8px; border: 1px solid #fca5a5; background: #fff; color: #dc2626; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.3rem; }
        .abk-cancel:hover:not(:disabled) { background: #fef2f2; }
        .abk-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
       .abk-table-wrap { display: none !important; }
       .abk-cards { display: flex !important; }
       .abk-tab { padding: 0.45rem 0.6rem !important; font-size: 0.72rem !important; gap: 0.3rem !important; }
       .abk-tab span:last-child { padding: 0.05rem 0.3rem !important; }
}
      `}</style>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Réservations</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{counts.all || 0} réservation(s) au total</p>
            </div>

            {/* Tabs */}
            <div className="abk-tabs-wrap">
                <div className="abk-tabs" onScroll={e => {
                    const hint = e.currentTarget.parentElement.querySelector('.abk-scroll-hint');
                    if (hint) hint.style.opacity = e.currentTarget.scrollLeft > 20 ? '0' : '1';
                }}>
                    {FILTERS.map(f => {
                        const isActive = filter === f.key;
                        return (
                            <button key={f.key} className={`abk-tab ${isActive ? 'abk-active' : ''}`} onClick={() => setFilter(f.key)}
                                style={{ background: isActive ? f.bg : 'transparent', color: isActive ? f.color : '#64748b' }}>
                                <i className={`fas ${f.icon}`} style={{ fontSize: '0.82rem' }}></i>
                                {f.label}
                                <span style={{ background: isActive ? 'rgba(255,255,255,0.55)' : '#f1f5f9', color: isActive ? f.color : '#94a3b8', padding: '0.05rem 0.45rem', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>
                                    {counts[f.key] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="abk-scroll-hint"><i className="fas fa-chevron-right"></i></div>
            </div>

            {/* Content */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.75rem', color: '#6366f1' }}></i>
                    </div>
                ) : bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <i className="fas fa-calendar-alt" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', opacity: 0.3 }}></i>
                        <p style={{ fontSize: '0.88rem', margin: 0 }}>Aucune réservation trouvée</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="abk-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="abk-table">
                                <thead>
                                    <tr>
                                        {['Outil', 'Emprunteur', 'Dates', 'Prix', 'Statut', ...(showActions ? ['Actions'] : [])].map(h => (
                                            <th key={h} className="abk-th">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => {
                                        const s = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                                        return (
                                            <tr key={b.id} className="abk-tr">
                                                <td className="abk-td">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        {b.tool?.image_url
                                                            ? <img src={b.tool.image_url} alt={b.tool.title} style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                                                            : <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="fas fa-wrench" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                                            </div>
                                                        }
                                                        <div>
                                                            <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem', color: '#0f172a' }}>{b.tool?.title}</p>
                                                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>#{b.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="abk-td">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                                                            {b.borrower?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, margin: 0, fontSize: '0.82rem', color: '#0f172a' }}>{b.borrower?.name}</p>
                                                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{b.borrower?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="abk-td">
                                                    <p style={{ fontSize: '0.78rem', color: '#374151', margin: 0 }}>
                                                        {new Date(b.start_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                                                        → {new Date(b.end_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="abk-td">
                                                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.88rem' }}>{b.total_price} MAD</span>
                                                </td>
                                                <td className="abk-td">
                                                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color }}>
                                                        {s.text}
                                                    </span>
                                                </td>
                                                {showActions && (
                                                    <td className="abk-td">
                                                        {b.status === 'pending' && (
                                                            <button className="abk-cancel" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)}>
                                                                {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-times"></i> Annuler</>}
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="abk-cards">
                            {bookings.map(b => {
                                const s = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                                return (
                                    <div key={b.id} className="abk-card">
                                        {/* Card header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                                {b.tool?.image_url
                                                    ? <img src={b.tool.image_url} alt={b.tool.title} style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                                                    : <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <i className="fas fa-wrench" style={{ color: '#94a3b8' }}></i>
                                                    </div>
                                                }
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.tool?.title}</p>
                                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>#{b.id}</p>
                                                </div>
                                            </div>
                                            <span style={{ padding: '0.18rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800, background: s.bg, color: s.color, flexShrink: 0, marginLeft: '0.5rem' }}>
                                                {s.text}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div style={{ borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc', padding: '0.6rem 0', marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                                            <div className="abk-row">
                                                <span className="abk-label"><i className="fas fa-user"></i> Emprunteur</span>
                                                <span className="abk-value">{b.borrower?.name}</span>
                                            </div>
                                            <div className="abk-row">
                                                <span className="abk-label"><i className="fas fa-calendar"></i> Début</span>
                                                <span className="abk-value">{new Date(b.start_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="abk-row">
                                                <span className="abk-label"><i className="fas fa-calendar-check"></i> Fin</span>
                                                <span className="abk-value">{new Date(b.end_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="abk-row">
                                                <span className="abk-label"><i className="fas fa-wallet"></i> Prix</span>
                                                <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.88rem' }}>{b.total_price} MAD</span>
                                            </div>
                                        </div>

                                        {showActions && b.status === 'pending' && (
                                            <button className="abk-cancel" disabled={actionLoad === b.id} onClick={() => handleCancel(b.id)}
                                                style={{ width: '100%', justifyContent: 'center', padding: '0.55rem', background: '#fef2f2', borderRadius: 10 }}>
                                                {actionLoad === b.id
                                                    ? <i className="fas fa-spinner fa-spin"></i>
                                                    : <><i className="fas fa-times"></i> Annuler la réservation</>
                                                }
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button disabled={page === 1 || loading} onClick={() => load(page - 1)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', padding: '0 0.25rem' }}>{page} / {lastPage}</span>
                    <button disabled={page === lastPage || loading} onClick={() => load(page + 1)}
                        style={{ padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </>
    );
}