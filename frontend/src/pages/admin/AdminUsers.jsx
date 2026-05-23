import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchUsers = () => {
        api.get('/admin/data')
            .then(r => setUsers(r.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        try { await api.delete(`/admin/users/${id}`); fetchUsers(); }
        catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    };

    const filtered = users.filter(u => {
        const matchRole = filter === 'all'
            || (filter === 'admin' && u.is_admin)
            || (filter === 'owner' && !u.is_admin && u.role === 'owner')
            || (filter === 'borrower' && !u.is_admin && u.role === 'borrower');
        const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase())
            || u.email?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const counts = {
        all: users.length,
        admin: users.filter(u => u.is_admin).length,
        owner: users.filter(u => !u.is_admin && u.role === 'owner').length,
        borrower: users.filter(u => !u.is_admin && u.role === 'borrower').length,
    };

    if (loading) return <p style={{ color: '#94a3b8' }}>Chargement...</p>;

    return (
        <div>
            <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: '1.5rem' }}>
                <i className="fas fa-users me-2 text-success"></i>Utilisateurs
            </h2>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { key: 'all', label: 'Total', color: '#2563eb', bg: '#dbeafe', icon: 'fa-users' },
                    { key: 'admin', label: 'Admins', color: '#dc2626', bg: '#fee2e2', icon: 'fa-shield-alt' },
                    { key: 'owner', label: 'Propriétaires', color: '#f59e0b', bg: '#fef9c3', icon: 'fa-wrench' },
                    { key: 'borrower', label: 'Emprunteurs', color: '#16a34a', bg: '#dcfce7', icon: 'fa-user' },
                ].map(s => (
                    <div key={s.key} onClick={() => setFilter(s.key)} style={{ background: '#fff', border: `2px solid ${filter === s.key ? s.color : '#e2e8f0'}`, borderRadius: 10, padding: '0.85rem', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{counts[s.key]}</span>
                            <div style={{ background: s.bg, borderRadius: 8, padding: '0.35rem 0.5rem' }}>
                                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '0.9rem' }}></i>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: '0.25rem 0 0' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: 320 }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.88rem' }}
                />
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['Utilisateur', 'Email', 'Rôle', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Aucun utilisateur trouvé</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.is_admin ? '#fee2e2' : u.role === 'owner' ? '#dbeafe' : '#dcfce7', color: u.is_admin ? '#dc2626' : u.role === 'owner' ? '#1d4ed8' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={td}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email}</span></td>
                                    <td style={td}>
                                        <span style={{
                                            padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                                            background: u.is_admin ? '#fef3c7' : u.role === 'owner' ? '#dbeafe' : '#dcfce7',
                                            color: u.is_admin ? '#92400e' : u.role === 'owner' ? '#1d4ed8' : '#16a34a',
                                        }}>
                                            {u.is_admin ? '👑 Admin' : u.role === 'owner' ? '🔧 Propriétaire' : '👤 Emprunteur'}
                                        </span>
                                    </td>
                                    <td style={td}>
                                        {!u.is_admin && (
                                            <button onClick={() => handleDelete(u.id)} style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                                <i className="fas fa-trash me-1"></i>Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const td = { padding: '0.75rem 1rem', verticalAlign: 'middle' };