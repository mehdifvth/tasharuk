import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/tools/ToolCard';
import { useAuth } from '../context/AuthContext';

export default function ToolsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    api.get('/tools', { params })
      .then(r => { setTools(r.data.data || []); setLastPage(r.data.last_page || 1); })
      .catch(() => setTools([]))
      .finally(() => setLoading(false));
  }, [keyword, category, page]);

  useEffect(() => { setPage(1); }, [keyword, category]);
  useEffect(() => { loadTools(); }, [loadTools]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <style>{`
        .filter-input {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.6rem 0.85rem;
          font-size: 0.88rem;
          color: #374151;
          transition: border-color 0.15s;
          outline: none;
        }
        .filter-input:focus { border-color: #2563eb; }
        .page-btn {
          padding: 0.5rem 1.1rem;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #374151;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) {
          .tools-filters { flex-direction: column !important; }
          .tools-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .tools-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="container" style={{ paddingTop: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>
              Parcourir les outils
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              {loading ? 'Chargement...' : `${tools.length} outil${tools.length !== 1 ? 's' : ''} disponible${tools.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {user?.role === 'owner' && (
            <button
              onClick={() => navigate('/my-tools')}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <i className="fas fa-plus"></i> Publier un outil
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="tools-filters" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
            <input
              className="filter-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Rechercher un outil..."
              style={{ width: '100%', paddingLeft: 34, boxSizing: 'border-box' }}
            />
          </div>
          <select
            className="filter-input"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.tools_count})
              </option>
            ))}
          </select>
          {(keyword || category) && (
            <button
              onClick={() => { setKeyword(''); setCategory(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <i className="fas fa-times"></i> Effacer
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}></i>
            <p>Chargement des outils...</p>
          </div>
        ) : tools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem', color: '#e2e8f0' }}>
              <i className="fas fa-search"></i>
            </div>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>Aucun outil trouvé</p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              {keyword ? `Aucun résultat pour "${keyword}"` : 'Aucun outil disponible pour le moment'}
            </p>
          </div>
        ) : (
          <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/tools/${tool.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <i className="fas fa-chevron-left me-1"></i>Précédent
            </button>
            <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
              Page {page} / {lastPage}
            </span>
            <button className="page-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>
              Suivant<i className="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}