import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function AdminLivePrice({ pickedUpAt, pricePerDay }) {
    const [price, setPrice] = useState('0.00');
    useEffect(() => {
        const update = () => {
            const minutes = (Date.now() - new Date(pickedUpAt + 'Z')) / 60000;
            setPrice((minutes * (pricePerDay / 24 / 60)).toFixed(2));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [pickedUpAt, pricePerDay]);
    return <span style={{ fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>{price} MAD</span>;
}

const STATUS = {
    pending: { label: 'En attente', bg: '#fef9c3', color: '#854d0e' },
    approved: { label: 'Approuvée', bg: '#dcfce7', color: '#166534' },
    completed: { label: 'Terminée', bg: '#dbeafe', color: '#1e40af' },
    rejected: { label: 'Rejetée', bg: '#fee2e2', color: '#991b1b' },
    cancelled: { label: 'Annulée', bg: '#f1f5f9', color: '#64748b' },
};

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/admin/data')
            .then(r => setBookings(r.data.bookings))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = bookings.filter(b => {
        const matchStatus = filter === 'all' || b.status === filter;
        const matchSearch = b.tool?.title?.toLowerCase().includes(search.toLowerCase())
            || b.borrower?.name?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        approved: bookings.filter(b => b.status === 'approved').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        rejected: bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length,
    };

    if (loading) return <p style={{ color: '#94a3b8' }}>Chargement...</p>;

    return (
        <div>
            <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: '1.5rem' }}>
                <i className="fas fa-calendar-alt me-2 text-primary"></i>Réservations
            </h2>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'pending', label: 'En attente' },
                    { key: 'approved', label: 'Approuvées' },
                    { key: 'completed', label: 'Terminées' },
                    { key: 'rejected', label: 'Rejetées/Annulées' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            padding: '0.35rem 0.85rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.82rem',
                            background: filter === f.key ? '#2563eb' : '#f1f5f9',
                            color: filter === f.key ? '#fff' : '#64748b',
                        }}
                    >
                        {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key] ?? bookings.filter(b => b.status === f.key).length})</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: 320 }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher outil ou emprunteur..."
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.88rem' }}
                />
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['ID', 'Outil', 'Emprunteur', 'Dates', 'Prix', 'Statut'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucune réservation trouvée</td></tr>
                            ) : filtered.map(b => {
                                const s = STATUS[b.status] || STATUS.pending;
                                return (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={td}><span style={{ fontWeight: 700, color: '#94a3b8' }}>#{b.id}</span></td>
                                        <td style={td}><strong style={{ fontSize: '0.88rem' }}>{b.tool?.title}</strong></td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {b.borrower?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: '0.88rem' }}>{b.borrower?.name}</span>
                                            </div>
                                        </td>
                                        <td style={td}>
                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                {b.start_date?.slice(0, 10)} → {b.end_date?.slice(0, 10)}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                                                {b.status === 'completed' ? '✅ Final' : b.picked_up_at && !b.returned_at ? '⏱ En cours' : '💰 Estimé'}
                                            </span>
                                            {b.picked_up_at && !b.returned_at ? (
                                                <AdminLivePrice pickedUpAt={b.picked_up_at} pricePerDay={b.tool?.price || 0} />
                                            ) : b.status === 'completed' ? (
                                                <span style={{ fontWeight: 700, color: '#16a34a' }}>{parseFloat(b.final_price || 0).toFixed(2)} MAD</span>
                                            ) : (
                                                <span style={{ fontWeight: 700, color: '#2563eb' }}>{parseFloat(b.total_price || 0).toFixed(2)} MAD</span>
                                            )}
                                        </td>
                                        <td style={td}>
                                            <span style={{ padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color }}>
                                                {s.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const td = { padding: '0.75rem 1rem', verticalAlign: 'middle' };