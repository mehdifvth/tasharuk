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
  { value: '500+', label: 'Outils' },
  { value: '200+', label: 'Voisins' },
  { value: '98%', label: 'Confiance' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        .hero-section {
          padding: clamp(3rem, 10vw, 6rem) 0 clamp(2rem, 8vw, 4rem);
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .stat-item { border-right: none !important; border-bottom: 1px solid #f1f5f9; }
          .stat-item:last-child { border-bottom: none; }
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: #fff;
          border-radius: 24px;
          padding: 2rem;
          border: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          border-color: #2563eb;
        }
      `}</style>

      {/* Hero */}
      <section className="hero-section">
        <div className="container animate-up">
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#eef2ff', color: '#2563eb', 
            fontSize: '0.85rem', fontWeight: 800, 
            padding: '0.5rem 1rem', borderRadius: 30, 
            marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: 1
          }}>
            <i className="fas fa-sparkles"></i> Partage local & solidaire
          </span>
          <h1 style={{ marginBottom: '1.5rem' }}>
            Partagez vos outils,<br />
            <span style={{ color: '#2563eb' }}>économisez ensemble</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.2rem)', 
            color: '#64748b', maxWidth: 600, 
            margin: '0 auto 3rem', lineHeight: 1.6,
            padding: '0 1rem'
          }}>
            Louez ou prêtez des outils à vos voisins. Une solution simple pour vos travaux tout en respectant la planète.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0 1rem' }}>
            <Link to="/tools" style={{ width: '100%', maxWidth: 240 }}>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                <i className="fas fa-search"></i> Parcourir le catalogue
              </button>
            </Link>
            {!user && (
              <Link to="/register" style={{ width: '100%', maxWidth: 240 }}>
                <button className="btn-outline" style={{ width: '100%', padding: '1rem' }}>
                  S'inscrire gratuitement
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ paddingBottom: '4rem' }}>
        <div className="container animate-up" style={{ animationDelay: '0.1s' }}>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className="stat-item" style={{ padding: '2rem 1rem', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -1 }}>{s.value}</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2rem 0 6rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-up">
            <h2 style={{ marginBottom: '1rem' }}>Simple et sécurisé</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Comment Tasharuk facilite vos projets au quotidien.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card animate-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ background: f.bg, borderRadius: 16, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas ${f.icon}`} style={{ color: f.color, fontSize: '1.5rem' }}></i>
                  </div>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f1f5f9' }}>0{i + 1}</span>
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section style={{ paddingBottom: '6rem' }}>
          <div className="container animate-up">
            <div style={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #1e4ed8 100%)', 
              borderRadius: 32, padding: 'clamp(2rem, 8vw, 4rem) 2rem', 
              textAlign: 'center', color: '#fff',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)'
            }}>
              <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Prêt à rejoindre l'aventure ?</h2>
              <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem' }}>
                Créez votre compte en quelques secondes et commencez à économiser.
              </p>
              <Link to="/register">
                <button className="btn-primary" style={{ background: '#fff', color: '#2563eb', padding: '1rem 2.5rem' }}>
                  Commencer maintenant
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
