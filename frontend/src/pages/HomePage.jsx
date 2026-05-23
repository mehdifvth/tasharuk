// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        <i className="fas fa-wrench me-3 text-primary"></i>Bienvenue sur <span style={{ color: '#2563eb' }}>Tasharuk</span>
      </h1>
      <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: 560, margin: '0 auto 2rem' }}>
        Partagez, prêtez et louez des outils avec vos voisins.
        Réduisez les coûts et favorisez une consommation durable.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/tools">
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            Parcourir les outils
          </button>
        </Link>
        {!user && (
          <Link to="/register">
            <button className="btn-outline" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Rejoindre maintenant
            </button>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1.5rem', marginTop: '4rem' }}>
        {[
          { icon: <i className="fas fa-box text-primary"></i>, title: 'Publiez vos outils',   desc: 'Gagnez en partageant ce que vous n\'utilisez pas' },
          { icon: <i className="fas fa-search text-primary"></i>, title: 'Trouvez ce qu\'il vous faut', desc: 'Recherchez par catégorie ou mot-clé' },
          { icon: <i className="fas fa-comments text-primary"></i>, title: 'Discutez et confirmez', desc: 'Échangez avec le propriétaire via le chat intégré' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{f.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
