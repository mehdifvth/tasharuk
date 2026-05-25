// src/pages/PublicProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';

export default function PublicProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tools');
    const [reviewType, setReviewType] = useState('as_owner');

    useEffect(() => {
        setLoading(true);
        api.get(`/users/${id}/profile`)
            .then(r => setData(r.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    useEffect(() => {
        if (location.state?.tab) setActiveTab(location.state.tab);
        if (location.state?.reviewType) setReviewType(location.state.reviewType);
    }, [location.state]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        </div>
    );

    if (!data) return null;

    const { user, tools, reviews } = data;
    const currentReviews = reviews[reviewType] || [];
    const totalReviews = (reviews.as_owner?.length || 0) + (reviews.as_borrower?.length || 0);

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <style>{`
        .pub-tab { background: none; border: none; padding: 0.85rem 0.25rem; font-size: 0.92rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border-bottom: 3px solid transparent; margin-bottom: -2px; }
        .pub-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
        .pub-tab:not(.active) { color: #94a3b8; }
        .pub-tab:not(.active):hover { color: #374151; }
        .rev-tab { padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.15s; }
        .reviewer-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; flex-shrink: 0; cursor: pointer; }
      `}</style>

            {/* Profile header */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                {/* Banner */}
                <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)', padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', margin: '0 0 0.5rem' }}>{user.name}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: 0 }}>
                        <i className="fas fa-calendar-alt me-1"></i>
                        Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Ratings row */}
                <div style={{ display: 'flex', gap: '0.75rem', padding: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {user.owner_rating > 0 && (
                        <div style={{ background: '#f0fdf4', padding: '0.65rem 1.1rem', borderRadius: 12, border: '1px solid #bbf7d0', textAlign: 'center', minWidth: 110 }}>
                            <p style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.2rem' }}>Propriétaire</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                                <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>
                                <span style={{ fontWeight: 800, color: '#166534', fontSize: '1.1rem' }}>{user.owner_rating}</span>
                                <span style={{ fontSize: '0.75rem', color: '#86efac' }}>({user.owner_reviews_count})</span>
                            </div>
                        </div>
                    )}
                    {user.borrower_rating > 0 && (
                        <div style={{ background: '#eff6ff', padding: '0.65rem 1.1rem', borderRadius: 12, border: '1px solid #bfdbfe', textAlign: 'center', minWidth: 110 }}>
                            <p style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.2rem' }}>Emprunteur</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                                <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>
                                <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '1.1rem' }}>{user.borrower_rating}</span>
                                <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>({user.borrower_reviews_count})</span>
                            </div>
                        </div>
                    )}
                    <div style={{ background: '#f8fafc', padding: '0.65rem 1.1rem', borderRadius: 12, border: '1px solid #f1f5f9', textAlign: 'center', minWidth: 110 }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.2rem' }}>Outils</p>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{tools.length}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1.25rem', borderTop: '1px solid #f8fafc', borderBottom: '2px solid #f8fafc' }}>
                    <button className={`pub-tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
                        <i className="fas fa-tools me-1"></i> Outils ({tools.length})
                    </button>
                    <button className={`pub-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                        <i className="fas fa-star me-1"></i> Avis ({totalReviews})
                    </button>
                </div>
            </div>

            {/* Tools tab */}
            {activeTab === 'tools' && (
                tools.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                        <i className="fas fa-box-open" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block', opacity: 0.4 }}></i>
                        <p style={{ fontWeight: 600, margin: 0 }}>Aucun outil disponible pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {tools.map(t => (
                            <ToolCard key={t.id} tool={t} onClick={() => navigate(`/tools/${t.id}`)} />
                        ))}
                    </div>
                )
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
                <div>
                    {/* Sub-tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <button
                            className="rev-tab"
                            onClick={() => setReviewType('as_owner')}
                            style={{ borderColor: reviewType === 'as_owner' ? '#16a34a' : '#e2e8f0', background: reviewType === 'as_owner' ? '#f0fdf4' : '#fff', color: reviewType === 'as_owner' ? '#166534' : '#64748b' }}
                        >
                            <i className="fas fa-tools me-1"></i> Sur ses outils ({reviews.as_owner?.length || 0})
                        </button>
                        <button
                            className="rev-tab"
                            onClick={() => setReviewType('as_borrower')}
                            style={{ borderColor: reviewType === 'as_borrower' ? '#2563eb' : '#e2e8f0', background: reviewType === 'as_borrower' ? '#eff6ff' : '#fff', color: reviewType === 'as_borrower' ? '#1e40af' : '#64748b' }}
                        >
                            <i className="fas fa-user me-1"></i> Emprunteur ({reviews.as_borrower?.length || 0})
                        </button>
                    </div>

                    {currentReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                            Aucun avis dans cette catégorie.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {currentReviews.map(r => (
                                <div key={r.id} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div
                                                className="reviewer-avatar"
                                                onClick={() => navigate(`/profile/${r.reviewer_id}`)}
                                                style={{ background: '#eef2ff', color: '#6366f1', border: '2px solid #e0e7ff' }}
                                            >
                                                {r.reviewer?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p onClick={() => navigate(`/profile/${r.reviewer_id}`)} style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                    {r.reviewer?.name}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                                                    {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2px', background: '#fef9c3', padding: '0.3rem 0.6rem', borderRadius: 8 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className="fas fa-star" style={{ fontSize: '0.75rem', color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ paddingLeft: '3.25rem' }}>
                                        <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                                            {r.comment || <em style={{ color: '#cbd5e1' }}>Aucun commentaire.</em>}
                                        </p>
                                        {r.booking?.tool && (
                                            <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', color: '#64748b', border: '1px solid #f1f5f9' }}>
                                                <i className="fas fa-wrench" style={{ color: '#2563eb' }}></i>
                                                {r.booking.tool.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}