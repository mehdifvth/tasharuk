// src/pages/MyToolsPage.jsx
// FIX: utilise GET /api/my-tools (route dédiée) au lieu de filtrer côté client
// FIX: utilise axios.put() directement au lieu de POST + _method=PUT

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ToolForm from '../components/tools/ToolForm';
import { useNavigate } from 'react-router-dom';

export default function MyToolsPage() {
  const { user } = useAuth();

  const [myTools, setMyTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // FIX: appel direct à /my-tools — retourne uniquement les outils du user connecté
  const loadMyTools = () => {
    setLoading(true);
    api.get('/my-tools')
      .then((r) => setMyTools(r.data))
      .catch(() => setMyTools([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMyTools(); }, []);

  // Créer un outil (multipart/form-data pour l'image)
  const handleCreate = async (formData) => {
    setSaving(true); setError(null);
    try {
      await api.post('/tools', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowForm(false);
      loadMyTools();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' — '));
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création');
      }
    } finally {
      setSaving(false);
    }
  };

  // FIX: Modifier un outil avec PUT direct (axios gère bien FormData + PUT)
  const handleUpdate = async (formData) => {
    setSaving(true); setError(null);
    try {
      // FIX: on utilise POST sur la route /tools/{id} qui accepte PUT et POST
      await api.post(`/tools/${editing.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditing(null);
      loadMyTools();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' — '));
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un outil
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet outil définitivement ?')) return;
    try {
      await api.delete(`/tools/${id}`);
      loadMyTools();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="container py-4" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
          <i className="fas fa-lock me-2"></i>Accès réservé aux propriétaires
        </p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/profile')}>
          Changer mon rôle
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .tool-form-card {
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 fw-bold">
            <i className="fas fa-tools me-2 text-primary"></i>Mes Outils
          </h1>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => { setShowForm(true); setEditing(null); setError(null); }}
          >
            <i className="fas fa-plus me-2"></i>Ajouter un outil
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>{error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showForm && !editing && (
          <div className="card shadow-sm border-0 mb-4 mx-auto tool-form-card" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Nouvel outil</h5>
            </div>
            <div className="card-body">
              <ToolForm onSubmit={handleCreate} loading={saving} />
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="btn btn-link text-muted mt-2 w-100"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Formulaire de modification */}
        {editing && (
          <div className="card shadow-sm border-0 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-primary text-white py-3">
              <h5 className="mb-0">Modifier — {editing.title}</h5>
            </div>
            <div className="card-body">
              <ToolForm initial={editing} onSubmit={handleUpdate} loading={saving} />
              <button
                onClick={() => { setEditing(null); setError(null); }}
                className="btn btn-link text-muted mt-2 w-100"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2 text-muted">Chargement de vos outils...</p>
          </div>
        ) : myTools.length === 0 ? (
          <div className="card border-0 shadow-sm py-5 text-center bg-white">
            <div className="card-body">
              <div className="d-inline-flex align-items-center justify-content-center border border-primary rounded-circle mb-3" style={{ width: '80px', height: '80px', borderWidth: '2px !important' }}>
                <i className="fas fa-box-open fa-2x text-primary"></i>
              </div>
              <p className="text-muted mb-3">Vous n'avez pas encore d'outils listés.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-outline-primary"
              >
                Ajoutez votre premier outil !
              </button>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {myTools.map((tool) => (
              <div key={tool.id} className="col">
                <div className="card h-100 shadow-sm border-0 overflow-hidden">
                  {tool.image_url ? (
                    <img
                      src={tool.image_url}
                      alt={tool.title}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                      <i className="fas fa-wrench fa-3x text-muted opacity-25"></i>
                    </div>
                  )}

                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold mb-0 text-truncate" title={tool.title}>
                        {tool.title}
                      </h5>
                      <span className="badge bg-light text-dark border">{tool.price} MAD/j</span>
                    </div>
                    <p className="text-muted small mb-3">
                      <i className="fas fa-folder me-1"></i>{tool.category?.name}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                        onClick={() => { setEditing(tool); setShowForm(false); setError(null); }}
                      >
                        <i className="fas fa-edit me-1"></i>Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(tool.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
