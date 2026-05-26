import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';
import { useAuth } from '../context/AuthContext';

export default function ToolsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tools, setTools] = useState([]);
  const [totalTools, setTotalTools] = useState(0);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [userCoords, setUserCoords] = useState(null); 
  const [gpsLoading, setGpsLoading] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (city) params.city = city;
    if (nearMe && userCoords) {
      params.lat = userCoords.lat;
      params.lng = userCoords.lng;
    }
    api.get('/tools', { params })
      .then(r => { 
        setTools(r.data.data || []); 
        setTotalTools(r.data.total || 0);
        setLastPage(r.data.last_page || 1); 
      })
      .catch(() => { setTools([]); setTotalTools(0); })
      .finally(() => setLoading(false));
  }, [keyword, category, city, page, nearMe, userCoords]);

  useEffect(() => { setPage(1); }, [keyword, category, city, nearMe]);
  useEffect(() => { loadTools(); }, [loadTools]);

  const handleNearMe = () => {
    if (nearMe) { setNearMe(false); return; }
    if (userCoords) { setNearMe(true); return; }

    if (!navigator.geolocation) {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
      return;
    }

    setGpsLoading(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setGpsLoading(false);
      },
      err => {
        setGpsLoading(false);
        console.error("GPS Error:", err);
        let msg = "Impossible d'obtenir votre position.";
        
        if (err.code === 1) msg = "Accès à la position refusé. Veuillez autoriser la géolocalisation dans vos réglages.";
        else if (err.code === 2) msg = "Position non disponible (vérifiez votre connexion GPS).";
        else if (err.code === 3) msg = "Délai d'attente dépassé.";

        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          msg += "\n\nNote : La géolocalisation nécessite une connexion sécurisée (HTTPS).";
        }
        
        alert(msg);
      },
      options
    );
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setCity('');
    setNearMe(false);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <style>{`
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .tools-grid { grid-template-columns: 1fr; gap: 1rem; }
          .filters-desktop { 
            display: flex; 
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem; 
          }
          .filter-row-mobile {
            display: flex;
            gap: 0.5rem;
          }
          .hide-mobile { display: none !important; }
          .filter-bar {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #fff; border-top: 1px solid #e2e8f0;
            padding: 1rem; z-index: 50; display: flex; gap: 0.5rem;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          }
          .filters-panel {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: #fff; z-index: 100; padding: 1.5rem;
            display: ${showMobileFilters ? 'flex' : 'none'};
            flex-direction: column; gap: 1rem;
            animation: slideUp 0.3s ease;
          }
        }
        @media (min-width: 641px) {
          .filter-bar { display: none; }
          .filters-desktop {
            display: grid;
            grid-template-columns: 2fr 1.25fr 1fr auto auto;
            gap: 0.75rem;
            margin-bottom: 2rem;
            align-items: center;
          }
          .filter-row-mobile { display: contents; }
          .filters-panel { display: contents; }
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div className="container" style={{ paddingTop: '2.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Explorer les outils</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
              {loading ? 'Recherche en cours...' : `${totalTools} outil(s) trouvé(s)`}
              {nearMe && <span style={{ color: '#2563eb', fontWeight: 700, marginLeft: '0.5rem' }}>• <i className="fas fa-location-arrow me-1"></i>Rayon 50km</span>}
            </p>
          </div>
          {user?.role === 'owner' && (
            <button className="btn-primary" onClick={() => navigate('/my-tools')}>
              <i className="fas fa-plus"></i> Publier un outil
            </button>
          )}
        </div>

        {/* Filters Top Bar */}
        <div className="filters-desktop">
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Que cherchez-vous ?" style={{ paddingLeft: '2.75rem' }} />
          </div>

          <div className="filter-row-mobile">
            {/* Category Selection back below/next to search */}
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Catégories...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* City */}
            <div style={{ position: 'relative', flex: 1 }}>
              <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ville..." style={{ paddingLeft: '2.5rem' }} />
            </div>

            {/* Near Me */}
            <button 
              onClick={handleNearMe} 
              disabled={gpsLoading}
              className={nearMe ? "btn-primary" : "btn-outline"}
              style={{ whiteSpace: 'nowrap', minWidth: 44 }}
            >
              <i className={`fas ${gpsLoading ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i>
              <span className="hide-mobile">{nearMe ? 'À proximité' : 'Près de moi'}</span>
            </button>
          </div>

          {/* Clear Filters (Desktop only) */}
          {(keyword || category || city || nearMe) && (
            <button className="hide-mobile" onClick={clearFilters} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '50%', width: 42, height: 42, padding: 0 }} title="Effacer les filtres">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="filters-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Tous les filtres</h3>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-times" style={{ color: '#64748b' }}></i>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              <div>
                <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ fontSize: '1rem', padding: '0.85rem' }}>
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Ville</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Casablanca" style={{ paddingLeft: '2.5rem', fontSize: '1rem', padding: '0.85rem 0.85rem 0.85rem 2.5rem' }} />
                </div>
              </div>
              
              <div>
                <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Localisation GPS</label>
                <button 
                  onClick={handleNearMe} 
                  className={nearMe ? "btn-primary" : "btn-outline"}
                  style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}
                >
                  <i className="fas fa-location-arrow"></i> {nearMe ? 'Rayon 50km actif ✓' : 'Chercher autour de moi'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => { clearFilters(); setShowMobileFilters(false); }}>Réinitialiser</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowMobileFilters(false)}>Appliquer</button>
            </div>
          </div>
        )}

        {/* Mobile Sticky Bar */}
        <div className="filter-bar">
          <button className="btn-outline" style={{ flex: 1, height: '3.5rem' }} onClick={() => setShowMobileFilters(true)}>
            <i className="fas fa-sliders" style={{ color: '#2563eb' }}></i> Filtres {(category || city || nearMe) ? '•' : ''}
          </button>
          <button 
            className={nearMe ? "btn-primary" : "btn-outline"} 
            style={{ flex: 1, height: '3.5rem' }} 
            onClick={handleNearMe}
          >
            <i className="fas fa-location-arrow"></i> {nearMe ? 'Proche ✓' : 'Près de moi'}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: '#2563eb' }}></i>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Recherche des meilleurs outils...</p>
          </div>
        ) : tools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9' }} className="animate-up">
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: '#e2e8f0' }}>
              <i className="fas fa-search"></i>
            </div>
            <h3>Aucun résultat</h3>
            <p style={{ color: '#64748b', maxWidth: 400, margin: '0.5rem auto 2rem' }}>
              Nous n'avons pas trouvé d'outils correspondant à vos critères. Essayez d'élargir votre recherche.
            </p>
            <button className="btn-outline" onClick={clearFilters}>Effacer tous les filtres</button>
          </div>
        ) : (
          <div className="tools-grid animate-up">
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/tools/${tool.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '4rem' }}>
            <button className="btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.6rem 1rem' }}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Page {page} sur {lastPage}</span>
            <button className="btn-outline" disabled={page === lastPage} onClick={() => setPage(p => p + 1)} style={{ padding: '0.6rem 1rem' }}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
