// src/pages/admin/AdminReviews.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const load = (pageNumber = 1) => {
        setLoading(true);
        api.get(`/admin/reviews?page=${pageNumber}`)
            .then(r => {
                setReviews(r.data.data);
                setLastPage(r.data.last_page);
                setPage(r.data.current_page);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(1); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet avis définitivement ?')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            load(page);
        } catch { alert('Erreur lors de la suppression'); }
    };

    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.5rem' }}>Avis & Commentaires</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#6366f1' }}></i>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Aucun avis trouvé</p>
                    ) : reviews.map(r => (
                        <div key={r.id} style={S.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={S.avatar}>
                                        {r.reviewer?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{r.reviewer?.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>le {new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <i className="fas fa-arrow-right" style={{ color: '#cbd5e1', fontSize: '0.7rem' }}></i>
                                    <div style={{ ...S.avatar, background: '#f1f5f9', color: '#64748b' }}>
                                        {r.reviewee?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>{r.reviewee?.name}</p>
                                </div>
                                <div style={S.rating}>
                                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.75rem' }}></i>
                                    <span style={{ fontWeight: 800 }}>{r.rating}/5</span>
                                </div>
                            </div>

                            <div style={{ paddingLeft: '3rem' }}>
                                <p style={{ margin: '0 0 1rem', color: '#475569', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    "{r.comment || 'Pas de commentaire'}"
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                                        Outil : <strong>{r.booking?.tool?.title}</strong>
                                    </span>
                                    <button onClick={() => handleDelete(r.id)} style={S.delBtn}>
                                        <i className="fas fa-trash-alt"></i> Supprimer l'avis
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
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

const S = {
    card: { background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    avatar: { width: 32, height: 32, borderRadius: '50%', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' },
    rating: { background: '#fef9c3', color: '#854d0e', padding: '0.25rem 0.6rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' },
    delBtn: { background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'color 0.2s', ':hover': { color: '#dc2626' } },
};