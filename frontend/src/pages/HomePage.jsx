import React from 'react';
import { Link } from 'react-router-dom';
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
  { value: '500+', label: 'Outils disponibles' },
  { value: '200+', label: 'Utilisateurs actifs' },
  { value: '98%', label: 'Satisfaction' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate { animation: fadeUp 0.5s ease forwards; }
        .feature-card {
          background: #fff; border-radius: 16px;
          padding: 2rem 1.5rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .cta-primary {
          background: #2563eb; color: #fff; border: none;
          padding: 0.8rem 2rem; border-radius: 10px;
          font-weight: 700; font-size: 1rem; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .cta-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .cta-outline {
          background: #fff; color: #374151;
          border: 1.5px solid #e2e8f0;
          padding: 0.8rem 2rem; border-radius: 10px;
          font-weight: 600; font-size: 1rem; cursor: pointer;
          transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .cta-outline:hover { border-color: #2563eb; color: #2563eb; }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '5rem 1rem 4rem', textAlign: 'center' }}>
        <div className="container hero-animate">
          <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.85rem', borderRadius: 20, marginBottom: '1.25rem', letterSpacing: 0.5 }}>
            🌱 Consommation collaborative
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.5px' }}>
            Partagez vos outils,<br />
            <span style={{ color: '#2563eb' }}>économisez ensemble</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Louez ou prêtez des outils avec vos voisins. Réduisez les coûts et favorisez une consommation plus durable.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tools">
              <button className="cta-primary">
                <i className="fas fa-search"></i> Parcourir les outils
              </button>
            </Link>
            {!user && (
              <Link to="/register">
                <button className="cta-outline">
                  Rejoindre gratuitement <i className="fas fa-arrow-right"></i>
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 1rem 4rem' }}>
        <div className="container">
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', overflow: 'hidden' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '1.75rem 1rem', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, margin: '0.25rem 0 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 1rem 5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Comment ça marche ?
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Simple, rapide et sécurisé.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: f.bg, borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fas ${f.icon}`} style={{ color: f.color, fontSize: '1.1rem' }}></i>
                  </div>
                  <span style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                    {i + 1}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.4rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      {!user && (
        <section style={{ padding: '0 1rem 5rem' }}>
          <div className="container">
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 20, padding: '3rem 2rem', textAlign: 'center', color: '#fff' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Prêt à commencer ?
              </h2>
              <p style={{ opacity: 0.85, fontSize: '1rem', marginBottom: '1.75rem', maxWidth: 400, margin: '0 auto 1.75rem' }}>
                Rejoignez la communauté Tasharuk et commencez à partager dès aujourd'hui.
              </p>
              <Link to="/register">
                <button style={{ background: '#fff', color: '#2563eb', border: 'none', padding: '0.8rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.1s' }}>
                  Créer un compte gratuit
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}