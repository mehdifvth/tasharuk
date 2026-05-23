import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';

export default function PublicProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tools'); // 'tools' or 'reviews'
    const [reviewType, setReviewType] = useState('as_owner'); // 'as_owner' or 'as_borrower'

    useEffect(() => {
        setLoading(true);
        api.get(`/users/${id}/profile`)
            .then(res => setData(res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
        </div>
    );

    if (!data) return null;

    const { user, tools, reviews } = data;
    const currentReviews = reviews[reviewType] || [];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container" style={{ paddingTop: '2rem', maxWidth: 1000 }}>
                
                {/* Profile Header */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 800, margin: '0 auto 1.25rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.85rem', color: '#0f172a', margin: '0 0 0.75rem' }}>{user.name}</h1>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {user.owner_rating && (
                            <div style={{ background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: 12, border: '1px solid #dcfce7' }}>
                                <p style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.1rem' }}>Propriétaire</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.85rem' }}></i>
                                    <span style={{ fontWeight: 800, color: '#166534', fontSize: '1rem' }}>{user.owner_rating}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#166534', opacity: 0.7 }}>({user.owner_reviews_count})</span>
                                </div>
                            </div>
                        )}
                        {user.borrower_rating && (
                            <div style={{ background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: 12, border: '1px solid #dbeafe' }}>
                                <p style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.1rem' }}>Emprunteur</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.85rem' }}></i>
                                    <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '1rem' }}>{user.borrower_rating}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#1e40af', opacity: 0.7 }}>({user.borrower_reviews_count})</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '1.25rem' }}>
                        <i className="fas fa-calendar-alt me-2"></i>Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Main Tabs */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9' }}>
                    <button 
                        onClick={() => setActiveTab('tools')}
                        style={{ background: 'none', border: 'none', padding: '1rem 0.5rem', fontSize: '1rem', fontWeight: 700, color: activeTab === 'tools' ? '#6366f1' : '#94a3b8', borderBottom: activeTab === 'tools' ? '3px solid #6366f1' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', marginBottom: -2 }}
                    >
                        <i className="fas fa-tools me-2"></i>Outils en ligne ({tools.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        style={{ background: 'none', border: 'none', padding: '1rem 0.5rem', fontSize: '1rem', fontWeight: 700, color: activeTab === 'reviews' ? '#6366f1' : '#94a3b8', borderBottom: activeTab === 'reviews' ? '3px solid #6366f1' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', marginBottom: -2 }}
                    >
                        <i className="fas fa-star me-2"></i>Avis reçus ({reviews.as_owner.length + reviews.as_borrower.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'tools' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {tools.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                                <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5 }}></i>
                                Cet utilisateur n'a aucun outil en ligne pour le moment.
                            </div>
                        ) : tools.map(t => (
                            <ToolCard key={t.id} tool={t} onClick={() => navigate(`/tools/${t.id}`)} />
                        ))}
                    </div>
                ) : (
                    <div>
                        {/* Sub-tabs for Reviews */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button 
                                onClick={() => setReviewType('as_owner')}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', borderColor: reviewType === 'as_owner' ? '#16a34a' : '#e2e8f0', background: reviewType === 'as_owner' ? '#f0fdf4' : '#fff', color: reviewType === 'as_owner' ? '#166534' : '#64748b' }}
                            >
                                Sur ses outils ({reviews.as_owner.length})
                            </button>
                            <button 
                                onClick={() => setReviewType('as_borrower')}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', borderColor: reviewType === 'as_borrower' ? '#2563eb' : '#e2e8f0', background: reviewType === 'as_borrower' ? '#eff6ff' : '#fff', color: reviewType === 'as_borrower' ? '#1e40af' : '#64748b' }}
                            >
                                En tant qu'emprunteur ({reviews.as_borrower.length})
                            </button>
                        </div>

                        {currentReviews.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                                Aucun avis dans cette catégorie.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentReviews.map(r => (
                                    <div key={r.id} style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div 
                                                    onClick={() => navigate(`/profile/${r.reviewer_id}`)}
                                                    style={{ width: 44, height: 44, borderRadius: '50%', background: '#f8fafc', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', border: '2px solid #eef2ff', cursor: 'pointer' }}
                                                >
                                                    {r.reviewer?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p onClick={() => navigate(`/profile/${r.reviewer_id}`)} style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', cursor: 'pointer' }}>{r.reviewer?.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '3px', background: '#f8fafc', padding: '0.35rem 0.6rem', borderRadius: 10 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className="fas fa-star" style={{ fontSize: '0.8rem', color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ paddingLeft: '3.75rem' }}>
                                            <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                                                {r.comment || <em style={{ color: '#cbd5e1' }}>Aucun commentaire laissé.</em>}
                                            </p>
                                            {r.booking?.tool && (
                                                <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', color: '#64748b' }}>
                                                    <i className="fas fa-wrench"></i>
                                                    Outil : <strong>{r.booking.tool.title}</strong>
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
        </div>
    );
}