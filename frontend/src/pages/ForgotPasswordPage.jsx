// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // Prêt pour votre futur backend
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data?.message || 'Code de récupération envoyé à votre adresse email.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      // Si l'API n'est pas encore branchée (404), on simule le succès visuel
      if (err.response?.status === 404) {
         setMessage("Code de récupération envoyé à votre adresse email.");
         setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
      } else {
         setError(err.response?.data?.message || 'Une erreur est survenue.');
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
        .auth-label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: #475569; }
        .auth-submit { width: 100%; padding: 0.85rem; border-radius: 12px; border: none; background: #2563eb; color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
        .auth-submit:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37,99,235,0.25); }
        .auth-submit:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Logo size={48} />
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', margin: '1.5rem 0 0.5rem', letterSpacing: '-0.5px' }}>
            Mot de passe oublié ?
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            Pas d'inquiétude, saisissez votre e-mail et nous vous enverrons un code de récupération.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="auth-label">Adresse Email</label>
              <div className="auth-field">
                <i className="fas fa-envelope field-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '0.85rem 1rem', color: '#dc2626', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                <i className="fas fa-circle-exclamation"></i> {error}
              </div>
            )}

            {message && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '0.85rem 1rem', color: '#166534', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                <i className="fas fa-circle-check"></i> {message}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Envoi en cours...</> : <>Envoyer le code <i className="fas fa-paper-plane" style={{ fontSize: '0.8rem' }}></i></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <Link to="/login" style={{ color: '#64748b', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-arrow-left" style={{ fontSize: '0.75rem' }}></i> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}