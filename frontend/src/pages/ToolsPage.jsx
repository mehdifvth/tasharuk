// src/pages/ToolsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';
import { useAuth } from '../context/AuthContext';

export default function ToolsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tools, setTools] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [nearMe, setNearMe] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (city) params.city = city;
    if (nearMe && userCoords) { params.lat = userCoords.lat; params.lng = userCoords.lng; }
    api.get('/tools', { params })
      .then(r => { setTools(r.data.data || []); setTotal(r.data.total || 0); setLastPage(r.data.last_page || 1); })
      .catch(() => { setTools([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [keyword, category, city, page, nearMe, userCoords]);

  useEffect(() => { setPage(1); }, [keyword, category, city, nearMe]);
  useEffect(() => { loadTools(); }, [loadTools]);

  const handleNearMe = () => {
    if (nearMe) { setNearMe(false); return; }
    if (userCoords) { setNearMe(true); return; }
    if (!navigator.geolocation) { alert('Géolocalisation non supportée.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setNearMe(true); setGpsLoading(false); },
      err => { setGpsLoading(false); alert(err.code === 1 ? 'Accès refusé. Autorisez la géolocalisation.' : 'Position non disponible.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearFilters = () => { setKeyword(''); setCategory(''); setCity(''); setNearMe(false); };
  const hasFilters = keyword || category || city || nearMe;
  const activeCount = [keyword, category, city, nearMe].filter(Boolean).length;

  return (
    <>
      <style>{`
        /* ── Search bar ── */
        .ts-search-wrap {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 0 1rem;
          gap: 0.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          flex: 1;
        }
        .ts-search-wrap:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        .ts-search-wrap input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.92rem;
          color: #0f172a;
          padding: 0.75rem 0;
          background: transparent;
        }
        .ts-search-wrap input::placeholder { color: #94a3b8; }

        /* ── Filter chip ── */
        .ts-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .ts-chip:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .ts-chip.active { border-color: #2563eb; background: #2563eb; color: #fff; }

        /* ── Filter drawer (mobile) ── */
        .ts-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.4);
          z-index: 300;
          backdrop-filter: blur(3px);
        }
        .ts-drawer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-radius: 24px 24px 0 0;
          padding: 1.5rem;
          z-index: 301;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 85vh;
          overflow-y: auto;
        }
        .ts-drawer.open { transform: translateY(0); }
        .ts-drawer-overlay.open { display: block; }

        /* ── Tools grid ── */
        .ts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        /* ── Page btn ── */
        .ts-page-btn {
          width: 36px; height: 36px;
          border-radius: 9px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .ts-page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
        .ts-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ts-page-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }

        /* ── Field label ── */
        .ts-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 0.4rem;
        }
        .ts-field {
          width: 100%;
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.15s;
          background: #fff;
          color: #374151;
          box-sizing: border-box;
        }
        .ts-field:focus { border-color: #2563eb; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ts-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .ts-desktop-filters { display: none !important; }
          .ts-mobile-bar { display: flex !important; }
        }
        @media (max-width: 420px) {
          .ts-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 769px) {
          .ts-mobile-bar { display: none !important; }
          .ts-desktop-filters { display: flex !important; }
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>
              Explorer les outils
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading
                ? <><i className="fas fa-circle-notch fa-spin" style={{ color: '#2563eb' }}></i> Recherche...</>
                : <>{total} outil{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</>
              }
              {nearMe && !loading && (
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.5rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                  <i className="fas fa-location-arrow me-1"></i>Proche
                </span>
              )}
            </p>
          </div>
          {user?.role === 'owner' && (
            <button
              onClick={() => navigate('/my-tools')}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
            >
              <i className="fas fa-plus"></i> Publier un outil
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop filters (Modern Search Bar) ── */}
      <div className="ts-desktop-filters" style={{
        background: '#fff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '20px',
        padding: '0.4rem',
        marginBottom: '1.25rem',
        alignItems: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        gap: '0',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto 1.5rem'
      }}>
        {/* Keyword Search */}
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.5rem', borderRight: '1.5px solid #f1f5f9' }}>
          <i className="fas fa-search" style={{ color: '#2563eb', fontSize: '1rem' }}></i>
          <div style={{ flex: 1 }}>

            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Perceuse, Échelle, Tondeuse..."
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.98rem', fontWeight: 600, color: '#0f172a', background: 'transparent' }}
            />
          </div>
          {keyword && <button onClick={() => setKeyword('')} style={{ color: '#cbd5e1', border: 'none', background: 'none', cursor: 'pointer' }}><i className="fas fa-times-circle"></i></button>}
        </div>

        {/* City Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.5rem' }}>
          <i className="fas fa-map-marker-alt" style={{ color: '#2563eb', fontSize: '1rem' }}></i>
          <div style={{ flex: 1 }}>

            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Ville..."
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.98rem', fontWeight: 600, color: '#0f172a', background: 'transparent' }}
            />
          </div>
          {city && <button onClick={() => setCity('')} style={{ color: '#cbd5e1', border: 'none', background: 'none', cursor: 'pointer' }}><i className="fas fa-times-circle"></i></button>}
        </div>

        {/* Filters Toggle Button (Matches Phone Sliders) */}
        <button
          onClick={() => setShowFilters(true)}
          style={{
            height: '48px',
            width: '48px',
            borderRadius: '16px',
            border: 'none',
            background: '#f8fafc',
            color: '#334155',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 0.5rem',
            position: 'relative',
            transition: 'background 0.2s'
          }}
          title="Plus de filtres"
        >
          <i className="fas fa-sliders" style={{ fontSize: '1.1rem' }}></i>
          {activeCount > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#2563eb', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* GPS / Location */}
        <button
          onClick={handleNearMe}
          disabled={gpsLoading}
          style={{
            height: '48px',
            padding: '0 1.25rem',
            borderRadius: '16px',
            border: 'none',
            background: nearMe ? '#dbeafe' : '#f8fafc',
            color: nearMe ? '#1e40af' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginRight: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <i className={`fas ${gpsLoading ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`} style={{ fontSize: '1rem' }}></i>
          <span>{nearMe ? 'Proche' : 'Ma position'}</span>
        </button>

        {/* Action Button */}
        <button
          onClick={loadTools}
          style={{
            height: '48px',
            padding: '0 1.75rem',
            borderRadius: '16px',
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem'
          }}
        >
          <i className="fas fa-search"></i>
          <span>Chercher</span>
        </button>
      </div>

      {/* Category pills — desktop */}
      <div className="ts-desktop-filters" style={{ gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button className={`ts-chip ${!category ? 'active' : ''}`} onClick={() => setCategory('')} style={{ padding: '0.5rem 1.25rem' }}>Tous</button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`ts-chip ${category === String(c.id) ? 'active' : ''}`}
            onClick={() => setCategory(category === String(c.id) ? '' : String(c.id))}
            style={{ padding: '0.5rem 1.25rem' }}
          >
            {c.name}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── Mobile top bar ── */}
      <div className="ts-mobile-bar" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
        <div className="ts-search-wrap" style={{ flex: 1 }}>
          <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.85rem', flexShrink: 0 }}></i>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Rechercher..." />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          style={{ position: 'relative', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <i className="fas fa-sliders" style={{ color: '#374151', fontSize: '1rem' }}></i>
          {activeCount > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#2563eb', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`ts-drawer-overlay ${showFilters ? 'open' : ''}`} onClick={() => setShowFilters(false)} />
      <div className={`ts-drawer ${showFilters ? 'open' : ''}`}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 1.5rem' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>Filtres</h3>
          {hasFilters && (
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Tout effacer
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="ts-label">Catégorie</label>
            <select className="ts-field" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="ts-label">Ville</label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.82rem' }}></i>
              <input className="ts-field" value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Casablanca" style={{ paddingLeft: 30 }} />
            </div>
          </div>

          <div>
            <label className="ts-label">Localisation</label>
            <button
              onClick={handleNearMe}
              disabled={gpsLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: `1.5px solid ${nearMe ? '#2563eb' : '#e2e8f0'}`, background: nearMe ? '#dbeafe' : '#fff', color: nearMe ? '#1e40af' : '#64748b', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s' }}
            >
              <i className={`fas ${gpsLoading ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
              {gpsLoading ? 'Localisation...' : nearMe ? 'Proche de moi ✓' : 'Chercher près de moi'}
            </button>
          </div>

          <div>
            <label className="ts-label">Catégories rapides</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button className={`ts-chip ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>Tous</button>
              {categories.map(c => (
                <button key={c.id} className={`ts-chip ${category === String(c.id) ? 'active' : ''}`} onClick={() => setCategory(category === String(c.id) ? '' : String(c.id))}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(false)}
          style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          Voir les résultats ({total})
        </button>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden', animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: 176, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%' }}></div>
              <div style={{ padding: '1rem' }}>
                <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, marginBottom: '0.5rem', width: '70%' }}></div>
                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 6, width: '40%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <i className="fas fa-search" style={{ fontSize: '1.75rem', color: '#cbd5e1' }}></i>
          </div>
          <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.4rem', fontSize: '1rem' }}>Aucun outil trouvé</p>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
            {keyword ? `Aucun résultat pour "${keyword}"` : 'Aucun outil disponible pour le moment'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="ts-grid">
          {tools.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/tools/${tool.id}`)} />)}
        </div>
      )}

      {/* ── Pagination ── */}
      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2.5rem' }}>
          <button className="ts-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <i className="fas fa-chevron-left" style={{ fontSize: '0.75rem' }}></i>
          </button>
          {[...Array(Math.min(lastPage, 7))].map((_, i) => (
            <button key={i} className={`ts-page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button className="ts-page-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>
            <i className="fas fa-chevron-right" style={{ fontSize: '0.75rem' }}></i>
          </button>
        </div>
      )}
    </>
  );
}