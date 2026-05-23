// src/layouts/UserLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/common/NotificationBell';
import Logo from '../components/common/Logo';

export default function UserLayout({ children }) {
    const { user, token, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => { setOpen(false); }, [location.pathname]);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    const NAV = [
        { path: '/', icon: 'fa-house', label: 'Accueil', always: true },
        { path: '/tools', icon: 'fa-magnifying-glass', label: 'Explorer', always: true },
        { path: '/bookings', icon: 'fa-calendar-check', label: 'Réservations', auth: true },
        { path: '/my-tools', icon: 'fa-toolbox', label: 'Mes Outils', owner: true },
        { path: '/profile', icon: 'fa-circle-user', label: 'Profil', auth: true },
    ];

    const visible = NAV.filter(n => {
        if (n.owner && user?.role !== 'owner') return false;
        if (n.auth && !token) return false;
        return true;
    });

    return (
        <>
            <style>{`
        .ul-wrap { display: flex; min-height: 100vh; background: #f8fafc; }

        .ul-side {
          width: 260px;
          background: #fff;
          border-right: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 200;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ul-body {
          margin-left: 260px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }

        .ul-top {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding: 0.75rem clamp(1rem, 4vw, 2rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .ul-main { 
          padding: clamp(1rem, 4vw, 2.5rem); 
          flex: 1; 
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .ul-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.8rem 1rem;
          margin: 0.2rem 1rem;
          border-radius: 12px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .ul-link:hover { background: #f1f5f9; color: #0f172a; }
        .ul-link.active {
          background: #eff6ff;
          color: #2563eb;
        }

        .ul-ov {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          z-index: 199;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }

        @media (max-width: 1024px) {
          .ul-side { transform: translateX(-100%); }
          .ul-side.open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.1); }
          .ul-body { margin-left: 0; }
          .ul-ov.show { display: block; }
          .ul-ham { display: flex !important; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

            <div className="ul-wrap">
                <div className={`ul-ov ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

                <aside className={`ul-side ${open ? 'open' : ''}`}>
                    <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem' }}>
                        <Logo size={40} />
                    </div>

                    <nav style={{ flex: 1, overflowY: 'auto' }}>
                        {visible.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`ul-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <i className={`fas ${item.icon}`} style={{ width: 20, textAlign: 'center', fontSize: '1.1rem' }}></i>
                                {item.label}
                            </Link>
                        ))}

                        {user?.is_admin && (
                            <Link to="/admin" className="ul-link" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                <i className="fas fa-shield-halved" style={{ width: 20, textAlign: 'center', color: '#6366f1' }}></i>
                                Dashboard Admin
                            </Link>
                        )}
                    </nav>

                    <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                        {token ? (
                            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{user?.role === 'owner' ? 'Propriétaire' : 'Emprunteur'}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} style={{ width: '100%', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.6rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700 }}>
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <Link to="/login" className="btn-auth-login" style={{ textAlign: 'center', border: '1.5px solid #e2e8f0' }}>Connexion</Link>
                                <Link to="/register" className="btn-auth-register" style={{ textAlign: 'center' }}>S'inscrire</Link>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="ul-body">
                    <header className="ul-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                className="ul-ham"
                                onClick={() => setOpen(true)}
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: 40, height: 40, borderRadius: 10, display: 'none', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <i className="fas fa-bars-staggered"></i>
                            </button>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 800 }}>{visible.find(n => isActive(n.path))?.label || 'Tasharuk'}</h4>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {token && <NotificationBell />}
                        </div>
                    </header>

                    <main className="ul-main animate-fade">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
