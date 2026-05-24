// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: 'fa-box-open',
    color: '#2563eb', bg: '#dbeafe',
    title: 'Publiez vos outils',
    desc: 'Mettez en location ce que vous n\'utilisez pas et générez des revenus facilement.',
  },
  {
    icon: 'fa-search',
    color: '#7c3aed', bg: '#ede9fe',
    title: 'Trouvez ce qu\'il vous faut',
    desc: 'Parcourez des centaines d\'outils disponibles près de chez vous.',
  },
  {
    icon: 'fa-comments',
    color: '#059669', bg: '#d1fae5',
    title: 'Discutez et confirmez',
    desc: 'Échangez directement avec le propriétaire via le chat intégré.',
  },
];

const STATS = [
  { value: '500+', label: 'Outils',   icon: 'fa-tools',   color: '#2563eb', bg: '#dbeafe' },
  { value: '200+', label: 'Voisins',  icon: 'fa-users',   color: '#7c3aed', bg: '#ede9fe' },
  { value: '98%',  label: 'Confiance',icon: 'fa-shield-alt', color: '#059669', bg: '#d1fae5' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (user?.is_admin) navigate('/admin/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        .home-hero { padding: 3rem 0 2rem; }
        .home-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #eef2ff; color: #4f46e5;
          font-size: 0.75rem; font-weight: 800;
          padding: 0.4rem 1rem; border-radius: 30px;
          margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px;
        }
        .home-title {
          font-size: clamp(1.75rem, 5vw, 2.75rem);
          font-weight: 900; color: #0f172a;
          line-height: 1.15; letter-spacing: -0.5px;
          margin: 0 0 1.25rem;
        }
        .home-title span { color: #2563eb; }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 2rem 0;
        }
        .stat-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          padding: 1.25rem;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-top: 2rem;
        }
        .feature-card {
          background: #fff;
          border-radius: 20px;
          padding: 1.75rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: #e0e7ff;
        }
        .cta-block {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          border-radius: 24px;
          padding: 3rem 2rem;
          text-align: center;
          margin-top: 3rem;
          box-shadow: 0 12px 40px rgba(37,99,235,0.2);
        }
        .btn-hero-primary {
          background: #2563eb; color: #fff; border: none;
          border-radius: 12px; padding: 0.85rem 2rem;
          font-weight: 700; font-size: 0.95rem;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.15s; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .btn-hero-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .btn-hero-outline {
          background: #fff; color: #374151;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          padding: 0.85rem 2rem; font-weight: 700;
          font-size: 0.95rem; cursor: pointer;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.15s;
        }
        .btn-hero-outline:hover { border-color: #2563eb; color: #2563eb; }
        .btn-cta {
          background: #fff; color: #2563eb; border: none;
          border-radius: 12px; padding: 0.85rem 2.5rem;
          font-weight: 800; font-size: 0.95rem;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.15s;
        }
        .btn-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="container" style={{ maxWidth: 900, paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Hero */}
        <div className="home-hero" style={{ textAlign: 'center' }}>
          <div className="home-badge">
            <i className="fas fa-leaf"></i> Partage local & solidaire
          </div>
          <h1 className="home-title">
            Partagez vos outils,<br />
            <span>économisez ensemble</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.65 }}>
            Louez ou prêtez des outils à vos voisins. Simple, sécurisé et respectueux de la planète.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tools" className="btn-hero-primary">
              <i className="fas fa-search"></i> Parcourir les outils
            </Link>
            {!user && (
              <Link to="/register" className="btn-hero-outline">
                S'inscrire gratuitement
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '1.1rem' }}></i>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, margin: '0.2rem 0 0', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Section titre */}
        <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '0.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
            Simple et sécurisé
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Comment Tasharuk facilite vos projets au quotidien.
          </p>
        </div>

        {/* Features */}
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ background: f.bg, borderRadius: 14, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${f.icon}`} style={{ color: f.color, fontSize: '1.3rem' }}></i>
                </div>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', letterSpacing: -1 }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', margin: '0 0 0.6rem' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!user && (
          <div className="cta-block">
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.75rem' }}>
              Prêt à rejoindre l'aventure ?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: '0 auto 2rem', maxWidth: 420 }}>
              Créez votre compte en quelques secondes et commencez à économiser.
            </p>
            <Link to="/register" className="btn-cta">
              <i className="fas fa-rocket"></i> Commencer maintenant
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}