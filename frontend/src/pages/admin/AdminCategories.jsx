import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchCategories = () => {
        api.get('/admin/data')
            .then(r => setCategories(r.data.categories))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        setAdding(true); setError('');
        try {
            await api.post('/admin/categories', { name: newCat.trim() });
            setNewCat('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Cette catégorie existe déjà');
        } finally { setAdding(false); }
    };

    const filtered = categories.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p style={{ color: '#94a3b8' }}>Chargement...</p>;

    return (
        <div>
            <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: '1.5rem' }}>
                <i className="fas fa-folder me-2" style={{ color: '#f59e0b' }}></i>Catégories
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Formulaire ajout */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '1rem' }}>
                        <i className="fas fa-plus-circle me-2 text-primary"></i>Nouvelle catégorie
                    </h3>
                    <form onSubmit={handleAdd}>
                        <input
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            placeholder="Nom de la catégorie..."
                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.88rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
                            required
                        />
                        {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{error}</p>}
                        <button
                            type="submit"
                            disabled={adding || !newCat.trim()}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', opacity: adding ? 0.7 : 1 }}
                        >
                            {adding ? 'Ajout...' : '+ Ajouter'}
                        </button>
                    </form>

                    {/* Stats */}
                    <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>{categories.length}</p>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Catégories au total</p>
                    </div>
                </div>

                {/* Liste */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {/* Search */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher une catégorie..."
                            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.88rem' }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    {['Catégorie', 'Outils'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucune catégorie trouvée</td></tr>
                                ) : filtered.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <div style={{ background: '#fef9c3', borderRadius: 8, padding: '0.35rem 0.5rem' }}>
                                                    <i className="fas fa-folder" style={{ color: '#f59e0b', fontSize: '0.9rem' }}></i>
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                                {c.tools_count} outil{c.tools_count !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}