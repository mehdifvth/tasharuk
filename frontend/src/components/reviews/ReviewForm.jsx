// src/components/reviews/ReviewForm.jsx
// FIX: ajout prop onCancel pour fermer le formulaire depuis BookingsPage

import React, { useState } from 'react';
import api from '../../services/api';

export default function ReviewForm({ bookingId, onSuccess, onCancel }) {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.post('/reviews', {
        booking_id: bookingId,
        rating:     Number(rating),
        comment:    comment || null,
      });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h4 style={{ fontWeight: 700, marginBottom: '0.1rem' }}><i className="fas fa-comment-dots text-primary me-2"></i>Laisser un avis</h4>

      <div>
        <label style={label}>Note</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value={5}>Excellent (5/5)</option>
          <option value={4}>Très bien (4/5)</option>
          <option value={3}>Bien (3/5)</option>
          <option value={2}>Passable (2/5)</option>
          <option value={1}>Décevant (1/5)</option>
        </select>
      </div>

      <div>
        <label style={label}>Commentaire (optionnel)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Partagez votre expérience..."
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Envoi...' : 'Soumettre l\'avis'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            style={{ background: 'none', color: '#64748b', padding: '0 1rem' }}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

const label = {
  display: 'block', fontSize: '0.88rem',
  fontWeight: 600, marginBottom: '0.3rem', color: '#374151',
};
