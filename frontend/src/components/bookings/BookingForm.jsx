import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LABEL = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: '#374151' };
const INPUT = { width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', color: '#374151', outline: 'none', boxSizing: 'border-box', background: '#fff' };

export default function BookingForm({ toolId, toolPrice, onSuccess }) {
  const { token } = useAuth();
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [form, setForm] = useState({ start_date: '', end_date: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!token) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '0.75rem' }}>Connectez-vous pour réserver cet outil.</p>
      <Link to="/login"><button style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Se connecter</button></Link>
    </div>
  );

  const getDuration = () => {
    if (!form.start_date || !form.end_date) return null;
    const diff = new Date(form.end_date) - new Date(form.start_date);
    if (diff <= 0) return null;
    const totalHours = diff / 3600000;
    if (totalHours < 12) return null;
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days} jour${days > 1 ? 's' : ''}`;
    return `${days} jour${days > 1 ? 's' : ''} ${hours}h`;
  };

  const getTotalPrice = () => {
    if (!form.start_date || !form.end_date || !toolPrice) return null;
    const diffMins = (new Date(form.end_date) - new Date(form.start_date)) / 60000;
    if (diffMins < 12 * 60) return null;
    
    if (diffMins <= 1440) {
      return parseFloat(toolPrice).toFixed(2);
    } else {
      const pricePerMin = toolPrice / 1440;
      return (diffMins * pricePerMin).toFixed(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const diffHours = (new Date(form.end_date) - new Date(form.start_date)) / 3600000;
    if (diffHours <= 0) { setError('La date de fin doit être après la date de début.'); return; }
    if (diffHours < 12) { setError("La durée minimale d'une réservation est de 12 heures."); return; }
    setLoading(true);
    try {
      await api.post('/bookings', {
        tool_id: toolId,
        start_date: form.start_date.replace('T', ' ') + ':00',
        end_date: form.end_date.replace('T', ' ') + ':00',
      });
      onSuccess?.();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' — ') : err.response?.data?.message || 'Erreur lors de la réservation.');
    } finally { setLoading(false); }
  };

  const duration = getDuration();
  const totalPrice = getTotalPrice();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <style>{`.booking-input:focus { border-color: #2563eb !important; }`}</style>

      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
        <i className="fas fa-calendar-alt me-2" style={{ color: '#2563eb' }}></i>Réserver cet outil
      </h3>

      <div>
        <label style={LABEL}>Date et heure de début *</label>
        <input type="datetime-local" value={form.start_date} min={localNow} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required className="booking-input" style={INPUT} />
      </div>

      <div>
        <label style={LABEL}>Date et heure de fin *</label>
        <input type="datetime-local" value={form.end_date} min={form.start_date || localNow} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required className="booking-input" style={INPUT} />
      </div>

      {/* Summary */}
      {duration && (
        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#374151' }}>
              <i className="fas fa-clock me-1" style={{ color: '#16a34a' }}></i>
              Durée : <strong>{duration}</strong>
            </span>
            {totalPrice && (
              <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>
                {totalPrice} MAD
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0 0' }}>
            <i className="fas fa-exclamation-triangle me-1" style={{ color: '#f59e0b' }}></i> Minimum 12h facturées par réservation même en cas de retour anticipé
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem' }}>
          <i className="fas fa-exclamation-circle me-1"></i>{error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
      >
        {loading ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <><i className="fas fa-paper-plane"></i> Envoyer la demande</>}
      </button>
    </form>
  );
}