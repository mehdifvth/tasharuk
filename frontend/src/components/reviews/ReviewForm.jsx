// src/components/reviews/ReviewForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';

export default function ReviewForm({ bookingId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Veuillez sélectionner une note.'); return; }
    setLoading(true); setError(null);
    try {
      await api.post('/reviews', {
        booking_id: bookingId,
        rating: Number(rating),
        comment: comment || null,
      });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const labels = { 1: 'Décevant', 2: 'Passable', 3: 'Bien', 4: 'Très bien', 5: 'Excellent' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h4 style={{ fontWeight: 700, marginBottom: '0.1rem' }}>
        <i className="fas fa-comment-dots text-primary me-2"></i>Laisser un avis
      </h4>

      {/* Étoiles */}
      <div>
        <label style={label}>Note *</label>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`fas fa-star`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize: '1.75rem',
                cursor: 'pointer',
                color: star <= (hover || rating) ? '#f59e0b' : '#e2e8f0',
                transition: 'color 0.15s',
              }}
            />
          ))}
          {(hover || rating) > 0 && (
            <span style={{ color: '#64748b', fontSize: '0.88rem', marginLeft: '0.5rem' }}>
              {labels[hover || rating]}
            </span>
          )}
        </div>
      </div>

      {/* Commentaire */}
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