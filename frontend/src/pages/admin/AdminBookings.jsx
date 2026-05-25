// src/pages/admin/AdminBookings.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [actionLoad, setActionLoad] = useState(null);

    const load = (pageNumber = 1, currentFilter = filter) => {
        setLoading(true);
        const statusParam = currentFilter === 'all' ? '' : `&status=${currentFilter}`;
        api.get(`/admin/bookings?page=${pageNumber}${statusParam}`)
            .then(r => {
                setBookings(r.data.data);
                setLastPage(r.data.last_page);
                setPage(r.data.current_page);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(1, filter); }, [filter]);

    const handleCancel = async (id) => {
        if (!window.confirm('Annuler cette réservation en tant qu\'administrateur ?')) return;
        setActionLoad(id);
        try {
            await api.put(`/admin/bookings/${id}/cancel`);
            load(page);
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
        } finally {
            setActionLoad(null);
        }
    };

    const FILTERS = [
        { key: 'all', label: 'Toutes', color: '#6366f1', bg: '#eef2ff', icon: 'fa-list' },
        { key: 'pending', label: 'En attente', color: '#f59e0b', bg: '#fef9c3', icon: 'fa-hourglass-half' },
        { key: 'approved', label: 'Approuvées', color: '#10b981', bg: '#d1fae5', icon: 'fa-check-circle' },
        { key: 'completed', label: 'Terminées', color: '#0ea5e9', bg: '#e0f2fe', icon: 'fa-flag-checkered' },
        { key: 'cancelled', label: 'Annulées', color: '#dc2626', bg: '#fee2e2', icon: 'fa-ban' },
    ];

    const STATUS_STYLE = {
        approved: { bg: '#d1fae5', color: '#065f46', text: 'Approuvée' },
        completed: { bg: '#e0f2fe', color: '#0369a1', text: 'Terminée' },
        rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejetée' },
        cancelled: { bg: '#f1f5f9', color: '#475569', text: 'Annulée' },
        pending: { bg: '#fef9c3', color: '#854d0e', text: 'En attente' },
    };

    const showActionsCol = ['all', 'pending'].includes(filter);

    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.5rem' }}>Réservations</h2>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: 10, border: '1.5px solid',
                            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                            borderColor: filter === f.key ? f.color : '#e2e8f0',
                            background: filter === f.key ? f.bg : '#fff',
                            color: filter === f.key ? f.color : '#64748b',
                            display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                    >
                        <i className={`fas ${f.icon}`}></i> {f.label}
                    </button>
                ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#6366f1' }}></i>
                    </div>
                ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                {['Outil', 'Emprunteur', 'Dates', 'Statut', 'Prix'].map(h => (
                                    <th key={h} style={TH}>{h}</th>
                                ))}
                                {showActionsCol && <th style={TH}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={showActionsCol ? 6 : 5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        Aucune réservation trouvée
                                    </td>
                                </tr>
                            ) : bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={TD}>
                                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>{b.tool?.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>ID: {b.id}</p>
                                    </td>
                                    <td style={TD}>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{b.borrower?.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{b.borrower?.email}</p>
                                    </td>
                                    <td style={TD}>
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Du {new Date(b.start_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Au {new Date(b.end_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td style={TD}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                                            background: STATUS_STYLE[b.status]?.bg, color: STATUS_STYLE[b.status]?.color
                                        }}>
                                            {STATUS_STYLE[b.status]?.text || b.status}
                                        </span>
                                    </td>
                                    <td style={TD}>
                                        <p style={{ fontWeight: 800, color: '#0f172a', margin: 0 }}>{b.total_price} MAD</p>
                                    </td>
                                    {showActionsCol && (
                                        <td style={TD}>
                                            {b.status === 'pending' && (
                                                <button
                                                    disabled={actionLoad === b.id}
                                                    onClick={() => handleCancel(b.id)}
                                                    style={{
                                                        padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid #fca5a5',
                                                        background: '#fff', color: '#dc2626', cursor: 'pointer',
                                                        fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s'
                                                    }}
                                                >
                                                    {actionLoad === b.id ? <i className="fas fa-spinner fa-spin"></i> : 'Annuler'}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                        disabled={page === 1 || loading}
                        onClick={() => load(page - 1)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Page {page} / {lastPage}</span>
                    <button 
                        disabled={page === lastPage || loading}
                        onClick={() => load(page + 1)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

const TH = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 };
const TD = { padding: '1rem', verticalAlign: 'middle' };