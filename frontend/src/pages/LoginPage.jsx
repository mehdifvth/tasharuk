// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(form);
    if (res.success) {
      if (res.user?.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="container" style={styles.wrapper}>
      <div className="card" style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Logo size={48} showText={false} />
        </div>
        <h2 style={styles.title}>Connexion</h2>
        <p style={styles.sub}>Bienvenue sur Tasharuk</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={label}>Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="ahmed@example.com"
            />
          </div>
          <div>
            <label style={label}>Mot de passe</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required placeholder="••••••••"
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
          Pas encore de compte ? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

const label = { display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem', color: '#374151' };
const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', paddingTop: '3rem' },
  card:    { width: '100%', maxWidth: 420 },
  title:   { fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.25rem' },
  sub:     { color: '#64748b', marginBottom: '1.5rem' },
  form:    { display: 'flex', flexDirection: 'column', gap: '1rem' },
};
