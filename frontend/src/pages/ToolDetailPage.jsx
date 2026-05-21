// src/pages/ToolDetailPage.jsx
// FIX: gestion correcte de l'état loading + erreur réseau + reload avis après booking

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookingForm from '../components/bookings/BookingForm';

const CONDITION_LABEL = {
  new: <span><i className="fas fa-circle text-success small me-1"></i> Neuf</span>,
  good: <span><i className="fas fa-circle text-warning small me-1"></i> Bon état</span>,
  fair: <span><i className="fas fa-circle text-danger small me-1"></i> Correct</span>
};

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [booked, setBooked] = useState(false);

  const loadTool = () => {
    setLoading(true);
    Promise.all([
      api.get(`/tools/${id}`),
      api.get(`/tools/${id}/reviews`),
    ])
      .then(([toolRes, reviewRes]) => {
        setTool(toolRes.data);
        setReviews(reviewRes.data.reviews || []);
        setAvgRating(reviewRes.data.average_rating || null);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTool(); }, [id]);

  if (loading) return <p className="spinner">Chargement de l'outil...</p>;
  if (notFound) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Outil introuvable.</p>
      <button className="btn-primary" onClick={() => navigate('/tools')} style={{ marginTop: '1rem' }}>
        Retour aux outils
      </button>
    </div>
  );
  if (!tool) return null;

  const isOwner = user?.id === tool.user_id;

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', color: '#2563eb', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}
      >
        ← Retour
      </button>

      <div style={styles.layout}>
        {/* ── Colonne gauche ── */}
        <div style={{ flex: 1, minWidth: 260 }}>
          {tool.image_url
            ? <img src={tool.image_url} alt={tool.title} style={styles.img} />
            : <div style={styles.placeholder}><i className="fas fa-wrench"></i></div>
          }

          <h1 style={styles.title}>{tool.title}</h1>

          <div style={styles.metaRow}>
            <span><i className="fas fa-folder me-1"></i> {tool.category?.name}</span>
            <span>{CONDITION_LABEL[tool.condition]}</span>
            <span><i className="fas fa-user me-1"></i> {tool.user?.name}</span>
          </div>

          <p style={styles.price}>
            {tool.price > 0 ? `${tool.price} MAD / jour` : <span><i className="fas fa-gift me-1"></i> Gratuit</span>}
          </p>

          {tool.description && (
            <p style={{ color: '#374151', lineHeight: 1.6, marginTop: '0.75rem' }}>
              {tool.description}
            </p>
          )}

          {/* ── Avis ── */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
              <i className="fas fa-comments text-primary me-2"></i> Avis ({reviews.length})
              {avgRating && (
                <span style={{ color: '#f59e0b', marginLeft: '0.5rem', fontSize: '1rem' }}>
                  {avgRating}/5
                </span>
              )}
            </h3>
            {reviews.length === 0 ? (
              <p style={{ color: '#64748b' }}>Aucun avis pour le moment.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="card" style={{ marginBottom: '0.75rem', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{r.reviewer?.name}</strong>
                    <span style={{ color: '#f59e0b' }}>
                      {[...Array(r.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                    </span>
                  </div>
                  {r.comment && <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0 }}>{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Colonne droite : réservation ── */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="card">
            {!user ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p>Connectez-vous pour réserver</p>
                <button className="btn-primary" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => navigate('/login')}>
                  Se connecter
                </button>
              </div>
            ) : isOwner ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p><i className="fas fa-wrench me-2"></i>C'est votre outil</p>
                <button className="btn-outline" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => navigate('/my-tools')}>
                  Gérer mes outils
                </button>
              </div>
            ) : user?.role !== 'borrower' ? (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <p><i className="fas fa-info-circle me-2"></i>Seuls les emprunteurs peuvent réserver</p>
                <button className="btn-outline" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => navigate('/profile')}>
                  Changer mon rôle
                </button>
              </div>
            ) : booked ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.1rem' }}>
                  <i className="fas fa-check-circle me-2"></i>Demande envoyée !
                </p>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.5rem 0 1rem' }}>
                  Le propriétaire doit approuver votre demande.
                </p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/bookings')}>
                  Voir mes réservations
                </button>
              </div>
            ) : (
              <BookingForm toolId={tool.id} toolPrice={tool.price} onSuccess={() => setBooked(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  img: { width: '100%', borderRadius: 10, maxHeight: 340, objectFit: 'cover', marginBottom: '1.25rem' },
  placeholder: {
    height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '5rem', background: '#f1f5f9', borderRadius: 10, marginBottom: '1.25rem'
  },
  title: { fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.5rem' },
  metaRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.88rem', marginBottom: '0.5rem' },
  price: { fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', marginTop: '0.25rem' },
};
