// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateRole, logout } = useAuth();
  const navigate = useNavigate();
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleSwitch = async () => {
    const newRole = user.role === 'owner' ? 'borrower' : 'owner';
    setLoading(true);
    const res = await updateRole(newRole);
    setLoading(false);
    if (res.success) {
      setMsg(`Rôle changé en ${newRole === 'owner' ? 'Propriétaire' : 'Emprunteur'} `);
      setTimeout(() => setMsg(null), 3000);
    } else setMsg(res.error);
  };

  if (!user) return null;

  const ROLE = user.is_admin
    ? { label: 'Administrateur', icon: 'fa-shield-alt', color: '#6366f1', bg: '#eef2ff' }
    : user.role === 'owner'
    ? { label: 'Propriétaire',   icon: 'fa-tools',      color: '#2563eb', bg: '#dbeafe' }
    : { label: 'Emprunteur',     icon: 'fa-user',       color: '#059669', bg: '#d1fae5' };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <style>{`
        .prof-btn { width: 100%; padding: 0.75rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.15s; }
        .prof-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .prof-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .info-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
      `}</style>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1rem' }}>
        {/* Gradient banner */}
        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.25rem' }}>{user.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: '0 0 1rem' }}>{user.email}</p>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.3rem 0.9rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
            <i className={`fas ${ROLE.icon} me-1`}></i>{ROLE.label}
          </span>
        </div>

        {/* Info rows */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { icon: 'fa-user',     label: 'Nom',   value: user.name  },
            { icon: 'fa-envelope', label: 'Email', value: user.email },
          ].map(item => (
            <div key={item.label} className="info-row">
              <div style={{ width: 34, height: 34, borderRadius: 9, background: ROLE.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fas ${item.icon}`} style={{ color: ROLE.color, fontSize: '0.82rem' }}></i>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
                <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.9rem' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role switch / Admin */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {user.is_admin ? (
          <>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem', textAlign: 'center' }}>
              <i className="fas fa-shield-alt me-1" style={{ color: '#6366f1' }}></i>
              Accès complet à la plateforme
            </p>
            <button className="prof-btn" onClick={() => navigate('/admin/dashboard')} style={{ background: '#6366f1', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
              <i className="fas fa-cog"></i> Tableau de bord Admin
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.85rem', background: ROLE.bg, borderRadius: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fas ${ROLE.icon}`} style={{ color: ROLE.color, fontSize: '1rem' }}></i>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Rôle actuel</p>
                <p style={{ fontWeight: 800, color: ROLE.color, margin: 0 }}>{ROLE.label}</p>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 0.75rem', textAlign: 'center' }}>
              {user.role === 'owner' ? 'Vous voulez louer des outils ?' : 'Vous voulez proposer des outils ?'}
            </p>
            <button className="prof-btn" onClick={handleSwitch} disabled={loading} style={{ background: '#2563eb', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Changement...</>
                : `Passer en ${user.role === 'owner' ? 'Emprunteur' : 'Propriétaire'}`
              }
            </button>
          </>
        )}

        {msg && (
          <div style={{ marginTop: '0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '0.65rem', textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{msg}</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <button
          onClick={logout}
          className="prof-btn"
          style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <i className="fas fa-sign-out-alt"></i> Se déconnecter
        </button>

        {/* Delete account */}
        {!user.is_admin && !confirm && (
          <button
            onClick={() => setConfirm(true)}
            style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <i className="fas fa-trash-alt"></i> Supprimer mon compte
          </button>
        )}

        {confirm && (
          <div style={{ marginTop: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem' }}>
            <p style={{ color: '#991b1b', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center', margin: '0 0 0.75rem' }}>
              Cette action est irréversible. Confirmer ?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '0.5rem', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                Annuler
              </button>
              <button style={{ flex: 1, padding: '0.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}