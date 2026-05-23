import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ToolForm from '../components/tools/ToolForm';
import { useNavigate } from 'react-router-dom';

export default function MyToolsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTools, setMyTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const loadMyTools = () => {
    setLoading(true);
    api.get('/my-tools')
      .then(r => setMyTools(r.data))
      .catch(() => setMyTools([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMyTools(); }, []);

  const handleCreate = async (formData) => {
    setSaving(true); setError(null);
    try {
      await api.post('/tools', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false); loadMyTools();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' — ') : err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (formData) => {
    setSaving(true); setError(null);
    try {
      await api.post(`/tools/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditing(null); loadMyTools();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(' — ') : err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet outil définitivement ?')) return;
    try { await api.delete(`/tools/${id}`); loadMyTools(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (user?.role !== 'owner') return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 20, padding: '3rem 2rem', border: '1px solid #f1f5f9', maxWidth: 380 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem' }}>🔒</div>
        <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Accès réservé</h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>Cette page est réservée aux propriétaires.</p>
        <button onClick={() => navigate('/profile')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
          Changer mon rôle
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '3rem' }}>
      <style>{`
        .tool-manage-card { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; overflow: hidden; transition: box-shadow 0.2s; }
        .tool-manage-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .tool-action-btn { padding: 0.45rem 0.85rem; border-radius: 8px; border: none; font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.35rem; }
      `}</style>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>Mes Outils</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              {myTools.length} outil{myTools.length !== 1 ? 's' : ''} publié{myTools.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setError(null); }}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <i className="fas fa-plus"></i> Ajouter un outil
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span><i className="fas fa-exclamation-circle me-1"></i>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}>×</button>
          </div>
        )}

        {/* Form panel */}
        {(showForm || editing) && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '1.75rem', maxWidth: 580 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                {editing ? `Modifier — ${editing.title}` : 'Nouvel outil'}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1rem' }}
              >×</button>
            </div>
            <ToolForm initial={editing || null} onSubmit={editing ? handleUpdate : handleCreate} loading={saving} />
          </div>
        )}

        {/* Tools grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '0.75rem', display: 'block' }}></i>
            Chargement...
          </div>
        ) : myTools.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔧</div>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>Aucun outil publié</p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>Ajoutez votre premier outil et commencez à gagner !</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
              Ajouter mon premier outil
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {myTools.map(tool => (
              <div key={tool.id} className="tool-manage-card">
                {tool.image_url
                  ? <img src={tool.image_url} alt={tool.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  : <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', fontSize: '3rem', color: '#94a3b8' }}>
                    <i className="fas fa-wrench"></i>
                  </div>
                }
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.5rem' }}>
                      {tool.title}
                    </h3>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem', flexShrink: 0 }}>{tool.price} MAD/j</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fas fa-folder" style={{ color: '#2563eb' }}></i> {tool.category?.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="tool-action-btn"
                      onClick={() => { setEditing(tool); setShowForm(false); setError(null); }}
                      style={{ flex: 1, background: '#eff6ff', color: '#1d4ed8', justifyContent: 'center' }}
                    >
                      <i className="fas fa-edit"></i> Modifier
                    </button>
                    <button
                      className="tool-action-btn"
                      onClick={() => handleDelete(tool.id)}
                      style={{ background: '#fef2f2', color: '#dc2626' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}