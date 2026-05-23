import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const INPUT = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#374151', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };
const LABEL = { display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' };

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'borrower' });
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    if (form.password !== form.password_confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
    const res = await register(form);
    if (res.success) navigate(res.user?.is_admin ? '/admin/dashboard' : '/');
    else setError(res.error);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <style>{`.auth-input:focus { border-color: #2563eb !important; }`}</style>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo size={48} showText={false} />
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: '1rem 0 0.25rem' }}>Créer un compte</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Rejoignez la communauté Tasharuk</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label style={LABEL}>Nom complet</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-user" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
                <input type="text" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ahmed Benali" className="auth-input" style={{ ...INPUT, paddingLeft: 36 }} />
              </div>
            </div>

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
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Minimum 8 caractères" className="auth-input" style={{ ...INPUT, paddingLeft: 36, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.85rem' }}></i>
                </button>
              </div>
            </div>

            <div>
              <label style={LABEL}>Confirmer le mot de passe</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
                <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} required placeholder="Répéter le mot de passe" className="auth-input" style={{ ...INPUT, paddingLeft: 36 }} />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label style={LABEL}>Je suis</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'borrower', emoji: '📦', label: 'Emprunteur', desc: 'Je cherche des outils', color: '#16a34a', bg: '#dcfce7' },
                  { value: 'owner', emoji: '🔧', label: 'Propriétaire', desc: 'Je propose des outils', color: '#1d4ed8', bg: '#dbeafe' },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.85rem 0.5rem', borderRadius: 12, border: `2px solid ${form.role === opt.value ? opt.color : '#e2e8f0'}`, background: form.role === opt.value ? opt.bg : '#fff', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                    <input type="radio" name="role" value={opt.value} checked={form.role === opt.value} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ display: 'none' }} />
                    <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: form.role === opt.value ? opt.color : '#374151' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Création...</> : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}                        