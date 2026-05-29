// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateRole, logout } = useAuth();
  const navigate = useNavigate();
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // Password change state
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [showSecurity, setShowSecurity] = useState(false);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdMsg(null);
    
    if (pwdForm.password !== pwdForm.password_confirmation) {
      setPwdError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    setPwdLoading(true);
    try {
      const res = await api.put('/user/password', pwdForm);
      setPwdMsg(res.data.message || 'Mot de passe mis à jour avec succès.');
      setPwdForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setPwdLoading(false);
    }
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
        
        .prof-field { position: relative; margin-bottom: 0.85rem; }
        .prof-field input { width: 100%; padding: 0.7rem 0.9rem 0.7rem 2.6rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.88rem; color: #1e293b; outline: none; transition: all 0.2s; box-sizing: border-box; background: #f8fafc; }
        .prof-field input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .prof-field .field-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.85rem; pointer-events: none; }
        .prof-field .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.2rem; }
        .prof-label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: #475569; }
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

      {/* Change Password Section (Accordion) */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <button 
          onClick={() => setShowSecurity(!showSecurity)}
          style={{ 
            width: '100%', 
            background: 'none', 
            border: 'none', 
            padding: 0, 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            cursor: 'pointer' 
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-shield-alt" style={{ color: '#2563eb', fontSize: '0.9rem' }}></i>
            </div>
            Sécurité et connexion
          </h3>
          <i 
            className={`fas fa-chevron-${showSecurity ? 'up' : 'down'}`} 
            style={{ color: '#94a3b8', transition: 'transform 0.3s' }}
          ></i>
        </button>
        
        {showSecurity && (
          <form onSubmit={handlePasswordChange} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0', animation: 'fadeIn 0.3s ease' }}>
            <div>
              <label className="prof-label">Mot de passe actuel</label>
              <div className="prof-field">
                <i className="fas fa-unlock field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwdForm.current_password}
                  onChange={e => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                  required
                  placeholder="Votre mot de passe actuel"
                  style={{ paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="prof-label">Nouveau mot de passe</label>
              <div className="prof-field">
                <i className="fas fa-key field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwdForm.password}
                  onChange={e => setPwdForm({ ...pwdForm, password: e.target.value })}
                  required
                  placeholder="Nouveau mot de passe"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="prof-label">Confirmer le nouveau mot de passe</label>
              <div className="prof-field" style={{ marginBottom: '1.25rem' }}>
                <i className="fas fa-check-circle field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwdForm.password_confirmation}
                  onChange={e => setPwdForm({ ...pwdForm, password_confirmation: e.target.value })}
                  required
                  placeholder="Répétez le nouveau mot de passe"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {pwdError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                <i className="fas fa-circle-exclamation"></i> {pwdError}
              </div>
            )}
            {pwdMsg && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '0.75rem', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                <i className="fas fa-circle-check"></i> {pwdMsg}
              </div>
            )}

            <button type="submit" className="prof-btn" disabled={pwdLoading || !pwdForm.current_password || !pwdForm.password || !pwdForm.password_confirmation} style={{ background: '#0f172a', color: '#fff' }}>
              {pwdLoading ? <><i className="fas fa-spinner fa-spin"></i> Mise à jour...</> : 'Mettre à jour le mot de passe'}
            </button>
          </form>
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