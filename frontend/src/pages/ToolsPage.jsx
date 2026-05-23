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
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const loadTools = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    api.get('/tools', { params })
      .then((r) => { setTools(r.data.data || []); setLastPage(r.data.last_page || 1); })
      .catch(() => setTools([]))
      .finally(() => setLoading(false));
  }, [keyword, category, page]);

  useEffect(() => { setPage(1); }, [keyword, category]);
  useEffect(() => { loadTools(); }, [loadTools]);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .tools-filters {
            flex-direction: column !important;
          }
          .tools-filters input,
          .tools-filters select {
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .tools-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem' }}>
            <i className="fas fa-search me-2 text-primary"></i>Parcourir les Outils
          </h1>
          {user?.role === 'owner' && (
            <button className="btn-primary" onClick={() => navigate('/my-tools')}>
              <i className="fas fa-plus me-1"></i> Publier un outil
            </button>
          )}
          {tools.length > 0 && !loading && (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{tools.length} outil(s) trouvé(s)</p>
          )}
        </div>

        {/* Filtres */}
        <div className="tools-filters" style={styles.filters}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Rechercher par titre ou description..."
              style={{ width: '100%', paddingLeft: '35px' }}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 220 }}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {(keyword || category) && (
            <button
              onClick={() => { setKeyword(''); setCategory(''); }}
              style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 600 }}
            >
              <i className="fas fa-times me-1"></i> Effacer
            </button>
          )}
        </div>

        {loading ? (
          <p className="spinner">Chargement des outils...</p>
        ) : tools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><i className="fas fa-search"></i></p>
            <p>Aucun outil trouvé{keyword ? ` pour "${keyword}"` : ''}.</p>
          </div>
        ) : (
          <div className="tools-grid" style={styles.grid}>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/tools/${tool.id}`)} />
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div style={styles.pagination}>
            <button className="btn-outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Page {page} / {lastPage}</span>
            <button className="btn-outline" disabled={page === lastPage} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
};