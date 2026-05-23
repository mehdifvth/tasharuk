// src/pages/admin/AdminTools.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminTools() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [confirm, setConfirm] = useState(null); // id à supprimer

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
        } catch (err) { alert('Erreur lors de la suppression'); }
    };

    const filtered = tools.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.pageTitle}>Gestion des Outils</h2>
                    <p style={styles.pageSubtitle}>{tools.length} outil(s) au total</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        style={{ paddingLeft: 36, width: 240, borderRadius: 8 }}
                    />
                </div>
            </div>

            {/* Grid d'outils avec photos */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <i className="fas fa-tools" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></i>
                    <p>Aucun outil trouvé</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filtered.map(t => (
                        <div key={t.id} style={styles.card}>
                            {/* Image */}
                            {t.image_url
                                ? <img src={t.image_url} alt={t.title} style={styles.img} />
                                : <div style={styles.placeholder}><i className="fas fa-wrench"></i></div>
                            }

                            {/* Infos */}
                            <div style={{ padding: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                    <h4 style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem', flex: 1 }}>{t.title}</h4>
                                    <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                        {t.price} MAD/j
                                    </span>
                                </div>

                                <p style={styles.meta}>
                                    <i className="fas fa-folder me-1"></i>{t.category?.name}
                                </p>
                                <p style={styles.meta}>
                                    <i className="fas fa-user me-1"></i>{t.user?.name}
                                </p>

                                <span style={{
                                    ...styles.condBadge,
                                    background: t.condition === 'new' ? '#dcfce7' : t.condition === 'good' ? '#fef9c3' : '#fee2e2',
                                    color: t.condition === 'new' ? '#16a34a' : t.condition === 'good' ? '#854d0e' : '#dc2626',
                                }}>
                                    {t.condition === 'new' ? 'Neuf' : t.condition === 'good' ? 'Bon état' : 'Correct'}
                                </span>

                                {/* Actions */}
                                <button
                                    onClick={() => setConfirm(t.id)}
                                    style={styles.deleteBtn}
                                >
                                    <i className="fas fa-trash me-1"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal confirmation */}
            {confirm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{
                                background: '#fee2e2', borderRadius: '50%', width: 56, height: 56,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <i className="fas fa-trash" style={{ color: '#dc2626', fontSize: '1.25rem' }}></i>
                            </div>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Supprimer cet outil ?</h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Cette action est irréversible.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setConfirm(null)} style={styles.cancelBtn}>Annuler</button>
                            <button onClick={() => handleDelete(confirm)} style={styles.confirmBtn}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    pageTitle: { fontWeight: 800, fontSize: '1.3rem', margin: 0, color: '#1e293b' },
    pageSubtitle: { color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
    card: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
    img: { width: '100%', height: 160, objectFit: 'cover' },
    placeholder: { height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '3rem', color: '#94a3b8' },
    meta: { color: '#64748b', fontSize: '0.78rem', margin: '0.2rem 0' },
    condBadge: { display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, marginTop: '0.4rem' },
    deleteBtn: { width: '100%', marginTop: '0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 },
    modal: { background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
    cancelBtn: { flex: 1, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 },
    confirmBtn: { flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600 },
};