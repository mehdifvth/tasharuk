// src/pages/admin/AdminCategories.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState('');
    const [editCat, setEditCat] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [error, setError] = useState(null);

    const load = () => {
        api.get('/admin/data')
            .then(r => setCategories(r.data.categories))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        try {
            await api.post('/admin/categories', { name: newCat });
            setNewCat(''); setError(null); load();
        } catch { setError('Cette catégorie existe déjà'); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/categories/${editCat.id}`, { name: editCat.name });
            setEditCat(null); load();
        } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/categories/${id}`);
            setConfirm(null); load();
        } catch (err) { alert(err.response?.data?.message || 'Impossible de supprimer'); }
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
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Catégories</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {categories.length} catégorie(s)
                </p>
            </div>

            {/* Add form */}
            <div style={S.card}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: '0 0 0.75rem' }}>
                    <i className="fas fa-plus me-2" style={{ color: '#6366f1' }}></i>Ajouter une catégorie
                </h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        value={newCat}
                        onChange={e => { setNewCat(e.target.value); setError(null); }}
                        placeholder="Nom de la catégorie..."
                        style={{
                            flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8,
                            border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
                        }}
                        required
                    />
                    <button type="submit" style={S.addBtn}>
                        <i className="fas fa-plus me-1"></i> Ajouter
                    </button>
                </form>
                {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '0.4rem 0 0' }}>{error}</p>}
            </div>

            {/* Edit form */}
            {editCat && (
                <div style={{ ...S.card, border: '2px solid #6366f1', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6366f1', margin: '0 0 0.75rem' }}>
                        <i className="fas fa-edit me-2"></i>Modifier la catégorie
                    </h3>
                    <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            value={editCat.name}
                            onChange={e => setEditCat({ ...editCat, name: e.target.value })}
                            style={{
                                flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8,
                                border: '1px solid #a5b4fc', fontSize: '0.85rem', outline: 'none'
                            }}
                            required
                        />
                        <button type="submit" style={{ ...S.addBtn, background: '#6366f1' }}>
                            <i className="fas fa-check me-1"></i> Sauvegarder
                        </button>
                        <button type="button" onClick={() => setEditCat(null)} style={S.cancelBtn}>
                            Annuler
                        </button>
                    </form>
                </div>
            )}

            {/* Categories grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '0.75rem' }}>
                {categories.map((c, i) => {
                    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                    const color = colors[i % colors.length];
                    return (
                        <div key={c.id} style={S.catCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, background: color + '18',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <i className="fas fa-tag" style={{ color, fontSize: '0.9rem' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>{c.name}</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                                        {c.tools_count} outil(s)
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                    onClick={() => setEditCat({ id: c.id, name: c.name })}
                                    style={S.iconBtn}
                                    title="Modifier"
                                >
                                    <i className="fas fa-edit" style={{ color: '#6366f1' }}></i>
                                </button>
                                <button
                                    onClick={() => setConfirm(c)}
                                    style={{ ...S.iconBtn, opacity: c.tools_count > 0 ? 0.4 : 1 }}
                                    disabled={c.tools_count > 0}
                                    title={c.tools_count > 0 ? 'Contient des outils' : 'Supprimer'}
                                >
                                    <i className="fas fa-trash" style={{ color: '#dc2626' }}></i>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

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
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 0.3rem' }}>
                                Supprimer "{confirm.name}" ?
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                Cette action est irréversible.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setConfirm(null)} style={S.cancelBtn}>Annuler</button>
                            <button onClick={() => handleDelete(confirm.id)} style={S.deleteBtn}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const S = {
    card: {
        background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '1rem'
    },
    catCard: {
        background: '#fff', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '0.75rem'
    },
    addBtn: {
        background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8,
        padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
        whiteSpace: 'nowrap'
    },
    iconBtn: {
        background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 6,
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer'
    },
    cancelBtn: {
        flex: 1, background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
    },
    deleteBtn: {
        flex: 1, background: '#dc2626', color: '#fff', border: 'none',
        borderRadius: 8, padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
    },
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)'
    },
    modal: {
        background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 340,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
    },
};