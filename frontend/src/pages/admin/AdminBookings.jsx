// src/pages/admin/AdminBookings.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function LivePrice({ pickedUpAt, pricePerHour }) {
    const [price, setPrice] = useState('0.00');
    useEffect(() => {
        const update = () => {
            const hours = (Date.now() - new Date(pickedUpAt + 'Z')) / 3600000;
            const p = hours * pricePerHour;
            setPrice(p.toFixed(2));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [pickedUpAt, pricePerHour]);
    return (
        <span style={{ fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.88rem' }}>
            {price} MAD
        </span>
    );
}

const STATUS = {
    pending: { label: 'En attente', bg: '#fef9c3', color: '#854d0e' },
    approved: { label: 'Approuvée', bg: '#d1fae5', color: '#065f46' },
    completed: { label: 'Terminée', bg: '#e0f2fe', color: '#0369a1' },
    rejected: { label: 'Rejetée', bg: '#fee2e2', color: '#991b1b' },
    cancelled: { label: 'Annulée', bg: '#f1f5f9', color: '#475569' },
};

const FILTERS = [
    { key: 'all', label: 'Toutes', color: '#6366f1' },
    { key: 'pending', label: 'En attente', color: '#f59e0b' },
    { key: 'approved', label: 'Approuvées', color: '#10b981' },
    { key: 'completed', label: 'Terminées', color: '#0ea5e9' },
    { key: 'rejected', label: 'Rejetées / Annulées', color: '#dc2626' },
];

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
        const matchStatus = filter === 'all'
            || (filter === 'rejected' ? b.status === 'rejected' || b.status === 'cancelled' : b.status === filter);
        const matchSearch =
            b.tool?.title?.toLowerCase().includes(search.toLowerCase()) ||
            b.borrower?.name?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        approved: bookings.filter(b => b.status === 'approved').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        rejected: bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length,
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.75rem', color: '#6366f1' }}></i>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Réservations</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {bookings.length} réservation(s) au total
                </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.15s',
                            border: `1px solid ${filter === f.key ? f.color : '#e2e8f0'}`,
                            background: filter === f.key ? f.color + '15' : '#fff',
                            color: filter === f.key ? f.color : '#64748b',
                        }}
                    >
                        {f.label}
                        <span style={{ marginLeft: '0.4rem', opacity: 0.7 }}>({counts[f.key]})</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 340, marginBottom: '1rem' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}></i>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher outil ou emprunteur..."
                    style={{
                        width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: '0.5rem', paddingBottom: '0.5rem',
                        borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
                    }}
                />
            </div>

            {/* Table */}
            <div style={{
                background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                {['#', 'Outil', 'Emprunteur', 'Dates', 'Prix', 'Statut'].map(h => (
                                    <th key={h} style={{
                                        padding: '0.75rem 1rem', textAlign: 'left',
                                        fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                                        textTransform: 'uppercase', letterSpacing: 0.8
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        Aucune réservation trouvée
                                    </td>
                                </tr>
                            ) : filtered.map(b => {
                                const s = STATUS[b.status] || STATUS.pending;
                                return (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={TD}>
                                            <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.8rem' }}>#{b.id}</span>
                                        </td>
                                        <td style={TD}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                {b.tool?.image_url
                                                    ? <img src={b.tool.image_url} alt={b.tool.title}
                                                        style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                                    : <div style={{
                                                        width: 32, height: 32, borderRadius: 6, background: '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                    }}>
                                                        <i className="fas fa-wrench" style={{ color: '#94a3b8', fontSize: '0.75rem' }}></i>
                                                    </div>
                                                }
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{b.tool?.title}</span>
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%', background: '#e0f2fe',
                                                    color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                                                }}>
                                                    {b.borrower?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{b.borrower?.name}</span>
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                <p style={{ margin: 0 }}>{new Date(b.start_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</p>
                                                <p style={{ margin: 0, color: '#94a3b8' }}>→ {new Date(b.end_date + 'Z').toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</p>
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <div style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', width: 'fit-content' }}>
                                                <p style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.1rem', letterSpacing: 0.5 }}>
                                                    {b.status === 'completed' ? 'Final' : b.picked_up_at && !b.returned_at ? 'En cours' : 'Estimé'}
                                                </p>
                                                {b.picked_up_at && !b.returned_at ? (
                                                    <LivePrice pickedUpAt={b.picked_up_at} pricePerHour={b.tool?.price / 24 || 0} />
                                                ) : (
                                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', fontFamily: 'monospace' }}>
                                                        {parseFloat(b.status === 'completed' ? (b.final_price || b.display_final_price || 0) : (b.total_price || b.display_total_price || 0)).toFixed(2)} MAD
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <span style={{
                                                padding: '0.2rem 0.65rem', borderRadius: 20,
                                                fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color
                                            }}>
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

const TD = { padding: '0.75rem 1rem', verticalAlign: 'middle' };