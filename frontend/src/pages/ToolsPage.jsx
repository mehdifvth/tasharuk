// src/pages/ToolsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';
import { useAuth } from '../context/AuthContext';

export default function ToolsPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tools,      setTools]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [categories, setCategories] = useState([]);
  const [keyword,    setKeyword]    = useState('');
  const [category,   setCategory]  = useState('');
  const [city,       setCity]      = useState('');
  const [loading,    setLoading]   = useState(false);
  const [page,       setPage]      = useState(1);
  const [lastPage,   setLastPage]  = useState(1);
  const [nearMe,     setNearMe]    = useState(false);
  const [userCoords, setUserCoords]= useState(null);
  const [gpsLoading, setGpsLoading]= useState(false);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (keyword)  params.keyword  = keyword;
    if (category) params.category = category;
    if (city)     params.city     = city;
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
      err => {
        setGpsLoading(false);
        if (err.code === 1) alert('Accès refusé. Autorisez la géolocalisation.');
        else alert('Position non disponible.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearFilters = () => { setKeyword(''); setCategory(''); setCity(''); setNearMe(false); };
  const hasFilters   = keyword || category || city || nearMe;

  return (
    <div>
      <style>{`
        .tf-input { width: 100%; padding: 0.65rem 0.9rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 0.88rem; outline: none; transition: border-color 0.15s; background: #fff; color: #374151; box-sizing: border-box; }
        .tf-input:focus { border-color: #2563eb; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
        .page-btn { padding: 0.5rem 1rem; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; color: #374151; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 640px) {
          .tools-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .filter-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) { .tools-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Parcourir les outils</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {loading ? 'Recherche...' : `${total} outil${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`}
            {nearMe && <span style={{ color: '#2563eb', fontWeight: 700, marginLeft: '0.5rem' }}>• <i className="fas fa-location-arrow me-1"></i>Rayon 50km</span>}
          </p>
        </div>
        {user?.role === 'owner' && (
          <button onClick={() => navigate('/my-tools')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="fas fa-plus"></i> Publier
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem', pointerEvents: 'none' }}></i>
            <input className="tf-input" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Rechercher un outil..." style={{ paddingLeft: 32 }} />
          </div>

          {/* Category */}
          <select className="tf-input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* City */}
          <div style={{ position: 'relative' }}>
            <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem', pointerEvents: 'none' }}></i>
            <input className="tf-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Ville..." style={{ paddingLeft: 30 }} />
          </div>
        </div>

        {/* Second row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* GPS */}
          <button
            onClick={handleNearMe}
            disabled={gpsLoading}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid', fontWeight: 600, fontSize: '0.82rem', cursor: gpsLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s',
              borderColor: nearMe ? '#2563eb' : '#e2e8f0',
              background: nearMe ? '#dbeafe' : '#fff',
              color: nearMe ? '#1e40af' : '#64748b',
            }}
          >
            <i className={`fas ${gpsLoading ? 'fa-spinner fa-spin' : nearMe ? 'fa-location-arrow' : 'fa-location-crosshairs'}`}></i>
            {gpsLoading ? 'Localisation...' : nearMe ? 'Près de moi ✓' : 'Près de moi'}
          </button>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
            <button
              onClick={() => setCategory('')}
              style={{ padding: '0.3rem 0.75rem', borderRadius: 20, border: '1.5px solid', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', borderColor: !category ? '#2563eb' : '#f1f5f9', background: !category ? '#dbeafe' : '#f8fafc', color: !category ? '#1e40af' : '#94a3b8' }}
            >
              Tous
            </button>
            {categories.slice(0, 5).map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(String(c.id))}
                style={{ padding: '0.3rem 0.75rem', borderRadius: 20, border: '1.5px solid', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', borderColor: category === String(c.id) ? '#2563eb' : '#f1f5f9', background: category === String(c.id) ? '#dbeafe' : '#f8fafc', color: category === String(c.id) ? '#1e40af' : '#94a3b8' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="fas fa-times"></i> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '0.75rem', display: 'block' }}></i>
          Chargement...
        </div>
      ) : tools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
          <i className="fas fa-search" style={{ fontSize: '2.5rem', color: '#e2e8f0', marginBottom: '0.75rem', display: 'block' }}></i>
          <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 0.3rem' }}>Aucun outil trouvé</p>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
            {keyword ? `Aucun résultat pour "${keyword}"` : 'Aucun outil disponible'}
          </p>
          {hasFilters && <button onClick={clearFilters} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Effacer les filtres</button>}
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map(tool => <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/tools/${tool.id}`)} />)}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <i className="fas fa-chevron-left"></i>
          </button>
          {[...Array(Math.min(lastPage, 7))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s', borderColor: page === i + 1 ? '#2563eb' : '#e2e8f0', background: page === i + 1 ? '#2563eb' : '#fff', color: page === i + 1 ? '#fff' : '#374151' }}>
              {i + 1}
            </button>
          ))}
          <button className="page-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}