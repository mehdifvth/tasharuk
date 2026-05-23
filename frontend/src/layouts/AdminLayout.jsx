// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { path: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { path: '/admin/tools', icon: 'fa-tools', label: 'Outils' },
    { path: '/admin/users', icon: 'fa-users', label: 'Utilisateurs' },
    { path: '/admin/categories', icon: 'fa-tag', label: 'Catégories' },
    { path: '/admin/bookings', icon: 'fa-calendar-alt', label: 'Réservations' },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    const currentPage = NAV_ITEMS.find(i => i.path === location.pathname);

    return (
        <>
            <style>{`
        * { box-sizing: border-box; }
        .adm-wrap { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', system-ui, sans-serif; }
        
        /* Sidebar */
        .adm-side {
          width: 250px; background: #fff;
          border-right: 1px solid #e2e8f0;
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 200; transition: transform 0.25s ease;
        }
        .adm-side.closed { transform: translateX(-250px); }

        /* Content */
        .adm-body { margin-left: 250px; flex: 1; display: flex; flex-direction: column; }

        /* Topbar */
        .adm-top {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }

        /* Main */
        .adm-main { padding: 1.5rem; flex: 1; }

        /* Nav link */
        .adm-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 1rem; margin: 0.15rem 0.75rem;
          border-radius: 8px; color: #64748b;
          text-decoration: none; font-size: 0.875rem; font-weight: 500;
          transition: all 0.15s ease;
        }
        .adm-link:hover { background: #f1f5f9; color: #0f172a; }
        .adm-link.active { background: #eef2ff; color: #6366f1; font-weight: 600; }
        .adm-link .adm-icon { width: 16px; text-align: center; }

        /* Overlay */
        .adm-ov { display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.4); z-index: 199; backdrop-filter: blur(2px); }

        /* Hamburger */
        .adm-ham { display: none; }

        @media (max-width: 768px) {
          .adm-side { transform: translateX(-250px); }
          .adm-side.open { transform: translateX(0); box-shadow: 20px 0 40px rgba(0,0,0,0.1); }
          .adm-body { margin-left: 0; }
          .adm-ov.show { display: block; }
          .adm-ham { display: flex !important; }
          .adm-main { padding: 1rem; }
        }
      `}</style>

            <div className="adm-wrap">
                {/* Overlay */}
                <div className={`adm-ov ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

                {/* Sidebar */}
                <aside className={`adm-side ${open ? 'open' : ''}`}>
                    {/* Logo */}
                    <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                background: '#6366f1', borderRadius: 10, width: 36, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <i className="fas fa-wrench" style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>Tasharuk</p>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, paddingTop: '0.5rem', overflowY: 'auto' }}>
                        <p style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                            letterSpacing: 1, padding: '0.5rem 1.75rem', margin: 0
                        }}>Menu</p>
                        {NAV_ITEMS.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`adm-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setOpen(false)}
                            >
                                <i className={`fas ${item.icon} adm-icon`}></i>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User */}
                    <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem',
                            padding: '0.6rem', background: '#f8fafc', borderRadius: 10
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', background: '#eef2ff',
                                color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.82rem', flexShrink: 0
                            }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', margin: 0,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>{user?.name}</p>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Administrateur</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} style={{
                            width: '100%', background: '#fff', color: '#64748b',
                            border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.5rem',
                            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#dc2626'; e.target.style.borderColor = '#fca5a5'; }}
                            onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#64748b'; e.target.style.borderColor = '#e2e8f0'; }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="adm-body">
                    {/* Topbar */}
                    <div className="adm-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="adm-ham"
                                onClick={() => setOpen(!open)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    padding: '0.4rem', borderRadius: 6, color: '#374151'
                                }}
                            >
                                <i className="fas fa-bars" style={{ fontSize: '1rem' }}></i>
                            </button>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                                    {currentPage?.label || 'Admin'}
                                </h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                                background: '#eef2ff', color: '#6366f1', padding: '0.25rem 0.75rem',
                                borderRadius: 20, fontSize: '0.75rem', fontWeight: 700
                            }}>
                                ✦ Admin
                            </span>
                        </div>
                    </div>

                    {/* Page */}
                    <main className="adm-main">{children}</main>
                </div>
            </div>
        </>
    );
}