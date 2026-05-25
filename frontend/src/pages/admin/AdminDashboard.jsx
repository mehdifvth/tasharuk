// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
      counts: { users: 0, tools: 0, bookings: 0, reviews: 0 },
      recent_users: [],
      recent_tools: [],
      recent_bookings: [],
      categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/data')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Outils', value: data.counts.tools, icon: 'fa-tools', color: '#2563eb', bg: '#dbeafe', path: '/admin/tools' },
    { label: 'Utilisateurs', value: data.counts.users, icon: 'fa-users', color: '#16a34a', bg: '#dcfce7', path: '/admin/users' },
    { label: 'Réservations', value: data.counts.bookings, icon: 'fa-calendar-alt', color: '#10b981', bg: '#d1fae5', path: '/admin/bookings' },
    { label: 'Avis', value: data.counts.reviews, icon: 'fa-star', color: '#7c3aed', bg: '#f5f3ff', path: '/admin/reviews' },
  ];

  const STATUS_STYLE = {
    approved: { bg: '#d1fae5', color: '#065f46' },
    completed: { bg: '#e0f2fe', color: '#0369a1' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
    cancelled: { bg: '#f1f5f9', color: '#475569' },
    pending: { bg: '#fef9c3', color: '#854d0e' },
  };

  const STATUS_FR = {
    approved: 'Approuvée', completed: 'Terminée',
    rejected: 'Rejetée', cancelled: 'Annulée', pending: 'En attente',
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.75rem', color: '#6366f1' }}></i>
        <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '0.88rem' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>
          Tableau de bord
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Vue d'ensemble de la plateforme Tasharuk
        </p>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {stats.map(s => (
          <div key={s.label} onClick={() => navigate(s.path)} style={S.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1 }}>
                  {s.value}
                </p>
              </div>
              <div style={{
                background: s.bg, borderRadius: 12, width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className={`fas ${s.icon}`} style={{ fontSize: '1.1rem', color: s.color }}></i>
              </div>
            </div>
            <div style={{
              marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>
                Voir les {s.label.toLowerCase()} →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent grid */}
      <div style={S.twoCol}>
        {/* Réservations récentes */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div>
              <h3 style={S.cardTitle}>Réservations récentes</h3>
              <p style={S.cardSub}>Dernières demandes</p>
            </div>
            <button onClick={() => navigate('/admin/bookings')} style={S.linkBtn}>
              Tout voir →
            </button>
          </div>
          {data.recent_bookings.length === 0 ? (
            <p style={S.empty}>Aucune réservation</p>
          ) : (
            data.recent_bookings.map(b => (
              <div key={b.id} style={S.listItem}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: STATUS_STYLE[b.status]?.color || '#94a3b8', flexShrink: 0
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600, margin: 0, fontSize: '0.85rem', color: '#0f172a',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {b.tool?.title}
                  </p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.75rem' }}>
                    {b.borrower?.name} · {new Date(b.start_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{ ...S.badge, background: STATUS_STYLE[b.status]?.bg, color: STATUS_STYLE[b.status]?.color }}>
                  {STATUS_FR[b.status] || b.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Utilisateurs récents */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div>
              <h3 style={S.cardTitle}>Utilisateurs récents</h3>
              <p style={S.cardSub}>Dernières inscriptions</p>
            </div>
            <button onClick={() => navigate('/admin/users')} style={S.linkBtn}>
              Tout voir →
            </button>
          </div>
          {data.recent_users.length === 0 ? (
            <p style={S.empty}>Aucun utilisateur</p>
          ) : (
            data.recent_users.map(u => (
              <div key={u.id} style={S.listItem}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: u.is_admin ? '#eef2ff' : u.role === 'owner' ? '#e0f2fe' : '#d1fae5',
                  color: u.is_admin ? '#6366f1' : u.role === 'owner' ? '#0ea5e9' : '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.82rem', flexShrink: 0
                }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem', color: '#0f172a' }}>{u.name}</p>
                  <p style={{
                    color: '#94a3b8', margin: 0, fontSize: '0.75rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{u.email}</p>
                </div>
                <span style={{
                  ...S.badge,
                  background: u.is_admin ? '#eef2ff' : u.role === 'owner' ? '#e0f2fe' : '#d1fae5',
                  color: u.is_admin ? '#6366f1' : u.role === 'owner' ? '#0ea5e9' : '#10b981',
                }}>
                  {u.is_admin ? 'Admin' : u.role === 'owner' ? 'Propriétaire' : 'Emprunteur'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Outils récents avec photos */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div>
            <h3 style={S.cardTitle}>Outils récents</h3>
            <p style={S.cardSub}>Dernières publications</p>
          </div>
          <button onClick={() => navigate('/admin/tools')} style={S.linkBtn}>
            Tout voir →
          </button>
        </div>
        <div style={S.toolsGrid}>
          {data.recent_tools.map(t => (
            <div key={t.id} style={S.toolCard}>
              {t.image_url
                ? <img src={t.image_url} alt={t.title} style={S.toolImg} />
                : <div style={S.toolPlaceholder}>
                  <i className="fas fa-wrench" style={{ fontSize: '1.5rem', color: '#cbd5e1' }}></i>
                </div>
              }
              <div style={{ padding: '0.65rem' }}>
                <p style={{
                  fontWeight: 700, margin: '0 0 0.15rem', fontSize: '0.82rem', color: '#0f172a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{t.title}</p>
                <p style={{ color: '#6366f1', margin: 0, fontSize: '0.78rem', fontWeight: 700 }}>{t.price} MAD/h</p>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.72rem' }}>{t.user?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: {
    background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.2s',
  },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1rem', marginBottom: '1rem' },
  card: {
    background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '1rem'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  cardTitle: { fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', margin: 0 },
  cardSub: { color: '#94a3b8', fontSize: '0.75rem', margin: '0.15rem 0 0' },
  linkBtn: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 },
  listItem: { display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0', borderBottom: '1px solid #f8fafc' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 },
  empty: { color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' },
  toolsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.75rem' },
  toolCard: { border: '1px solid #f1f5f9', borderRadius: 10, overflow: 'hidden' },
  toolImg: { width: '100%', height: 90, objectFit: 'cover' },
  toolPlaceholder: { height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
};