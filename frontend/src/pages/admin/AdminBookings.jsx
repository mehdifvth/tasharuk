// src/pages/admin/AdminBookings.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const load = (pageNumber = 1) => {
        setLoading(true);
        api.get(`/admin/bookings?page=${pageNumber}`)
            .then(r => {
                setBookings(r.data.data);
                setLastPage(r.data.last_page);
                setPage(r.data.current_page);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(1); }, []);

    const STATUS_STYLE = {
        approved: { bg: '#d1fae5', color: '#065f46', text: 'Approuvée' },
        completed: { bg: '#e0f2fe', color: '#0369a1', text: 'Terminée' },
        rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejetée' },
        cancelled: { bg: '#f1f5f9', color: '#475569', text: 'Annulée' },
        pending: { bg: '#fef9c3', color: '#854d0e', text: 'En attente' },
    };

    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.5rem' }}>Réservations</h2>

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
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
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
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Du {new Date(b.start_date).toLocaleDateString()}</p>
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Au {new Date(b.end_date).toLocaleDateString()}</p>
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