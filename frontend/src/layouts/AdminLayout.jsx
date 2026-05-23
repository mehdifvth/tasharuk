// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { path: '/admin/dashboard', icon: 'fa-chart-bar', label: 'Dashboard' },
    { path: '/admin/tools', icon: 'fa-tools', label: 'Outils' },
    { path: '/admin/users', icon: 'fa-users', label: 'Utilisateurs' },
    { path: '/admin/categories', icon: 'fa-folder', label: 'Catégories' },
    { path: '/admin/bookings', icon: 'fa-calendar-alt', label: 'Réservations' },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <style>{`
        .admin-wrapper {
          display: flex;
          min-height: 100vh;
          background: #f1f5f9;
        }
        /* Sidebar */
        .admin-sidebar {
          width: 240px;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 200;
          transition: transform 0.3s;
        }
        .admin-sidebar.closed {
          transform: translateX(-240px);
        }
        .admin-content {
          margin-left: 240px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        /* Topbar */
        .admin-topbar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .admin-main {
          padding: 1.5rem;
          flex: 1;
        }
        /* Nav items */
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .admin-nav-item.active {
          background: rgba(37,99,235,0.15);
          color: #60a5fa;
          border-left: 3px solid #2563eb;
        }
        /* Overlay mobile */
        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 199;
        }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-240px); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-content { margin-left: 0; }
          .admin-overlay.show { display: block; }
          .admin-main { padding: 1rem; }
        }
      `}</style>

            <div className="admin-wrapper">
                {/* Overlay mobile */}
                <div
                    className={`admin-overlay ${sidebarOpen ? 'show' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    {/* Logo */}
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: '#2563eb', borderRadius: 8, padding: '0.4rem 0.6rem' }}>
                                <i className="fas fa-wrench" style={{ color: '#fff', fontSize: '1rem' }}></i>
                            </div>
                            <div>
                                <p style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1rem' }}>Tasharuk</p>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '0.72rem' }}>Administration</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, paddingTop: '0.75rem' }}>
                        {NAV_ITEMS.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <i className={`fas ${item.icon}`} style={{ width: 18, textAlign: 'center' }}></i>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User + Logout */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                background: '#2563eb', borderRadius: '50%', width: 36, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <i className="fas fa-user" style={{ color: '#fff', fontSize: '0.85rem' }}></i>
                            </div>
                            <div>
                                <p style={{ color: '#fff', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</p>
                                <p style={{ color: '#64748b', margin: 0, fontSize: '0.72rem' }}>Administrateur</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%', background: 'rgba(220,38,38,0.15)', color: '#f87171',
                                border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Contenu principal */}
                <div className="admin-content">
                    {/* Topbar */}
                    <div className="admin-topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Hamburger mobile */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                                    display: 'none'
                                }}
                                className="admin-hamburger"
                            >
                                <i className="fas fa-bars" style={{ fontSize: '1.1rem', color: '#374151' }}></i>
                            </button>
                            <div>
                                <h1 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>
                                    {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Admin'}
                                </h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                                background: '#dbeafe', color: '#1d4ed8', padding: '0.25rem 0.75rem',
                                borderRadius: 20, fontSize: '0.78rem', fontWeight: 700
                            }}>
                                👑 Admin
                            </span>
                        </div>
                    </div>

                    {/* Page content */}
                    <main className="admin-main">
                        {children}
                    </main>
                </div>
            </div>

            {/* Show hamburger on mobile */}
            <style>{`
        @media (max-width: 768px) {
          .admin-hamburger { display: block !important; }
        }
      `}</style>
        </>
    );
}