// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [confirm, setConfirm] = useState(null);

    const fetchUsers = () => {
        api.get('/admin/data')
            .then(r => setUsers(r.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setConfirm(null);
            fetchUsers();
        } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    };

    const handleRestore = async (id) => {
        try {
            await api.post(`/admin/users/${id}/restore`);
            fetchUsers();
        } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    };

    const filtered = users.filter(u => {
        const matchRole =
            filter === 'all' ||
            (filter === 'admin' && u.is_admin) ||
            (filter === 'owner' && !u.is_admin && u.role === 'owner') ||
            (filter === 'borrower' && !u.is_admin && u.role === 'borrower') ||
            (filter === 'deleted' && u.deleted_at);
        const matchSearch =
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const counts = {
        all: users.length,
        admin: users.filter(u => u.is_admin).length,
        owner: users.filter(u => !u.is_admin && u.role === 'owner').length,
        borrower: users.filter(u => !u.is_admin && u.role === 'borrower').length,
        deleted: users.filter(u => u.deleted_at).length,
    };

    const FILTERS = [
        { key: 'all', label: 'Tous', color: '#6366f1', bg: '#eef2ff', icon: 'fa-users' },
        { key: 'admin', label: 'Admins', color: '#f59e0b', bg: '#fef9c3', icon: 'fa-crown' },
        { key: 'owner', label: 'Propriétaires', color: '#0ea5e9', bg: '#e0f2fe', icon: 'fa-tools' },
        { key: 'borrower', label: 'Emprunteurs', color: '#10b981', bg: '#d1fae5', icon: 'fa-user' },
        { key: 'deleted', label: 'Supprimés', color: '#dc2626', bg: '#fee2e2', icon: 'fa-user-slash' },
    ];

    const ROLE_STYLE = {
        admin: { bg: '#fef9c3', color: '#92400e', label: 'Admin', icon: 'fa-crown' },
        owner: { bg: '#e0f2fe', color: '#0369a1', label: 'Propriétaire', icon: 'fa-tools' },
        borrower: { bg: '#d1fae5', color: '#065f46', label: 'Emprunteur', icon: 'fa-user' },
    };

    const getRoleKey = (u) => u.is_admin ? 'admin' : u.role === 'owner' ? 'owner' : 'borrower';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.75rem', color: '#6366f1' }}></i>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Utilisateurs</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {users.length} utilisateur(s) inscrit(s)
                </p>
            </div>

            {/* Filter cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {FILTERS.map(f => (
                    <div
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            background: '#fff', borderRadius: 12, padding: '0.85rem', cursor: 'pointer',
                            border: `2px solid ${filter === f.key ? f.color : '#f1f5f9'}`,
                            transition: 'border-color 0.15s',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: f.color }}>{counts[f.key]}</span>
                            <div style={{
                                background: filter === f.key ? f.bg : '#f8fafc', borderRadius: 8,
                                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s'
                            }}>
                                <i className={`fas ${f.icon}`} style={{ color: filter === f.key ? f.color : '#94a3b8', fontSize: '0.82rem' }}></i>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: 0 }}>{f.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 340, marginBottom: '1rem' }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}></i>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
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
                                {['Utilisateur', 'Email', 'Rôle', 'Actions'].map(h => (
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
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : filtered.map(u => {
                                const role = getRoleKey(u);
                                const rs = ROLE_STYLE[role];
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s', opacity: u.deleted_at ? 0.6 : 1 }}>
                                        <td style={TD}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%',
                                                    background: rs.bg, color: rs.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                                                }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{u.email}</span>
                                        </td>
                                        <td style={TD}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    background: rs.bg, color: rs.color,
                                                    padding: '0.2rem 0.65rem', borderRadius: 20,
                                                    fontSize: '0.72rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                                                }}>
                                                    <i className={`fas ${rs.icon}`}></i> {rs.label}
                                                </span>
                                                {u.deleted_at && (
                                                    <span style={{
                                                        background: '#fee2e2', color: '#dc2626',
                                                        padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800,
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        Supprimé
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            {u.deleted_at ? (
                                                <button
                                                    onClick={() => handleRestore(u.id)}
                                                    style={{
                                                        padding: '0.3rem 0.75rem', borderRadius: 6,
                                                        border: '1px solid #10b981', background: '#fff',
                                                        color: '#10b981', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                                                    }}
                                                >
                                                    <i className="fas fa-undo me-1"></i>Restaurer
                                                </button>
                                            ) : !u.is_admin && (
                                                <button
                                                    onClick={() => setConfirm(u)}
                                                    style={{
                                                        padding: '0.3rem 0.75rem', borderRadius: 6,
                                                        border: '1px solid #fca5a5', background: '#fff',
                                                        color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                                                    }}
                                                >
                                                    <i className="fas fa-trash me-1"></i>Supprimer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
                                <i className="fas fa-user-times" style={{ color: '#dc2626' }}></i>
                            </div>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 0.3rem' }}>
                                Supprimer {confirm.name} ?
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                Cette action déplacera l'utilisateur dans la liste des supprimés.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setConfirm(null)} style={S.cancelBtn}>Annuler</button>
                            <button onClick={() => handleDelete(confirm.id)} style={S.confirmBtn}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const TD = { padding: '0.75rem 1rem', verticalAlign: 'middle' };

const S = {
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