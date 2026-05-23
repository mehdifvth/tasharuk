import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <style>{`
        .nav-link {
          color: #475569;
          font-weight: 500;
          font-size: 0.92rem;
          text-decoration: none;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover { color: #2563eb; background: #eff6ff; }
        .nav-link.active { color: #2563eb; font-weight: 700; }
        .nav-btn-primary {
          background: #2563eb; color: #fff; border: none;
          padding: 0.45rem 1.1rem; border-radius: 8px;
          font-weight: 600; font-size: 0.88rem; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }
        .nav-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .nav-btn-outline {
          background: transparent; color: #475569;
          border: 1.5px solid #e2e8f0; padding: 0.4rem 1rem;
          border-radius: 8px; font-weight: 600; font-size: 0.88rem;
          cursor: pointer; transition: all 0.15s;
        }
        .nav-btn-outline:hover { border-color: #2563eb; color: #2563eb; }
        .mobile-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1.25rem; color: #374151;
          font-size: 0.92rem; font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }
        .mobile-link:hover { background: #f8fafc; }
        .mobile-link.active { color: #2563eb; font-weight: 700; background: #eff6ff; }
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-links { display: flex !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>

      <nav style={{
        background: scrolled ? 'rgba(255, 255, 255, 0.85)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.5)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.04)' : 'none',
        padding: scrolled ? '0.55rem 0' : '0.8rem 0',
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size={32} />
          </Link>

          {/* Desktop */}
          <div className="desktop-links" style={{ alignItems: 'center', gap: '0.25rem' }}>
            <Link to="/tools" className={`nav-link ${isActive('/tools') ? 'active' : ''}`}>Parcourir</Link>
            {token ? (
              <>
                {user?.is_admin && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <i className="fas fa-shield-alt me-1"></i>Admin
                  </Link>
                )}
                {!user?.is_admin && (
                  <Link to="/my-tools" className={`nav-link ${isActive('/my-tools') ? 'active' : ''}`}>Mes Outils</Link>
                )}
                <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>Réservations</Link>
                <div style={{ margin: '0 0.25rem' }}><NotificationBell /></div>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.35rem 0.6rem', borderRadius: 8, border: '1.5px solid #e2e8f0', marginLeft: '0.25rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="nav-btn-outline" style={{ marginLeft: '0.25rem', color: '#dc2626', borderColor: '#fca5a5' }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Connexion</Link>
                <Link to="/register" style={{ marginLeft: '0.25rem' }}>
                  <button className="nav-btn-primary">S'inscrire</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="hamburger-btn" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
            {token && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: menuOpen ? '#f1f5f9' : 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: 8 }}
            >
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} style={{ color: '#374151', fontSize: '1.1rem' }}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '57px', left: 0, right: 0, zIndex: 99,
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideDown 0.15s ease',
        }}>
          <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <Link to="/tools" className={`mobile-link ${isActive('/tools') ? 'active' : ''}`}>
            <i className="fas fa-search" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>Parcourir
          </Link>
          {token ? (
            <>
              {user?.is_admin && (
                <Link to="/admin" className={`mobile-link ${isActive('/admin') ? 'active' : ''}`}>
                  <i className="fas fa-shield-alt" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>Admin
                </Link>
              )}
              {!user?.is_admin && (
                <Link to="/my-tools" className={`mobile-link ${isActive('/my-tools') ? 'active' : ''}`}>
                  <i className="fas fa-tools" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>Mes Outils
                </Link>
              )}
              <Link to="/bookings" className={`mobile-link ${isActive('/bookings') ? 'active' : ''}`}>
                <i className="fas fa-calendar-alt" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>Réservations
              </Link>
              <Link to="/profile" className={`mobile-link ${isActive('/profile') ? 'active' : ''}`}>
                <i className="fas fa-user" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>{user?.name}
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', background: 'none', border: 'none', color: '#dc2626', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}>
                <i className="fas fa-sign-out-alt" style={{ width: 18, textAlign: 'center' }}></i>Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">
                <i className="fas fa-sign-in-alt" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>Connexion
              </Link>
              <Link to="/register" className="mobile-link">
                <i className="fas fa-user-plus" style={{ width: 18, textAlign: 'center', color: '#2563eb' }}></i>S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}