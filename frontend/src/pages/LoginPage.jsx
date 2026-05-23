import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const INPUT = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#374151', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };
const LABEL = { display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' };

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    const res = await login(form);
    if (res.success) navigate(res.user?.is_admin ? '/admin/dashboard' : '/');
    else setError(res.error);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <style>{`.auth-input:focus { border-color: #2563eb !important; }`}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size={48} showText={false} />
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: '1rem 0 0.25rem' }}>Bon retour !</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Connectez-vous à votre compte Tasharuk</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            <div>
              <label style={LABEL}>Email</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
                <input type="email" name="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="ahmed@example.com" className="auth-input" style={{ ...INPUT, paddingLeft: 36 }} />
              </div>
            </div>

            <div>
              <label style={LABEL}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="••••••••" className="auth-input" style={{ ...INPUT, paddingLeft: 36, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.85rem' }}></i>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}