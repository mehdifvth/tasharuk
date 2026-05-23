import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, updateRole, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSwitch = async () => {
        const newRole = user.role === 'owner' ? 'borrower' : 'owner';
        setLoading(true);
        const res = await updateRole(newRole);
        setLoading(false);
        if (res.success) {
            setMsg(<><i className="fas fa-check-circle me-1"></i>Rôle changé en {newRole === 'owner' ? 'Propriétaire' : 'Emprunteur'}</>);
            setTimeout(() => setMsg(null), 3000);
        } else {
            setMsg(res.error);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const res = await deleteAccount();
        setLoading(false);
        if (res.success) {
            navigate('/login');
        } else {
            setMsg(res.error);
        }
    };

    if (!user) return null;

    const roleConfig = user.is_admin
        ? { label: 'Administrateur', icon: 'fa-shield-alt', color: '#92400e', bg: '#fef3c7' }
        : user.role === 'owner'
            ? { label: 'Propriétaire', icon: 'fa-wrench', color: '#1d4ed8', bg: '#dbeafe' }
            : { label: 'Emprunteur', icon: 'fa-user', color: '#16a34a', bg: '#dcfce7' };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem' }}>
            <style>{`
        .profile-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          max-width: 480px;
          margin: 0 auto;
        }
        .switch-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .switch-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
        .switch-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .delete-btn {
          width: 100%;
          padding: 0.7rem;
          margin-top: 0.75rem;
          border-radius: 10px;
          border: none;
          background: #fff;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .delete-btn:hover { color: #dc2626; background: #fef2f2; }
      `}</style>

            <div className="profile-card">
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #bad7df 0%, #1f7bde 100%)', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.25rem' }}>{user.name}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', margin: 0 }}>{user.email}</p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {/* Role badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: roleConfig.bg, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                <i className={`fas ${roleConfig.icon}`} style={{ color: roleConfig.color }}></i>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rôle actuel</p>
                                <p style={{ fontWeight: 700, color: roleConfig.color, margin: 0 }}>{roleConfig.label}</p>
                            </div>
                        </div>
                        <i className={`fas ${roleConfig.icon}`} style={{ color: roleConfig.color, fontSize: '1.1rem', opacity: 0.5 }}></i>
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            { icon: 'fa-user', label: 'Nom', value: user.name },
                            { icon: 'fa-envelope', label: 'Email', value: user.email },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className={`fas ${item.icon}`} style={{ color: '#2563eb', fontSize: '0.85rem' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.label}</p>
                                    <p style={{ fontWeight: 600, color: '#374151', margin: 0, fontSize: '0.92rem' }}>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    {user.is_admin ? (
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                                <i className="fas fa-shield-alt me-1"></i> Accès complet à la plateforme
                            </p>
                            <button className="switch-btn" onClick={() => navigate('/admin')}>
                                <i className="fas fa-cog me-2"></i>Tableau de bord Admin
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '0.85rem' }}>
                                {user.role === 'owner' ? <><i className="fas fa-user me-2"></i>Vous voulez louer des outils ?</> : <><i className="fas fa-tools me-2"></i>Vous voulez proposer des outils ?</>}
                            </p>
                            <button className="switch-btn" onClick={handleSwitch} disabled={loading}>
                                {loading
                                    ? <><i className="fas fa-spinner fa-spin me-2"></i>Changement...</>
                                    : `Passer en ${user.role === 'owner' ? 'Emprunteur' : 'Propriétaire'}`
                                }
                            </button>
                        </div>
                    )}

                    {msg && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '0.75rem', textAlign: 'center', marginBottom: '1rem' }}>
                            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{msg}</p>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: '1.5px solid #fca5a5', background: '#fff', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Se déconnecter
                    </button>

                    {!user.is_admin && (
                        <>
                            {showDeleteConfirm ? (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: 12, border: '1px solid #fee2e2' }}>
                                    <p style={{ color: '#991b1b', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
                                        Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={handleDelete}
                                            disabled={loading}
                                            style={{ flex: 1, padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            {loading ? '...' : 'Confirmer'}
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            style={{ flex: 1, padding: '0.5rem', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                                    <i className="fas fa-trash-alt"></i> Supprimer mon compte
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}