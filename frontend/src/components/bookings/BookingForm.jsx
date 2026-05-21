// src/components/bookings/BookingForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookingForm({ toolId, toolPrice, onSuccess }) {
  const { token } = useAuth();

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  const [form, setForm] = useState({ start_date: '', end_date: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
          Connectez-vous pour réserver cet outil.
        </p>
        <Link to="/login">
          <button className="btn-primary" style={{ width: '100%' }}>Se connecter</button>
        </Link>
      </div>
    );
  }

  // Calcul durée en heures et jours
  const getDuration = () => {
    if (!form.start_date || !form.end_date) return null;
    const diff = new Date(form.end_date) - new Date(form.start_date);
    if (diff <= 0) return null;
    const totalHours = diff / (1000 * 60 * 60);
    if (totalHours < 12) return null; // minimum 12h
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days} jour(s)`;
    return `${days} jour(s) ${hours}h`;
  };

  const getTotalPrice = () => {
    if (!form.start_date || !form.end_date || !toolPrice) return null;
    const diff = new Date(form.end_date) - new Date(form.start_date);
    const totalHours = diff / (1000 * 60 * 60);
    if (totalHours < 12) return null;
    const days = totalHours / 24;
    return (days * toolPrice).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const diffHours = (new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60);
    if (diffHours <= 0) {
      setError('La date de fin doit être après la date de début.');
      return;
    }
    if (diffHours < 12) {
      setError('La durée minimale de réservation est 12 heures.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        tool_id: toolId,
        start_date: form.start_date.replace('T', ' ') + ':00',
        end_date: form.end_date.replace('T', ' ') + ':00',
      });
      onSuccess && onSuccess();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message;
      if (errors) {
        setError(Object.values(errors).flat().join(' — '));
      } else if (message) {
        setError(message);
      } else {
        setError('Erreur lors de la réservation. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const duration = getDuration();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.1rem' }}>
        <i className="fas fa-calendar-alt me-2 text-primary"></i>Réserver cet outil
      </h3>

      <div>
        <label style={label}>Date et heure de début *</label>
        <input
          type="datetime-local"
          value={form.start_date}
          min={localNow}
          onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          required
        />
      </div>

      <div>
        <label style={label}>Date et heure de fin *</label>
        <input
          type="datetime-local"
          value={form.end_date}
          min={form.start_date || localNow}
          onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
          required
        />
      </div>

      {duration && (
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '0.75rem', fontSize: '0.88rem' }}>
          <p style={{ color: '#16a34a', margin: 0 }}>
            <i className="fas fa-clock me-1"></i>Durée : <strong>{duration}</strong>
          </p>
          {getTotalPrice() && (
            <p style={{ color: '#2563eb', margin: '0.3rem 0 0', fontWeight: 700 }}>
              <i className="fas fa-tag me-1"></i>Prix estimé : <strong>{getTotalPrice()} MAD</strong>
            </p>
          )}
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Envoi en cours...' : 'Envoyer la demande de réservation'}
      </button>
    </form>
  );
}

const label = {
  display: 'block', fontSize: '0.88rem',
  fontWeight: 600, marginBottom: '0.3rem', color: '#374151',
};