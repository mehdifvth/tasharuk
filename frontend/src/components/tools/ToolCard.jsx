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
        .tool-card { 
          background: #fff; 
          border-radius: 20px; 
          border: 1px solid rgba(226, 232, 240, 0.7); 
          overflow: hidden; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .tool-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 12px 30px rgba(0,0,0,0.08); 
          border-color: #2563eb;
        }
        .tool-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f1f5f9;
        }
        .tool-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .tool-card:hover .tool-image {
          transform: scale(1.05);
        }
        .distance-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #2563eb;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      `}</style>
      
      <div className="tool-card" onClick={onClick}>
        <div className="tool-image-container">
          {tool.image_url ? (
            <img src={tool.image_url} alt={tool.title} className="tool-image" loading="lazy" />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: '#cbd5e1' }}>
              <i className="fas fa-wrench"></i>
            </div>
          )}
          
          {tool.distance != null && (
            <div className="distance-badge">
              <i className="fas fa-location-arrow"></i>
              {parseFloat(tool.distance).toFixed(1)} km
            </div>
          )}

          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.7rem', borderRadius: 10, background: cond.bg, color: cond.color, textTransform: 'uppercase' }}>
              {cond.label}
            </span>
          </div>
        </div>

        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '0.5rem' }}>
            {tool.category?.name}
          </div>

          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', margin: '0 0 0.75rem', lineHeight: 1.4, height: '2.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {tool.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <i className="fas fa-location-dot" style={{ color: '#2563eb' }}></i>
            {tool.city || 'Localisation non précisée'}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', color: tool.price > 0 ? '#1e293b' : '#16a34a' }}>
                {tool.price > 0 ? `${parseFloat(tool.price).toFixed(0)} MAD` : 'Gratuit'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>par heure</span>
            </div>

            <div 
              onClick={handleProfileClick}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <div style={{ 
                width: 34, 
                height: 34, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #2563eb, #6366f1)', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.9rem', 
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
                flexShrink: 0
              }}>
                {tool.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tool.user?.name?.split(' ')[0]}
                </span>
                {tool.user?.owner_rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.1rem' }}>
                    <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '0.65rem' }}></i>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>{tool.user.owner_rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
