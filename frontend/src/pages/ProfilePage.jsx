import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, updateRole, logout } = useAuth();
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSwitch = async () => {
        const newRole = user.role === 'owner' ? 'borrower' : 'owner';
        setLoading(true);
        const res = await updateRole(newRole);
        setLoading(false);
        if (res.success) {
            setMsg(`Rôle changé en ${newRole === 'owner' ? 'Propriétaire' : 'Emprunteur'} ✅`);
        } else {
            setMsg(res.error);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={styles.wrapper}>
            <div className="card" style={styles.card}>
                <h2 style={styles.title}>
                    <i className="fas fa-user-circle me-2 text-primary"></i>Mon Profil
                </h2>

                <div style={styles.info}>
                    <p><strong>Nom :</strong> {user.name}</p>
                    <p><strong>Email :</strong> {user.email}</p>
                    <p>
                        <strong>Rôle actuel :</strong>{' '}
                        <span style={user.is_admin ? styles.admin : user.role === 'owner' ? styles.owner : styles.borrower}>
                            {user.is_admin ? '👑 Administrateur' : user.role === 'owner' ? '🔧 Propriétaire' : '📦 Emprunteur'}
                        </span>
                    </p>
                </div>

                {user.is_admin ? (
                    <div style={styles.switchBox}>
                        <p style={styles.switchText}>
                            <i className="fas fa-shield-alt me-2"></i>Accès complet à la plateforme
                        </p>
                        <button className="btn-primary" onClick={() => window.location.href = '/admin'}>
                            <i className="fas fa-cog me-1"></i> Tableau de bord Admin
                        </button>
                    </div>
                ) : (
                    <div style={styles.switchBox}>
                        <p style={styles.switchText}>
                            {user.role === 'owner'
                                ? 'Vous voulez louer des outils ?'
                                : 'Vous voulez proposer des outils ?'}
                        </p>
                        <button className="btn-primary" onClick={handleSwitch} disabled={loading}>
                            {loading ? 'Changement...' : `Passer en ${user.role === 'owner' ? 'Emprunteur' : 'Propriétaire'}`}
                        </button>
                    </div>
                )}

                {msg && <p style={styles.msg}>{msg}</p>}

                <button onClick={logout} style={styles.logout}>
                    <i className="fas fa-sign-out-alt me-1"></i> Se déconnecter
                </button>
            </div>
        </div>
    );
}

const styles = {
    wrapper: { display: 'flex', justifyContent: 'center', paddingTop: '3rem' },
    card: { width: '100%', maxWidth: 450 },
    title: { fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem' },
    info: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' },
    admin: { background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 20, fontWeight: 600 },
    owner: { background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: 20, fontWeight: 600 },
    borrower: { background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontWeight: 600 },
    switchBox: { background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1rem', textAlign: 'center' },
    switchText: { color: '#64748b', marginBottom: '0.75rem' },
    msg: { textAlign: 'center', color: '#16a34a', fontWeight: 600 },
    logout: { width: '100%', marginTop: '1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '0.6rem', fontWeight: 600, cursor: 'pointer' },
};