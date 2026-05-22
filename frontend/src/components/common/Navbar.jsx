// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const linkStyle = (path) => ({
    color: isActive(path) ? '#60a5fa' : '#cbd5e1',
    fontWeight: isActive(path) ? 700 : 400,
    fontSize: '0.95rem',
    textDecoration: 'none',
  });

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav style={styles.nav}>
        <div className="container" style={styles.inner}>
          {/* Logo */}
          <Link to="/" style={styles.brand} onClick={close}>
            <i className="fas fa-wrench me-2"></i>Tasharuk
          </Link>

          {/* Desktop links */}
          <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/tools" style={linkStyle('/tools')}>Parcourir</Link>
            {token ? (
              <>
                {user?.is_admin && (
                  <Link to="/admin" style={linkStyle('/admin')}>
                    <i className="fas fa-star me-1"></i> Admin
                  </Link>
                )}
                {!user?.is_admin && (
                  <Link to="/my-tools" style={linkStyle('/my-tools')}>Mes Outils</Link>
                )}
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

          {/* Hamburger button — mobile only */}
          <div className="hamburger-wrapper" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
            {token && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.hamburger}
              aria-label="Menu"
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} style={{ color: '#fff', fontSize: '1.2rem' }}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/tools" style={styles.mobileLink} onClick={close}>
            <i className="fas fa-search me-2"></i>Parcourir
          </Link>

          {token ? (
            <>
              {user?.is_admin && (
                <Link to="/admin" style={styles.mobileLink} onClick={close}>
                  <i className="fas fa-star me-2"></i>Admin
                </Link>
              )}
              {!user?.is_admin && (
                <Link to="/my-tools" style={styles.mobileLink} onClick={close}>
                  <i className="fas fa-tools me-2"></i>Mes Outils
                </Link>
              )}
              <Link to="/bookings" style={styles.mobileLink} onClick={close}>
                <i className="fas fa-clipboard-list me-2"></i>Réservations
              </Link>
              <Link to="/profile" style={styles.mobileLink} onClick={close}>
                <i className="fas fa-user me-2"></i>{user?.name}
              </Link>
              <button onClick={handleLogout} style={styles.mobileLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={close}>
                <i className="fas fa-sign-in-alt me-2"></i>Connexion
              </Link>
              <Link to="/register" style={styles.mobileLink} onClick={close}>
                <i className="fas fa-user-plus me-2"></i>S'inscrire
              </Link>
            </>
          )}
        </div>
      )}

      {/* CSS Media Queries */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger-wrapper { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger-wrapper { display: none !important; }
          .desktop-links { display: flex !important; }
        }
      `}</style>
    </>
  );
}

const styles = {
  nav: {
    background: '#1e293b', padding: '0.8rem 0',
    position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#fff', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.3px' },
  desktopLinks: { display: 'flex', alignItems: 'center', gap: '1.25rem', className: 'desktop-links' },
  hamburgerWrapper: {
    display: 'none', alignItems: 'center', gap: '0.75rem',
    className: 'hamburger-wrapper',
  },
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem',
  },
  username: { color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none' },
  mobileMenu: {
    position: 'fixed', top: '57px', left: 0, right: 0, zIndex: 99,
    background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column', padding: '0.5rem 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  mobileLink: {
    color: '#cbd5e1', padding: '0.85rem 1.5rem', fontSize: '0.95rem',
    textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'block',
  },
  mobileLogout: {
    background: 'none', border: 'none', color: '#f87171',
    padding: '0.85rem 1.5rem', fontSize: '0.95rem', cursor: 'pointer',
    textAlign: 'left', width: '100%',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
};