import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookingForm from '../components/bookings/BookingForm';

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
  const [notFound, setNotFound] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/tools/${id}`), api.get(`/tools/${id}/reviews`)])
      .then(([toolRes, reviewRes]) => {
        setTool(toolRes.data);
        setReviews(reviewRes.data.reviews || []);
        setAvgRating(reviewRes.data.average_rating || null);
      })
      .catch(err => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#94a3b8' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        <p style={{ marginTop: '0.75rem' }}>Chargement...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p style={{ fontSize: '3rem', color: '#e2e8f0' }}><i className="fas fa-search"></i></p>
      <p style={{ fontWeight: 700, color: '#374151' }}>Outil introuvable</p>
      <button onClick={() => navigate('/tools')} style={{ marginTop: '1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
        Retour aux outils
      </button>
    </div>
  );

  if (!tool) return null;

  const isOwner = user?.id === tool.user_id;
  const cond = CONDITION[tool.condition] || CONDITION.good;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .detail-layout { flex-direction: column !important; }
          .booking-col { width: 100% !important; }
        }
      `}</style>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: 960 }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', marginBottom: '1.25rem', padding: 0 }}
        >
          <i className="fas fa-arrow-left"></i> Retour
        </button>

        <div className="detail-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Left */}
          <div style={{ flex: 1, minWidth: 280 }}>

            {/* Image */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem', background: '#fff', border: '1px solid #f1f5f9' }}>
              {tool.image_url
                ? <img src={tool.image_url} alt={tool.title} style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }} />
                : <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', fontSize: '5rem', color: '#cbd5e1' }}>
                  <i className="fas fa-wrench"></i>
                </div>
              }
            </div>

            {/* Info card */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: 0, lineHeight: 1.25 }}>{tool.title}</h1>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 20, background: cond.bg, color: cond.color, flexShrink: 0 }}>
                  {cond.label}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <i className="fas fa-folder" style={{ color: '#2563eb' }}></i> {tool.category?.name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                    {tool.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {tool.user?.name}
                </span>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.85rem 1rem', display: 'inline-block' }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#16a34a' }}>
                  {tool.price > 0 ? `${tool.price} MAD` : <><i className="fas fa-gift me-1"></i>Gratuit</>}
                </span>
                {tool.price > 0 && <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.3rem' }}>/ jour</span>}
              </div>

              {tool.description && (
                <p style={{ color: '#475569', lineHeight: 1.7, marginTop: '1rem', fontSize: '0.92rem', margin: '1rem 0 0' }}>
                  {tool.description}
                </p>
              )}
            </div>

            {/* Reviews */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                  Avis <span style={{ color: '#94a3b8', fontWeight: 500 }}>({reviews.length})</span>
                </h3>
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef9c3', padding: '0.25rem 0.7rem', borderRadius: 20 }}>
                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>{avgRating}/5</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>
                  Aucun avis pour le moment.
                </p>
              ) : reviews.map(r => (
                <div key={r.id} style={{ padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                        {r.reviewer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ fontSize: '0.88rem', color: '#374151' }}>{r.reviewer?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star" style={{ fontSize: '0.75rem', color: i < r.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, paddingLeft: '2.25rem' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Booking */}
          <div className="booking-col" style={{ width: 300, flexShrink: 0, position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1rem' }}>
                {tool.price > 0 ? (
                  <><span style={{ fontSize: '1.4rem', color: '#2563eb' }}>{tool.price} MAD</span> <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>/ jour</span></>
                ) : <><i className="fas fa-gift me-1"></i>Gratuit</>}
              </p>

              {!user ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem' }}>Connectez-vous pour réserver</p>
                  <button onClick={() => navigate('/login')} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                    Se connecter
                  </button>
                </div>
              ) : isOwner ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem' }}>
                    <i className="fas fa-wrench me-1"></i> C'est votre outil
                  </p>
                  <button onClick={() => navigate('/my-tools')} style={{ width: '100%', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                    Gérer mes outils
                  </button>
                </div>
              ) : user?.role !== 'borrower' ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1rem' }}>
                    Seuls les emprunteurs peuvent réserver
                  </p>
                  <button onClick={() => navigate('/profile')} style={{ width: '100%', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                    Changer mon rôle
                  </button>
                </div>
              ) : booked ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <i className="fas fa-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i>
                  </div>
                  <p style={{ fontWeight: 700, color: '#16a34a', marginBottom: '0.25rem' }}>Demande envoyée !</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Le propriétaire doit approuver votre demande.</p>
                  <button onClick={() => navigate('/bookings')} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
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
    </div>
  );
}