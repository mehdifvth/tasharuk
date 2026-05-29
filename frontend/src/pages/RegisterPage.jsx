// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'borrower' });
  const [error,   setError]   = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [step,    setStep]    = useState(1); // 1 = infos, 2 = rôle

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    if (form.password !== form.password_confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    const res = await register(form);
    if (res.success) navigate('/');
    else setError(res.error);
  };

  const ROLES = [
    { value: 'borrower', emoji: '📦', label: 'Emprunteur', desc: 'Je cherche des outils à louer', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
    { value: 'owner',    emoji: '🔧', label: 'Propriétaire', desc: 'Je propose mes outils à la location', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8fafc' }}>
      <style>{`
        .reg-field { position: relative; }
        .reg-field input { width: 100%; padding: 0.7rem 0.9rem 0.7rem 2.5rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.9rem; color: #374151; outline: none; transition: border-color 0.15s; box-sizing: border-box; background: #fff; }
        .reg-field input:focus { border-color: #2563eb; }
        .reg-field .fi { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.82rem; pointer-events: none; }
        .reg-field .pt { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; }
        .reg-label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: #374151; }
        .reg-btn { width: 100%; padding: 0.75rem; border-radius: 10px; border: none; background: #2563eb; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.15s; }
        .reg-btn:hover:not(:disabled) { background: #1d4ed8; }
        .reg-btn:disabled { background: #93c5fd; cursor: not-allowed; }
        .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; transition: all 0.2s; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo size={44} />
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: '1.25rem 0 0.3rem' }}>
            Créer un compte
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Rejoignez la communauté Tasharuk
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div className="step-dot" style={{ background: '#2563eb', color: '#fff' }}>1</div>
          <div style={{ height: 2, width: 48, background: step === 2 ? '#2563eb' : '#e2e8f0', borderRadius: 2, transition: 'background 0.3s' }}></div>
          <div className="step-dot" style={{ background: step === 2 ? '#2563eb' : '#f1f5f9', color: step === 2 ? '#fff' : '#94a3b8' }}>2</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
            {step === 1 ? 'Informations' : 'Votre rôle'}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '2rem' }}>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="reg-label">Nom complet</label>
                <div className="reg-field">
                  <i className="fas fa-user fi"></i>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Jean Dupont" />
                </div>
              </div>

              <div>
                <label className="reg-label">Email</label>
                <div className="reg-field">
                  <i className="fas fa-envelope fi"></i>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="nom@exemple.com" />
                </div>
              </div>

              <div>
                <label className="reg-label">Mot de passe</label>
                <div className="reg-field">
                  <i className="fas fa-lock fi"></i>
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required placeholder="Choisissez un mot de passe robuste"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" className="pt" onClick={() => setShowPwd(!showPwd)}>
                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.82rem' }}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="reg-label">Confirmation</label>
                <div className="reg-field">
                  <i className="fas fa-lock fi"></i>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password_confirmation}
                    onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                    required
                    placeholder="Confirmez votre mot de passe"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" className="pt" onClick={() => setShowPwd(!showPwd)}>
                    <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.82rem' }}></i>
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <button type="submit" className="reg-btn">
                Continuer <i className="fas fa-arrow-right"></i>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.4rem' }}>
                  Quel est votre rôle principal ?
                </p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 1.25rem' }}>
                  Vous pourrez changer de rôle à tout moment depuis votre profil.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ROLES.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem 1.25rem', borderRadius: 14,
                        border: `2px solid ${form.role === opt.value ? opt.border : '#f1f5f9'}`,
                        background: form.role === opt.value ? opt.bg : '#fff',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <input type="radio" name="role" value={opt.value} checked={form.role === opt.value} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ display: 'none' }} />
                      <span style={{ fontSize: '2rem', flexShrink: 0 }}>{opt.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.92rem', color: form.role === opt.value ? opt.color : '#0f172a', margin: 0 }}>{opt.label}</p>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{opt.desc}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.role === opt.value ? opt.color : '#e2e8f0'}`, background: form.role === opt.value ? opt.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {form.role === opt.value && <i className="fas fa-check" style={{ color: '#fff', fontSize: '0.6rem' }}></i>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                  <i className="fas fa-arrow-left me-1"></i> Retour
                </button>
                <button type="submit" className="reg-btn" disabled={loading} style={{ flex: 2 }}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Création...</> : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}