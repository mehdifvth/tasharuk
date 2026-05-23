import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const LABEL = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' };

const INPUT_STYLE = {
  width: '100%', padding: '0.6rem 0.85rem', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: '0.88rem', color: '#374151',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  background: '#fff',
};

export default function ToolForm({ initial = null, onSubmit, loading }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category_id: '',
    condition: 'good', price: '', image: null,
  });

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        category_id: initial.category_id ? String(initial.category_id) : '',
        condition: initial.condition || 'good',
        price: initial.price !== undefined ? String(initial.price) : '',
        image: null,
      });
    }
  }, [initial]);

  const handleChange = e => {
    const { name, files, value } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category_id', form.category_id);
    fd.append('condition', form.condition);
    fd.append('price', parseFloat(form.price).toFixed(2));
    if (form.image) fd.append('image', form.image);
    onSubmit(fd);
  };

  const fields = [
    { name: 'title', label: 'Titre *', type: 'input', placeholder: 'Ex: Perceuse Bosch...' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Décrivez l\'état et les accessoires...' },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <style>{`.tool-form-input:focus { border-color: #2563eb !important; }`}</style>

      {fields.map(f => (
        <div key={f.name}>
          <label style={LABEL}>{f.label}</label>
          {f.type === 'textarea'
            ? <textarea name={f.name} value={form[f.name]} onChange={handleChange} rows={3} placeholder={f.placeholder} className="tool-form-input" style={{ ...INPUT_STYLE, resize: 'vertical' }} />
            : <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required={f.name === 'title'} className="tool-form-input" style={INPUT_STYLE} />
          }
        </div>
      ))}

      <div>
        <label style={LABEL}>Catégorie *</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} required className="tool-form-input" style={INPUT_STYLE}>
          <option value="">-- Choisir une catégorie --</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label style={LABEL}>État *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {[
            { value: 'new', label: 'Neuf', color: '#16a34a', bg: '#dcfce7' },
            { value: 'good', label: 'Bon état', color: '#d97706', bg: '#fef9c3' },
            { value: 'fair', label: 'Correct', color: '#dc2626', bg: '#fee2e2' },
          ].map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem', borderRadius: 10, border: `2px solid ${form.condition === opt.value ? opt.color : '#e2e8f0'}`, background: form.condition === opt.value ? opt.bg : '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: form.condition === opt.value ? opt.color : '#64748b', transition: 'all 0.15s' }}>
              <input type="radio" name="condition" value={opt.value} checked={form.condition === opt.value} onChange={handleChange} style={{ display: 'none' }} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label style={LABEL}>Prix par heure (MAD) *</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>MAD</span>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="0 = Gratuit" className="tool-form-input" style={{ ...INPUT_STYLE, paddingLeft: '3rem' }} />
        </div>
      </div>

      <div>
        <label style={LABEL}>Photo {initial ? '(laisser vide pour garder l\'actuelle)' : '(optionnel)'}</label>
        <div style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: '1.25rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} style={{ display: 'none' }} id="tool-image-input" />
          <label htmlFor="tool-image-input" style={{ cursor: 'pointer' }}>
            {form.image ? (
              <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.88rem' }}>
                <i className="fas fa-check-circle me-1"></i>{form.image.name}
              </span>
            ) : initial?.image_url ? (
              <div>
                <img src={initial.image_url} alt="actuelle" style={{ height: 60, borderRadius: 8, objectFit: 'cover', marginBottom: '0.5rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Cliquer pour changer</p>
              </div>
            ) : (
              <div>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '0.4rem', display: 'block' }}></i>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Cliquer pour uploader une photo</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        {loading ? <><i className="fas fa-spinner fa-spin"></i> Enregistrement...</> : initial ? 'Mettre à jour' : 'Ajouter l\'outil'}
      </button>
    </form>
  );
}