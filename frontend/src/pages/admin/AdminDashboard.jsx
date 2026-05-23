// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], tools: [], categories: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/data')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Outils', value: data.tools.length, icon: 'fa-tools', color: '#2563eb', bg: '#dbeafe', path: '/admin/tools' },
    { label: 'Utilisateurs', value: data.users.length, icon: 'fa-users', color: '#16a34a', bg: '#dcfce7', path: '/admin/users' },
    { label: 'Catégories', value: data.categories.length, icon: 'fa-folder', color: '#f59e0b', bg: '#fef9c3', path: '/admin/categories' },
    { label: 'Réservations', value: data.bookings.length, icon: 'fa-calendar-alt', color: '#dc2626', bg: '#fee2e2', path: '/admin/bookings' },
  ];

  const recentBookings = data.bookings.slice(0, 5);
  const recentUsers = data.users.slice(0, 5);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
        <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Stats cards */}
      <div style={styles.statsGrid}>
        {stats.map(s => (
          <div
            key={s.label}
            onClick={() => navigate(s.path)}
            style={{ ...styles.statCard, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {s.value}
                </p>
              </div>
              <div style={{ background: s.bg, borderRadius: 12, padding: '0.75rem' }}>
                <i className={`fas ${s.icon}`} style={{ fontSize: '1.25rem', color: s.color }}></i>
              </div>
            </div>
            <p style={{ color: s.color, fontSize: '0.78rem', fontWeight: 600, margin: '0.75rem 0 0' }}>
              <i className="fas fa-arrow-right me-1"></i> Voir tout
            </p>
          </div>
        ))}
      </div>

      {/* Recent sections */}
      <div style={styles.recentGrid}>
        {/* Réservations récentes */}
        <div style={styles.recentCard}>
          <div style={styles.recentHeader}>
            <h3 style={styles.recentTitle}>
              <i className="fas fa-calendar-alt me-2 text-primary"></i>Réservations récentes
            </h3>
            <button onClick={() => navigate('/admin/bookings')} style={styles.viewAll}>
              Voir tout <i className="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>Aucune réservation</p>
          ) : (
            recentBookings.map(b => (
              <div key={b.id} style={styles.recentItem}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '0.88rem' }}>{b.tool?.title}</p>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.78rem' }}>
                    {b.borrower?.name} · {b.start_date?.slice(0, 10)}
                  </p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: b.status === 'approved' ? '#dcfce7' : b.status === 'completed' ? '#dbeafe' :
                    b.status === 'rejected' ? '#fee2e2' : b.status === 'cancelled' ? '#f1f5f9' : '#fef9c3',
                  color: b.status === 'approved' ? '#16a34a' : b.status === 'completed' ? '#2563eb' :
                    b.status === 'rejected' ? '#dc2626' : b.status === 'cancelled' ? '#64748b' : '#854d0e',
                }}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Utilisateurs récents */}
        <div style={styles.recentCard}>
          <div style={styles.recentHeader}>
            <h3 style={styles.recentTitle}>
              <i className="fas fa-users me-2 text-success"></i>Utilisateurs récents
            </h3>
            <button onClick={() => navigate('/admin/users')} style={styles.viewAll}>
              Voir tout <i className="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>Aucun utilisateur</p>
          ) : (
            recentUsers.map(u => (
              <div key={u.id} style={styles.recentItem}>
                <div style={styles.avatar}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '0.88rem' }}>{u.name}</p>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.78rem' }}>{u.email}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: u.is_admin ? '#fef3c7' : u.role === 'owner' ? '#dbeafe' : '#dcfce7',
                  color: u.is_admin ? '#92400e' : u.role === 'owner' ? '#1d4ed8' : '#16a34a',
                }}>
                  {u.is_admin ? 'Admin' : u.role === 'owner' ? 'Propriétaire' : 'Emprunteur'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Outils récents avec photos */}
      <div style={styles.recentCard}>
        <div style={styles.recentHeader}>
          <h3 style={styles.recentTitle}>
            <i className="fas fa-tools me-2" style={{ color: '#f59e0b' }}></i>Outils récents
          </h3>
          <button onClick={() => navigate('/admin/tools')} style={styles.viewAll}>
            Voir tout <i className="fas fa-arrow-right ms-1"></i>
          </button>
        </div>
        <div style={styles.toolsGrid}>
          {data.tools.slice(0, 6).map(t => (
            <div key={t.id} style={styles.toolCard}>
              {t.image_url
                ? <img src={t.image_url} alt={t.title} style={styles.toolImg} />
                : <div style={styles.toolPlaceholder}><i className="fas fa-wrench"></i></div>
              }
              <div style={{ padding: '0.6rem' }}>
                <p style={{
                  fontWeight: 700, margin: 0, fontSize: '0.82rem', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{t.title}</p>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>{t.price} MAD/j</p>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.72rem' }}>{t.user?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'box-shadow 0.2s' },
  recentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  recentCard: { background: '#fff', borderRadius: 12, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: '1rem' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  recentTitle: { fontWeight: 700, fontSize: '0.95rem', margin: 0 },
  viewAll: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  recentItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' },
  statusBadge: { padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' },
  toolCard: { border: '1px solid #f1f5f9', borderRadius: 8, overflow: 'hidden' },
  toolImg: { width: '100%', height: 100, objectFit: 'cover' },
  toolPlaceholder: { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '2rem', color: '#94a3b8' },
};