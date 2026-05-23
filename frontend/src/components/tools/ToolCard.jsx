import React from 'react';
import { useNavigate } from 'react-router-dom';

const CONDITION = {
  new: { label: 'Neuf', color: '#16a34a', bg: '#dcfce7' },
  good: { label: 'Bon état', color: '#d97706', bg: '#fef9c3' },
  fair: { label: 'Correct', color: '#dc2626', bg: '#fee2e2' },
};

export default function ToolCard({ tool, onClick }) {
  const cond = CONDITION[tool.condition] || CONDITION.good;
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${tool.user_id}`);
  };

  return (
    <>
      <style>{`
        .tool-card { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .tool-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.09); }
        .owner-link:hover { text-decoration: underline; color: #6366f1; }
      `}</style>
      <div className="tool-card" onClick={onClick}>
        {tool.image_url
          ? <img src={tool.image_url} alt={tool.title} style={{ width: '100%', height: 176, objectFit: 'cover' }} />
          : <div style={{ height: 176, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', fontSize: '3rem', color: '#94a3b8' }}>
            <i className="fas fa-wrench"></i>
          </div>
        }

        <div style={{ padding: '1rem' }}>
          {/* Category + condition */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {tool.category?.name}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 20, background: cond.bg, color: cond.color }}>
              {cond.label}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.5rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {tool.title}
          </h3>

          {/* Localisation */}
          {(tool.city || tool.distance != null) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {tool.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <i className="fas fa-map-marker-alt" style={{ color: '#6366f1', fontSize: '0.7rem' }}></i>
                  {tool.city}
                </span>
              )}
              {tool.distance != null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '0.1rem 0.5rem', borderRadius: 20 }}>
                  <i className="fas fa-location-arrow" style={{ fontSize: '0.65rem' }}></i>
                  {tool.distance} km
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: tool.price > 0 ? '#6366f1' : '#16a34a' }}>
              {tool.price > 0 ? `${parseFloat(tool.price).toFixed(2)} MAD/h` : <><i className="fas fa-gift me-1"></i>Gratuit</>}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span onClick={handleProfileClick} style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                  {tool.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="owner-link">{tool.user?.name}</span>
              </span>
              {tool.user?.owner_rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', marginTop: '0.1rem' }}>
                  <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.62rem' }}></i>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{tool.user.owner_rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}