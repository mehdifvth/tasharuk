// src/components/tools/ToolCard.jsx
import React from 'react';

const CONDITION_LABEL = { 
  new:  <span><i className="fas fa-circle text-success small me-1"></i> Neuf</span>, 
  good: <span><i className="fas fa-circle text-warning small me-1"></i> Bon</span>, 
  fair: <span><i className="fas fa-circle text-danger small me-1"></i> Correct</span> 
};

export default function ToolCard({ tool, onClick }) {
  return (
    <div className="card" style={styles.card} onClick={onClick}>
      {tool.image_url
        ? <img src={tool.image_url} alt={tool.title} style={styles.img} />
        : <div style={styles.placeholder}><i className="fas fa-wrench"></i></div>
      }
      <div style={styles.body}>
        <h3 style={styles.title}>{tool.title}</h3>
        <p style={styles.meta}>
          <i className="fas fa-folder me-1"></i> {tool.category?.name} &nbsp;·&nbsp; {CONDITION_LABEL[tool.condition]}
        </p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {tool.price > 0 ? `${tool.price} MAD/jour` : <span><i className="fas fa-gift me-1"></i> Gratuit</span>}
          </span>
          <span style={styles.owner}><i className="fas fa-user me-1"></i> {tool.user?.name}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card:        { cursor: 'pointer', padding: 0, overflow: 'hidden', transition: 'box-shadow 0.2s',
                 ':hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } },
  img:         { width: '100%', height: 160, objectFit: 'cover' },
  placeholder: { height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: '3rem', background: '#f1f5f9' },
  body:        { padding: '1rem' },
  title:       { fontWeight: 700, marginBottom: '0.3rem', fontSize: '1rem' },
  meta:        { color: '#64748b', fontSize: '0.82rem', marginBottom: '0.6rem' },
  footer:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price:       { fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' },
  owner:       { color: '#94a3b8', fontSize: '0.8rem' },
};
