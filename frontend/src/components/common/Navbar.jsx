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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      <style>{`
        .nav-link {
          color: #475569;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          padding: 0.5rem 0.85rem;
          border-radius: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-link:hover { color: #0f172a; background: #f1f5f9; }
        .nav-link.active { color: #2563eb; background: #eff6ff; }
        
        .mobile-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 98;
          animation: fadeIn 0.2s ease;
        }

        .mobile-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 300px; background: #fff; z-index: 99;
          box-shadow: -10px 0 40px rgba(0,0,0,0.1);
          display: flex; flex-direction: column;
          padding: 1.5rem;
          transform: translateX(${menuOpen ? '0' : '100%'});
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-link {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem; color: #334155;
          font-size: 1rem; font-weight: 600;
          text-decoration: none;
          border-radius: 14px;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }
        .mobile-link:active { background: #f1f5f9; }
        .mobile-link.active { color: #2563eb; background: #eff6ff; }

        @media (max-width: 1024px) {
          .desktop-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .desktop-links { display: flex !important; }
          .hamburger-btn { display: none !important; }
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <nav style={{
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid ' + (scrolled ? 'rgba(226, 232, 240, 0.8)' : 'transparent'),
        padding: scrolled ? '0.6rem 0' : '1rem 0',
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'all 0.4s ease',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Link to="/" style={{ display: 'flex' }} onClick={() => setMenuOpen(false)}>
            <Logo size={42} />
          </Link>

          {/* Desktop */}
          <div className="desktop-links" style={{ alignItems: 'center', gap: '0.4rem' }}>
            <Link to="/tools" className={`nav-link ${isActive('/tools') ? 'active' : ''}`}>Explorer</Link>
            {token ? (
              <>
                {user?.is_admin && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <i className="fas fa-shield-alt"></i>Admin
                  </Link>
                )}
                {!user?.is_admin && (
                  <Link to="/my-tools" className={`nav-link ${isActive('/my-tools') ? 'active' : ''}`}>Mes Outils</Link>
                )}
                <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>Réservations</Link>
                <div style={{ margin: '0 0.4rem' }}><NotificationBell /></div>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.85rem', borderRadius: 14, background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1.5px solid #e2e8f0', marginLeft: '0.5rem', transition: 'all 0.2s' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{user?.name?.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                <Link to="/login">
                  <button className="btn-auth-login">Connexion</button>
                </Link>
                <Link to="/register">
                  <button className="btn-auth-register">S'inscrire</button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="hamburger-btn" style={{ display: 'none', alignItems: 'center', gap: '0.6rem' }}>
            {token && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(true)}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Open menu"
            >
              <i className="fas fa-bars-staggered" style={{ color: '#1e293b', fontSize: '1.2rem' }}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu Sidebar */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <div className="mobile-menu">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <Logo size={36} />
          <button 
            onClick={() => setMenuOpen(false)}
            style={{ background: '#f1f5f9', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fas fa-times" style={{ color: '#64748b', fontSize: '1.1rem' }}></i>
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <Link to="/tools" className={`mobile-link ${isActive('/tools') ? 'active' : ''}`}>
            <i className="fas fa-magnifying-glass" style={{ width: 24, color: '#2563eb' }}></i>Explorer les outils
          </Link>
          
          {token ? (
            <>
              {user?.is_admin && (
                <Link to="/admin" className={`mobile-link ${isActive('/admin') ? 'active' : ''}`}>
                  <i className="fas fa-shield-halved" style={{ width: 24, color: '#6366f1' }}></i>Administration
                </Link>
              )}
              {!user?.is_admin && (
                <Link to="/my-tools" className={`mobile-link ${isActive('/my-tools') ? 'active' : ''}`}>
                  <i className="fas fa-toolbox" style={{ width: 24, color: '#2563eb' }}></i>Mes Outils
                </Link>
              )}
              <Link to="/bookings" className={`mobile-link ${isActive('/bookings') ? 'active' : ''}`}>
                <i className="fas fa-calendar-check" style={{ width: 24, color: '#2563eb' }}></i>Réservations
              </Link>
              <Link to="/profile" className={`mobile-link ${isActive('/profile') ? 'active' : ''}`}>
                <i className="fas fa-circle-user" style={{ width: 24, color: '#2563eb' }}></i>Mon Profil
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-auth-login" style={{ width: '100%', border: '1.5px solid #e2e8f0', padding: '1rem' }}>Connexion</button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn-auth-register" style={{ width: '100%', padding: '1rem' }}>S'inscrire</button>
              </Link>
            </div>
          )}
        </div>

        {token && (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#fef2f2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: 14,
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginTop: '1rem',
            }}
          >
            <i className="fas fa-arrow-right-from-bracket"></i> Déconnexion
          </button>
        )}
      </div>
    </>
  );
}
