// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form,     setForm]    = useState({ email: '', password: '' });
  const [error,    setError]   = useState(null);
  const [showPwd,  setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    const res = await login(form);
    if (res.success) navigate(res.user?.is_admin ? '/admin/dashboard' : '/');
    else setError(res.error);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8fafc' }}>
      <style>{`
        .auth-field { position: relative; }
        .auth-field input { width: 100%; padding: 0.7rem 0.9rem 0.7rem 2.5rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.9rem; color: #374151; outline: none; transition: border-color 0.15s; box-sizing: border-box; background: #fff; }
        .auth-field input:focus { border-color: #2563eb; }
        .auth-field .field-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.82rem; pointer-events: none; }
        .auth-field .pwd-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.2rem; }
        .auth-label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: #374151; }
        .auth-submit { width: 100%; padding: 0.75rem; border-radius: 10px; border: none; background: #2563eb; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.15s; }
        .auth-submit:hover:not(:disabled) { background: #1d4ed8; }
        .auth-submit:disabled { background: #93c5fd; cursor: not-allowed; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size={44} />
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: '1.25rem 0 0.3rem' }}>
            Bon retour !
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            <div>
              <label className="auth-label">Email</label>
              <div className="auth-field">
                <i className="fas fa-envelope field-icon"></i>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="auth-label">Mot de passe</label>
              <div className="auth-field">
                <i className="fas fa-lock field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required placeholder="Saisissez votre mot de passe"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.82rem' }}></i>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>S'inscrire</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: '1.25rem', background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '1rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 0.6rem' }}>
            Comptes de démonstration
          </p>
          {[
            { role: 'Admin', email: 'admin@tasharuk.com', pwd: 'password123', color: '#6366f1', bg: '#eef2ff' },
            { role: 'Propriétaire', email: 'ahmed@tasharuk.com', pwd: 'password', color: '#2563eb', bg: '#dbeafe' },
            { role: 'Emprunteur', email: 'sara@tasharuk.com', pwd: 'password', color: '#059669', bg: '#d1fae5' },
          ].map(d => (
            <button
              key={d.role}
              type="button"
              onClick={() => setForm({ email: d.email, password: d.pwd })}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '0.5rem 0.75rem', cursor: 'pointer', marginBottom: '0.4rem', transition: 'background 0.15s' }}
            >
              <span style={{ background: d.bg, color: d.color, fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 6 }}>{d.role}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}