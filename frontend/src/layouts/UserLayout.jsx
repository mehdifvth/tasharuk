// src/layouts/UserLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/common/NotificationBell';
import Logo from '../components/common/Logo';

export default function UserLayout({ children }) {
    const { user, token, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const NAV = [
        { path: '/', icon: 'fa-home', label: 'Accueil', always: true },
        { path: '/tools', icon: 'fa-search', label: 'Parcourir', always: true },
        { path: '/bookings', icon: 'fa-calendar-alt', label: 'Réservations', auth: true },
        { path: '/my-tools', icon: 'fa-tools', label: 'Mes Outils', owner: true },
        { path: '/profile', icon: 'fa-user', label: 'Profil', auth: true },
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
          width: 250px;
          background: #fff;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 200;
          transition: transform 0.25s ease;
          box-shadow: 0 0 40px rgba(0,0,0,0.03);
        }

        .ul-body {
          margin-left: 250px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .ul-top {
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .ul-main { padding: 1.5rem; flex: 1; }

        .ul-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          margin: 0.1rem 0.75rem;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s ease;
          position: relative;
        }
        .ul-link:hover { background: #f8fafc; color: #0f172a; }
        .ul-link.active {
          background: linear-gradient(135deg, #eff6ff, #eef2ff);
          color: #2563eb;
          font-weight: 700;
        }
        .ul-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: linear-gradient(180deg, #2563eb, #6366f1);
          border-radius: 0 4px 4px 0;
        }
        .ul-icon { width: 16px; text-align: center; }

        .ul-ov {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.35);
          z-index: 199;
          backdrop-filter: blur(2px);
        }
        .ul-ham { display: none; }

        @media (max-width: 768px) {
          .ul-side { transform: translateX(-250px); }
          .ul-side.open { transform: translateX(0); box-shadow: 20px 0 40px rgba(0,0,0,0.1); }
          .ul-body { margin-left: 0; }
          .ul-ov.show { display: block; }
          .ul-ham { display: flex !important; }
          .ul-main { padding: 1rem; }
        }
      `}</style>

            <div className="ul-wrap">
                {/* Overlay */}
                <div className={`ul-ov ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

                {/* Sidebar */}
                <aside className={`ul-side ${open ? 'open' : ''}`}>
                    {/* Logo */}
                    <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f8fafc' }}>
                        <Link to="/" onClick={() => setOpen(false)}>
                            <Logo size={36} />
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, paddingTop: '0.75rem', overflowY: 'auto' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 1, padding: '0.5rem 1.75rem', margin: 0 }}>
                            Navigation
                        </p>
                        {visible.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`ul-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setOpen(false)}
                            >
                                <i className={`fas ${item.icon} ul-icon`}
                                    style={{ color: isActive(item.path) ? '#2563eb' : '#94a3b8' }}
                                ></i>
                                {item.label}
                            </Link>
                        ))}

                        {/* Admin link */}
                        {user?.is_admin && (
                            <>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 1, padding: '1rem 1.75rem 0.5rem', margin: 0 }}>
                                    Administration
                                </p>
                                <Link
                                    to="/admin/dashboard"
                                    className={`ul-link ${isActive('/admin') ? 'active' : ''}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <i className="fas fa-shield-alt ul-icon" style={{ color: '#6366f1' }}></i>
                                    Admin Panel
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* User bottom */}
                    {token ? (
                        <div style={{ padding: '1rem', borderTop: '1px solid #f8fafc' }}>
                            <Link
                                to="/profile"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.75rem', borderRadius: 10, background: '#f8fafc', textDecoration: 'none', marginBottom: '0.5rem', transition: 'background 0.15s' }}
                                onClick={() => setOpen(false)}
                            >
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                                        {user?.is_admin ? 'Admin' : user?.role === 'owner' ? 'Propriétaire' : 'Emprunteur'}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ width: '100%', background: '#fff', color: '#64748b', border: '1px solid #f1f5f9', borderRadius: 8, padding: '0.45rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                            >
                                <i className="fas fa-sign-out-alt"></i> Déconnexion
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '1rem', borderTop: '1px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/login" onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0', color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                                Connexion
                            </Link>
                            <Link to="/register" onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '0.5rem', borderRadius: 8, background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                                S'inscrire
                            </Link>
                        </div>
                    )}
                </aside>

                {/* Main */}
                <div className="ul-body">
                    {/* Topbar */}
                    <div className="ul-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="ul-ham"
                                onClick={() => setOpen(!open)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: 8, color: '#374151', display: 'none' }}
                            >
                                <i className="fas fa-bars" style={{ fontSize: '1rem' }}></i>
                            </button>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>
                                    {visible.find(n => isActive(n.path))?.label || 'Tasharuk'}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {token && <NotificationBell />}
                            {!token && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to="/login" style={{ padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid #e2e8f0', color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                                        Connexion
                                    </Link>
                                    <Link to="/register" style={{ padding: '0.4rem 0.9rem', borderRadius: 8, background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem' }}>
                                        S'inscrire
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <main className="ul-main">{children}</main>
                </div>
            </div>
        </>
    );
}