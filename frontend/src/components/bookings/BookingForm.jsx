// src/components/bookings/BookingForm.jsx
// FIX: validation côté client des dates + messages d'erreur détaillés depuis Laravel

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookingForm({ toolId, onSuccess }) {
  const { token } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  const [form,    setForm]    = useState({ start_date: '', end_date: '' });
  const [error,   setError]   = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation côté client
    if (form.end_date <= form.start_date) {
      setError('La date de fin doit être après la date de début.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        tool_id:    toolId,
        start_date: form.start_date,
        end_date:   form.end_date,
      });
      onSuccess && onSuccess();
    } catch (err) {
      // Gère les erreurs de validation Laravel (errors object) et les messages simples
      const errors  = err.response?.data?.errors;
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.1rem' }}>
        <i className="fas fa-calendar-alt me-2 text-primary"></i>Réserver cet outil
      </h3>

      <div>
        <label style={label}>Date de début *</label>
        <input
          type="date"
          value={form.start_date}
          min={today}
          onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          required
        />
      </div>

      <div>
        <label style={label}>Date de fin *</label>
        <input
          type="date"
          value={form.end_date}
          min={form.start_date || today}
          onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
          required
        />
      </div>

      {form.start_date && form.end_date && form.end_date > form.start_date && (
        <p style={{ color: '#16a34a', fontSize: '0.85rem' }}>
          <i className="fas fa-check-circle me-1"></i>Durée : {Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000*60*60*24))} jour(s)
        </p>
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
