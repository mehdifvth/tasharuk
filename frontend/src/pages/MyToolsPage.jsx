// src/pages/MyToolsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ToolForm from '../components/tools/ToolForm';
import { useNavigate } from 'react-router-dom';

const COND = {
  new: { label: 'Neuf', color: '#16a34a', bg: '#dcfce7' },
  good: { label: 'Bon état', color: '#d97706', bg: '#fef9c3' },
  fair: { label: 'Correct', color: '#dc2626', bg: '#fee2e2' },
};

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

  const closeForm = () => { setShowForm(false); setEditing(null); setError(null); };

  /* ── Access guard ── */
  if (user?.role !== 'owner') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 20, padding: '3rem 2rem', border: '1px solid #f1f5f9', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>🔒</div>
        <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Accès réservé</h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          Cette page est réservée aux propriétaires. Changez votre rôle pour commencer à publier des outils.
        </p>
        <button
          onClick={() => navigate('/profile')}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          Changer mon rôle
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .mt-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .mt-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .mt-act { padding: 0.5rem 0.75rem; border-radius: 8px; border: none; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.35rem; }
        .mt-act:hover { opacity: 0.85; }

        .mt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }

        @media (max-width: 640px) {
          .mt-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .mt-header { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media (max-width: 400px) {
          .mt-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="mt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Mes Outils</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {myTools.length} outil{myTools.length !== 1 ? 's' : ''} publié{myTools.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setError(null); }}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '0.65rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', whiteSpace: 'nowrap' }}
        >
          <i className="fas fa-plus"></i> Ajouter un outil
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="fas fa-exclamation-circle"></i>{error}
          </span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* Form panel */}
      {(showForm || editing) && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                {editing ? 'Modifier l\'outil' : 'Nouvel outil'}
              </h3>
              {editing && <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>{editing.title}</p>}
            </div>
            <button
              onClick={closeForm}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1rem', flexShrink: 0 }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <ToolForm initial={editing || null} onSubmit={editing ? handleUpdate : handleCreate} loading={saving} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '0.75rem', display: 'block' }}></i>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Chargement de vos outils...</p>
        </div>
      ) : myTools.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 20, border: '2px dashed #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
            🔧
          </div>
          <p style={{ fontWeight: 800, color: '#374151', fontSize: '1.05rem', margin: '0 0 0.4rem' }}>Aucun outil publié</p>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
            Ajoutez votre premier outil et commencez à générer des revenus !
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
          >
            <i className="fas fa-plus me-1"></i> Ajouter mon premier outil
          </button>
        </div>
      ) : (
        <div className="mt-grid">
          {myTools.map(tool => {
            const cond = COND[tool.condition] || COND.good;
            return (
              <div key={tool.id} className="mt-card">
                {/* Image */}
                <div style={{ position: 'relative' }}>
                  {tool.image_url
                    ? <img src={tool.image_url} alt={tool.title} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                    : <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', fontSize: '2.5rem', color: '#cbd5e1' }}>
                      <i className="fas fa-wrench"></i>
                    </div>
                  }
                  {/* Condition badge overlay */}
                  <span style={{ position: 'absolute', top: 8, left: 8, background: cond.bg, color: cond.color, fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20 }}>
                    {cond.label}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {tool.title}
                    </h3>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem', flexShrink: 0 }}>
                      {tool.price} MAD/h
                    </span>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <i className="fas fa-tag" style={{ color: '#cbd5e1', fontSize: '0.7rem' }}></i>
                    {tool.category?.name}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="mt-act"
                      onClick={() => { setEditing(tool); setShowForm(false); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{ flex: 1, background: '#eff6ff', color: '#1d4ed8', justifyContent: 'center' }}
                    >
                      <i className="fas fa-edit"></i> Modifier
                    </button>
                    <button
                      className="mt-act"
                      onClick={() => navigate(`/tools/${tool.id}`)}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                      title="Voir"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="mt-act"
                      onClick={() => handleDelete(tool.id)}
                      style={{ background: '#fef2f2', color: '#dc2626' }}
                      title="Supprimer"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}