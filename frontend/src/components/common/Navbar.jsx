// src/components/common/Navbar.jsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Lien actif
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const linkStyle = (path) => ({
    color: isActive(path) ? '#60a5fa' : '#cbd5e1',
    fontWeight: isActive(path) ? 700 : 400,
    fontSize: '0.95rem',
  });

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.brand}><i className="fas fa-wrench me-2"></i>Tasharuk</Link>

        {/* Desktop links */}
        <div style={styles.links}>
          <Link to="/tools" style={linkStyle('/tools')}>Parcourir</Link>

          {token ? (
            <>
              {user?.is_admin && (
                <Link to="/admin" style={linkStyle('/admin')}><i className="fas fa-star me-1"></i> Admin</Link>
              )}
              <Link to="/my-tools" style={linkStyle('/my-tools')}>Mes Outils</Link>
              <Link to="/bookings" style={linkStyle('/bookings')}>Réservations</Link>

              <NotificationBell />
              <Link to="/profile" style={styles.username}>
                <i className="fas fa-user me-1"></i> {user?.name}
              </Link>
              <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle('/login')}>Connexion</Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
                  S'inscrire
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1e293b', padding: '0.8rem 0', position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#fff', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.3px' },
  links: { display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' },
  separator: { color: '#334155' },
  username: { color: '#94a3b8', fontSize: '0.88rem' },
};
