// src/pages/admin/AdminReviews.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState(null);

    const load = () => {
        api.get('/admin/data')
            .then(r => setReviews(r.data.reviews))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/reviews/${id}`);
            setConfirm(null);
            load();
        } catch { alert('Erreur lors de la suppression'); }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Gestion des Avis</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {reviews.length} avis publié(s) sur la plateforme
                </p>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                {['Reviewer', 'Cible', 'Note', 'Commentaire', 'Date', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Aucun avis trouvé</td></tr>
                            ) : reviews.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={TD}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.reviewer?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {r.reviewer_id}</div>
                                    </td>
                                    <td style={TD}>
                                        <div style={{ fontWeight: 600, color: '#6366f1' }}>{r.reviewee?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.booking?.tool?.title}</div>
                                    </td>
                                    <td style={TD}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className="fas fa-star" style={{ fontSize: '0.7rem', color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ ...TD, maxWidth: 300 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.comment}>
                                            {r.comment || <em style={{ color: '#cbd5e1' }}>Sans commentaire</em>}
                                        </p>
                                    </td>
                                    <td style={TD}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                                    </td>
                                    <td style={TD}>
                                        <button 
                                            onClick={() => setConfirm(r.id)}
                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.5rem' }}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Confirm */}
            {confirm && (
                <div style={S.overlay}>
                    <div style={S.modal}>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Supprimer cet avis ?</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Cette action est irréversible.</p>
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

const TD = { padding: '1rem', verticalAlign: 'middle' };
const S = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '2rem', borderRadius: 16, width: '100%', maxWidth: 320 },
    cancelBtn: { flex: 1, padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer' },
    confirmBtn: { flex: 1, padding: '0.6rem', border: 'none', borderRadius: 8, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }
};