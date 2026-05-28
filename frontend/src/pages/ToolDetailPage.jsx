// src/pages/ToolDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookingForm from '../components/bookings/BookingForm';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const CONDITION = {
  new: { label: 'Neuf', color: '#16a34a', bg: '#dcfce7' },
  good: { label: 'Bon état', color: '#d97706', bg: '#fef9c3' },
  fair: { label: 'Correct', color: '#dc2626', bg: '#fee2e2' },
};

export default function ToolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [booked, setBooked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([api.get(`/tools/${id}`), api.get(`/tools/${id}/reviews`)])
      .then(([t, r]) => {
        setTool(t.data);
        setReviews(r.data.reviews || []);
        setAvgRating(r.data.average_rating || null);
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
        else setError('Erreur lors du chargement.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '0.88rem' }}>Chargement...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <i className="fas fa-search" style={{ fontSize: '1.75rem', color: '#cbd5e1' }}></i>
      </div>
      <p style={{ fontWeight: 700, color: '#374151', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>Outil introuvable</p>
      <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>Cet outil n'existe pas ou a été supprimé.</p>
      <button onClick={() => navigate('/tools')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
        Retour aux outils
      </button>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>
      <button onClick={() => window.location.reload()} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
        Réessayer
      </button>
    </div>
  );

  if (!tool) return null;

  const isOwner = user?.id === tool.user_id;
  const cond = CONDITION[tool.condition] || CONDITION.good;
  const hourlyPrice = parseFloat(tool.price).toFixed(2);

  return (
    <>
      <style>{`
        .td-layout { display: flex; gap: 1.75rem; align-items: flex-start; }
        .td-left   { flex: 1; min-width: 0; }
        .td-right  { width: 300px; flex-shrink: 0; position: sticky; top: 80px; }

        .td-back { display: inline-flex; align-items: center; gap: 0.4rem; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.4rem 0.9rem; color: #374151; font-weight: 600; font-size: 0.82rem; cursor: pointer; margin-bottom: 1.25rem; transition: all 0.15s; }
        .td-back:hover { border-color: #2563eb; color: #2563eb; }

        .td-img-main { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; }
        .td-img-placeholder { aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); font-size: 4rem; color: #cbd5e1; }

        .td-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 1px 4px rgba(0,0,0,0.04); margin-bottom: 1rem; overflow: hidden; }
        .td-card-body { padding: 1.25rem; }

        .td-owner-link { cursor: pointer; }
        .td-owner-link:hover span { text-decoration: underline; color: #2563eb; }

        .td-review-item { padding: 0.85rem 0; border-bottom: 1px solid #f8fafc; }
        .td-review-item:last-child { border-bottom: none; }

        .td-book-btn { width: 100%; padding: 0.8rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

        @media (max-width: 768px) {
          .td-layout { flex-direction: column; gap: 1rem; }
          .td-right  { width: 100%; position: static; }
          .td-back   { margin-bottom: 1rem; }
        }
      `}</style>

      {/* Back */}
      <button className="td-back" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i> Retour
      </button>

      <div className="td-layout">

        {/* ── Left column ── */}
        <div className="td-left">

          {/* Image */}
          <div className="td-card" style={{ marginBottom: '1rem' }}>
            {tool.image_url
              ? <img src={tool.image_url} alt={tool.title} className="td-img-main" />
              : <div className="td-img-placeholder"><i className="fas fa-wrench"></i></div>
            }
          </div>

          {/* Info */}
          <div className="td-card">
            <div className="td-card-body">
              {/* Title + condition */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                  {tool.title}
                </h1>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 20, background: cond.bg, color: cond.color, flexShrink: 0, marginTop: '0.2rem' }}>
                  {cond.label}
                </span>
              </div>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  <i className="fas fa-tag" style={{ color: '#2563eb', fontSize: '0.7rem' }}></i>
                  {tool.category?.name}
                </span>
                {tool.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#2563eb', fontSize: '0.7rem' }}></i>
                    {tool.city}
                  </span>
                )}
              </div>

              {/* Price & Owner Banner */}
              <div className="td-banner" style={{ 
                background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', 
                borderRadius: 12, 
                padding: '1rem 1.25rem', 
                marginBottom: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.15rem' }}>Prix</p>
                  <span style={{ fontWeight: 900, fontSize: '1.6rem', color: '#2563eb' }}>
                    {tool.price > 0 ? `${hourlyPrice} MAD` : 'Gratuit'}
                  </span>
                  {tool.price > 0 && <span style={{ color: '#94a3b8', fontSize: '0.82rem', marginLeft: '0.3rem' }}>/ heure</span>}
                </div>
                
                <div style={{ textAlign: 'right', flex: 1, minWidth: '140px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.3rem' }}>Propriétaire</p>
                  <div className="td-owner-link" onClick={() => navigate(`/profile/${tool.user_id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1.5px solid #dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                      {tool.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {tool.user?.name}
                      </span>
                      {avgRating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                          <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.65rem' }}></i>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{avgRating}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>({reviews.length} avis)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {tool.description && (
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.92rem', margin: 0 }}>
                  {tool.description}
                </p>
              )}

              {/* Map Leaflet */}
              {tool.latitude && tool.longitude && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#2563eb', fontSize: '0.9rem' }}></i>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>
                      {tool.city || 'Localisation'}
                    </span>
                  </div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', height: 220 }}>
                    <MapContainer
                      center={[parseFloat(tool.latitude), parseFloat(tool.longitude)]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[parseFloat(tool.latitude), parseFloat(tool.longitude)]}>
                        <Popup>{tool.title}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="td-card">
            <div className="td-card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>
                  Avis <span style={{ color: '#94a3b8', fontWeight: 500 }}>({reviews.length})</span>
                </h3>
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef9c3', padding: '0.25rem 0.65rem', borderRadius: 20 }}>
                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.75rem' }}></i>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e' }}>{avgRating}/5</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8' }}>
                  <i className="fas fa-comment-slash" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>Aucun avis pour le moment.</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="td-review-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        onClick={() => navigate(`/profile/${r.reviewer_id}`)}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                      >
                        {r.reviewer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          onClick={() => navigate(`/profile/${r.reviewer_id}`)}
                          style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', margin: 0, cursor: 'pointer' }}
                        >
                          {r.reviewer?.name}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star" style={{ fontSize: '0.7rem', color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, paddingLeft: '2.2rem', lineHeight: 1.5 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column — Booking ── */}
        <div className="td-right">
          <div className="td-card">
            <div className="td-card-body">
              {/* Price header */}
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f8fafc' }}>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.25rem' }}>Tarif</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.75rem', color: '#0f172a' }}>
                    {tool.price > 0 ? `${hourlyPrice}` : 'Gratuit'}
                  </span>
                  {tool.price > 0 && (
                    <>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>MAD</span>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>/ heure</span>
                    </>
                  )}
                </div>
              </div>

              {/* Booking logic */}
              {!user ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <i className="fas fa-lock" style={{ color: '#2563eb', fontSize: '1.1rem' }}></i>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    Connectez-vous pour réserver cet outil
                  </p>
                  <button
                    className="td-book-btn"
                    onClick={() => navigate('/login')}
                    style={{ background: '#2563eb', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                  >
                    <i className="fas fa-sign-in-alt"></i> Se connecter
                  </button>
                  <button
                    className="td-book-btn"
                    onClick={() => navigate('/register')}
                    style={{ background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', marginTop: '0.5rem' }}
                  >
                    Créer un compte
                  </button>
                </div>
              ) : isOwner ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <i className="fas fa-tools" style={{ color: '#16a34a', fontSize: '1.1rem' }}></i>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem' }}>C'est votre outil</p>
                  <button
                    className="td-book-btn"
                    onClick={() => navigate('/my-tools')}
                    style={{ background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0' }}
                  >
                    <i className="fas fa-edit"></i> Gérer mes outils
                  </button>
                </div>
              ) : user?.role !== 'borrower' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <i className="fas fa-exchange-alt" style={{ color: '#d97706', fontSize: '1.1rem' }}></i>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    Seuls les emprunteurs peuvent réserver
                  </p>
                  <button
                    className="td-book-btn"
                    onClick={() => navigate('/profile')}
                    style={{ background: '#fef9c3', color: '#92400e', border: '1.5px solid #fde68a' }}
                  >
                    <i className="fas fa-sync-alt"></i> Changer mon rôle
                  </button>
                </div>
              ) : booked ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
                    <i className="fas fa-check" style={{ color: '#16a34a', fontSize: '1.3rem' }}></i>
                  </div>
                  <p style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem', margin: '0 0 0.3rem' }}>Demande envoyée !</p>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                    Le propriétaire doit approuver votre demande avant confirmation.
                  </p>
                  <button
                    className="td-book-btn"
                    onClick={() => navigate('/bookings')}
                    style={{ background: '#2563eb', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                  >
                    <i className="fas fa-list"></i> Voir mes réservations
                  </button>
                </div>
              ) : (
                <BookingForm toolId={tool.id} toolPrice={tool.price} onSuccess={() => setBooked(true)} />
              )}
            </div>
          </div>

          {/* Owner quick card */}
          <div className="td-card">
            <div className="td-card-body">
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.75rem' }}>Propriétaire</p>
              <div
                className="td-owner-link"
                onClick={() => navigate(`/profile/${tool.user_id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                  {tool.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>{tool.user?.name}</p>
                  {tool.user?.owner_rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star" style={{ fontSize: '0.65rem', color: i < Math.round(tool.user.owner_rating) ? '#f59e0b' : '#e2e8f0' }}></i>
                      ))}
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginLeft: '0.2rem' }}>
                        {tool.user.owner_rating}
                      </span>
                    </div>
                  )}
                </div>
                <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', marginLeft: 'auto', fontSize: '0.75rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}