// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'borrower' });
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    const res = await register(form);
    if (res.success) {
      navigate('/');
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
        <h2 style={styles.title}>Créer un compte</h2>
        <p style={styles.sub}>Rejoignez la communauté Tasharuk</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={label}>Nom complet</label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required placeholder="Ahmed Benali"
            />
          </div>
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
              onChange={handleChange} required placeholder="Minimum 8 caractères"
            />
          </div>
          <div>
            <label style={label}>Confirmer le mot de passe</label>
            <input
              type="password" name="password_confirmation" value={form.password_confirmation}
              onChange={handleChange} required placeholder="Répéter le mot de passe"
            />
          </div>
          <div>
            <label style={label}>Je suis</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="borrower">Emprunteur — je cherche des outils</option>
              <option value="owner">Propriétaire — je propose des outils</option>
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
          Déjà un compte ? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const label = { display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.3rem', color: '#374151' };
const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', paddingTop: '3rem' },
  card: { width: '100%', maxWidth: 420 },
  title: { fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.25rem' },
  sub: { color: '#64748b', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
};
