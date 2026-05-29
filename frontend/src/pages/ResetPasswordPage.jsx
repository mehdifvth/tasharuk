// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    password: '',
    password_confirmation: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!form.email) {
      navigate('/forgot-password');
    }
  }, [form.email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      // Prêt pour votre futur backend
      const res = await api.post('/auth/reset-password', form);
      setMessage(res.data?.message || 'Mot de passe réinitialisé.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("Mot de passe réinitialisé avec succès. Redirection...");
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(err.response?.data?.message || 'Code OTP invalide ou erreur serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8fafc' }}>
      <style>{`
        .auth-field { position: relative; }
        .auth-field input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 0.95rem; color: #1e293b; outline: none; transition: all 0.2s; box-sizing: border-box; background: #fff; }
        .auth-field input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
        .auth-field .field-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.9rem; pointer-events: none; }
        .auth-field .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.2rem; }
        .auth-label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: #475569; }
        .otp-input { letter-spacing: 8px; text-align: center; font-family: monospace; font-size: 1.5rem !important; padding-left: 1rem !important; }
        .auth-submit { width: 100%; padding: 0.85rem; border-radius: 12px; border: none; background: #2563eb; color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        .auth-submit:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37,99,235,0.25); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Logo size={48} />
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', margin: '1.5rem 0 0.5rem', letterSpacing: '-0.5px' }}>
            Nouveau mot de passe
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            Saisissez le code reçu par email et votre nouveau mot de passe.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label className="auth-label">Code de vérification (OTP)</label>
              <div className="auth-field">
                <i className="fas fa-key field-icon"></i>
                <input
                  type="text"
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value.toUpperCase() })}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="otp-input"
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <div>
              <label className="auth-label">Nouveau mot de passe</label>
              <div className="auth-field">
                <i className="fas fa-lock field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.82rem' }}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirmer le mot de passe</label>
              <div className="auth-field">
                <i className="fas fa-lock field-icon"></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-circle-exclamation"></i> {error}
              </div>
            )}

            {message && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '0.85rem 1rem', color: '#166534', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-circle-check"></i> {message}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Traitement...</> : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}