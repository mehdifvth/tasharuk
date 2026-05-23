// src/pages/admin/AdminTools.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminTools() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [confirm, setConfirm] = useState(null);

    const load = () => {
        api.get('/admin/data')
            .then(r => setTools(r.data.tools))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/tools/${id}`);
            setConfirm(null);
            load();
        } catch { alert('Erreur lors de la suppression'); }
    };

    const filtered = tools.filter(t => {
        const matchSearch =
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.name?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || t.condition === filter;
        return matchSearch && matchFilter;
    });

    const COND = {
        new: { label: 'Neuf', bg: '#d1fae5', color: '#065f46' },
        good: { label: 'Bon état', bg: '#fef9c3', color: '#854d0e' },
        fair: { label: 'Correct', bg: '#fee2e2', color: '#991b1b' },
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
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Outils</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {tools.length} outil(s) publié(s)
                </p>
            </div>

            {/* Filters + Search */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.82rem' }}></i>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un outil, propriétaire..."
                        style={{
                            width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: '0.5rem', paddingBottom: '0.5rem',
                            borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
                        }}
                    />
                </div>

                {/* Condition filter */}
                {['all', 'new', 'good', 'fair'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            borderColor: filter === f ? '#6366f1' : '#e2e8f0',
                            background: filter === f ? '#eef2ff' : '#fff',
                            color: filter === f ? '#6366f1' : '#64748b',
                        }}
                    >
                        {f === 'all' ? 'Tous' : COND[f]?.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <i className="fas fa-tools" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block' }}></i>
                    <p style={{ fontSize: '0.9rem' }}>Aucun outil trouvé</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {filtered.map(t => (
                        <div key={t.id} style={S.card}>
                            {/* Image */}
                            <div style={{ position: 'relative' }}>
                                {t.image_url
                                    ? <img src={t.image_url} alt={t.title} style={S.img} />
                                    : <div style={S.placeholder}>
                                        <i className="fas fa-wrench" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>
                                    </div>
                                }
                                {/* Condition badge overlay */}
                                <span style={{
                                    position: 'absolute', top: 8, left: 8,
                                    background: COND[t.condition]?.bg, color: COND[t.condition]?.color,
                                    padding: '0.15rem 0.55rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                                }}>
                                    {COND[t.condition]?.label}
                                </span>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h4 style={{
                                        fontWeight: 700, margin: 0, fontSize: '0.88rem', color: '#0f172a',
                                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {t.title}
                                    </h4>
                                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.85rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                                        {t.price} MAD
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' }}>
                                    <p style={S.meta}>
                                        <i className="fas fa-tag me-1" style={{ color: '#94a3b8' }}></i>
                                        {t.category?.name}
                                    </p>
                                    <p style={S.meta}>
                                        <i className="fas fa-user me-1" style={{ color: '#94a3b8' }}></i>
                                        {t.user?.name}
                                    </p>
                                </div>

                                <button onClick={() => setConfirm(t.id)} style={S.deleteBtn}>
                                    <i className="fas fa-trash me-1"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {confirm && (
                <div style={S.overlay}>
                    <div style={S.modal}>
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%', background: '#fee2e2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
                            }}>
                                <i className="fas fa-trash" style={{ color: '#dc2626' }}></i>
                            </div>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 0.3rem' }}>Supprimer cet outil ?</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Cette action est irréversible.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setConfirm(null)} style={S.cancelBtn}>Annuler</button>
                            <button onClick={() => handleDelete(confirm)} style={S.confirmBtn}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const S = {
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' },
    img: { width: '100%', height: 160, objectFit: 'cover', display: 'block' },
    placeholder: { height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
    meta: { color: '#64748b', fontSize: '0.78rem', margin: 0 },
    deleteBtn: {
        width: '100%', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5',
        borderRadius: 8, padding: '0.45rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
        transition: 'all 0.15s'
    },
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)'
    },
    modal: {
        background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 340,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
    },
    cancelBtn: {
        flex: 1, background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
    },
    confirmBtn: {
        flex: 1, background: '#dc2626', color: '#fff', border: 'none',
        borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
    },
};