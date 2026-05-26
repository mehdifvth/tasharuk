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

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
  };

  return (
    <>
      <style>{`
        .nav-link {
          color: #64748b;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }
        .nav-link:hover { 
          color: #2563eb; 
          background: #f8fafc;
          transform: translateY(-1px);
        }
        .nav-link.active { 
          color: #2563eb; 
          background: #eff6ff; 
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #2563eb;
        }
        
        .mobile-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(8px);
          z-index: 998;
          animation: fadeIn 0.3s ease;
        }

        .mobile-menu {
          position: fixed; top: 1rem; right: 1rem; bottom: 1rem;
          width: 280px; background: #fff; z-index: 999;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          display: flex; flex-direction: column;
          padding: 1.5rem;
          border-radius: 24px;
          transform: translateX(${menuOpen ? '0' : '120%'});
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .mobile-link {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.85rem 1rem; color: #475569;
          font-size: 0.95rem; font-weight: 700;
          text-decoration: none;
          border-radius: 16px;
          margin-bottom: 0.4rem;
          transition: all 0.2s;
        }
        .mobile-link:active { background: #f1f5f9; transform: scale(0.98); }
        .mobile-link.active { color: #2563eb; background: #eff6ff; }

        .btn-profile-desktop {
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          padding: 0.4rem 0.5rem 0.4rem 1rem; 
          border-radius: 100px; 
          background: #fff; 
          border: 1.5px solid #e2e8f0; 
          margin-left: 0.75rem; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
        }
        .btn-profile-desktop:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(37,99,235,0.08);
          transform: translateY(-1px);
        }

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
        background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1.5px solid rgba(226, 232, 240, 0.5)' : '1.5px solid transparent',
        padding: scrolled ? '0.75rem 0' : '1.25rem 0',
        position: 'sticky', top: 0, zIndex: 1000,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Link to="/" style={{ display: 'flex', transition: 'transform 0.3s' }} onClick={() => setMenuOpen(false)}>
            <Logo size={scrolled ? 38 : 44} />
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-links" style={{ alignItems: 'center', gap: '0.25rem' }}>
            <Link to="/tools" className={`nav-link ${isActive('/tools') ? 'active' : ''}`}>
              Explorer
            </Link>

            {token ? (
              <>
                {user?.is_admin && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    Admin
                  </Link>
                )}
                {!user?.is_admin && (
                  <Link to="/my-tools" className={`nav-link ${isActive('/my-tools') ? 'active' : ''}`}>
                    Mes Outils
                  </Link>
                )}
                <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
                  Réservations
                </Link>

                <div style={{ width: '1.5px', height: '24px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>

                <NotificationBell />

                <Link to="/profile" className="btn-profile-desktop">
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>{user?.name?.split(' ')[0]}</span>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  Connexion
                </Link>
                <Link to="/register">
                  <button style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                  }}>
                    Démarrer
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="hamburger-btn" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
            {token && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                cursor: 'pointer',
                width: 44,
                height: 44,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Menu"
            >
              <i className="fas fa-bars-staggered" style={{ color: '#1e293b', fontSize: '1.1rem' }}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Mobile Sidebar */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <div className="mobile-menu">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Logo size={36} />
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: '#f8fafc', border: 'none', width: 40, height: 40, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <i className="fas fa-times" style={{ fontSize: '1.1rem' }}></i>
          </button>
        </div>

        {token && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '20px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #6366f1)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 800
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>{user?.role === 'owner' ? 'Propriétaire' : 'Emprunteur'}</div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Link to="/tools" className={`mobile-link ${isActive('/tools') ? 'active' : ''}`}>
            <i className="fas fa-compass" style={{ width: 20, color: '#2563eb' }}></i>Explorer
          </Link>

          {token ? (
            <>
              {user?.is_admin && (
                <Link to="/admin" className={`mobile-link ${isActive('/admin') ? 'active' : ''}`}>
                  <i className="fas fa-shield-check" style={{ width: 20, color: '#2563eb' }}></i>Admin
                </Link>
              )}
              {!user?.is_admin && (
                <Link to="/my-tools" className={`mobile-link ${isActive('/my-tools') ? 'active' : ''}`}>
                  <i className="fas fa-toolbox" style={{ width: 20, color: '#2563eb' }}></i>Mes Outils
                </Link>
              )}
              <Link to="/bookings" className={`mobile-link ${isActive('/bookings') ? 'active' : ''}`}>
                <i className="fas fa-calendar-alt" style={{ width: 20, color: '#2563eb' }}></i>Réservations
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                state={{ tab: 'reviews', reviewType: user?.role === 'owner' ? 'as_owner' : 'as_borrower' }}
                className={`mobile-link ${location.pathname === `/profile/${user?.id}` ? 'active' : ''}`}
              >
                <i className="fas fa-star" style={{ width: 20, color: '#2563eb' }}></i>Mes Avis
              </Link>
              <Link to="/profile" className={`mobile-link ${isActive('/profile', true) ? 'active' : ''}`}>
                <i className="fas fa-user-circle" style={{ width: 20, color: '#2563eb' }}></i>Mon Profil
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '16px', padding: '0.85rem', fontWeight: 800, color: '#475569' }}>Connexion</button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', border: 'none', background: '#2563eb', borderRadius: '16px', padding: '0.85rem', fontWeight: 800, color: '#fff' }}>S'inscrire</button>
              </Link>
            </div>
          )}
        </div>

        {token && (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#fff',
              color: '#ef4444',
              padding: '0.85rem',
              borderRadius: '16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginTop: '1.5rem',
              border: '1.5px solid #fee2e2'
            }}
          >
            <i className="fas fa-power-off"></i> Déconnexion
          </button>
        )}
      </div>
    </>
  );
}