// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ users: [], tools: [], categories: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools');
  const [newCat, setNewCat] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/data');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) fetchData();
  }, [user]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleDeleteTool = async (id) => {
    if (!window.confirm('Supprimer cet outil ?')) return;
    try {
      await api.delete(`/admin/tools/${id}`);
      fetchData();
    } catch (err) { alert('Erreur lors de la suppression'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat) return;
    try {
      await api.post('/admin/categories', { name: newCat });
      setNewCat('');
      fetchData();
    } catch (err) { alert('Cette catégorie existe déjà'); }
  };

  if (!user?.is_admin) return <Navigate to="/" />;
  if (loading) return <div className="container py-5">Chargement...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-shield-alt text-primary me-2"></i>Administration Tasharuk</h2>
        <span className="badge bg-primary">Admin : {user.name}</span>
      </div>

      {/* Résumé des stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center p-3 border-0 bg-light shadow-sm">
            <h1 className="mb-2 text-primary"><i className="fas fa-tools"></i></h1>
            <h4 className="mb-0">{data.tools.length}</h4>
            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Outils</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 border-0 bg-light shadow-sm">
            <h1 className="mb-2 text-success"><i className="fas fa-users"></i></h1>
            <h4 className="mb-0">{data.users.length}</h4>
            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Utilisateurs</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 border-0 bg-light shadow-sm">
            <h1 className="mb-2 text-info"><i className="fas fa-folder"></i></h1>
            <h4 className="mb-0">{data.categories.length}</h4>
            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Catégories</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center p-3 border-0 bg-light shadow-sm">
            <h1 className="mb-2 text-warning"><i className="fas fa-calendar-alt"></i></h1>
            <h4 className="mb-0">{data.bookings.length}</h4>
            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Réservations</small>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}><i className="fas fa-tools me-2"></i>Outils</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><i className="fas fa-users me-2"></i>Utilisateurs</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}><i className="fas fa-folder me-2"></i>Catégories</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}><i className="fas fa-calendar-alt me-2"></i>Réservations</button>
        </li>
      </ul>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          
          {/* Table Outils */}
          {activeTab === 'tools' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Outil</th>
                    <th>Catégorie</th>
                    <th>Propriétaire</th>
                    <th>Prix</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tools.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.title}</strong></td>
                      <td><span className="badge bg-info text-dark">{t.category?.name}</span></td>
                      <td>{t.user?.name}</td>
                      <td>{t.price} DH/j</td>
                      <td className="text-end">
                        <button onClick={() => handleDeleteTool(t.id)} className="btn btn-sm btn-outline-danger">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Utilisateurs */}
          {activeTab === 'users' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.is_admin ? <span className="badge bg-danger">Admin</span> : <span className="badge bg-secondary">User</span>}</td>
                      <td className="text-end">
                        {u.id !== user.id && (
                          <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-outline-danger">Supprimer</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Catégories */}
          {activeTab === 'categories' && (
            <div className="p-3">
              <form onSubmit={handleAddCategory} className="d-flex gap-2 mb-4">
                <input 
                  type="text" className="form-control" placeholder="Nom de la nouvelle catégorie"
                  value={newCat} onChange={(e) => setNewCat(e.target.value)} required
                />
                <button type="submit" className="btn btn-primary text-nowrap">+ Ajouter</button>
              </form>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Nom</th>
                      <th>Nombre d'outils</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categories.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.tools_count} outils</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Table Réservations */}
          {activeTab === 'bookings' && (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Outil</th>
                    <th>Emprunteur</th>
                    <th>Dates</th>
                    <th>Prix Total</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.tool?.title}</td>
                      <td>{b.borrower?.name}</td>
                      <td>{b.start_date} au {b.end_date}</td>
                      <td>{b.total_price} DH</td>
                      <td>
                        <span className={`badge ${b.status === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
