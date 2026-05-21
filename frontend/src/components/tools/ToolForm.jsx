// src/components/tools/ToolForm.jsx
// FIX: pré-remplit correctement category_id et condition depuis l'objet 'initial'

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ToolForm({ initial = null, onSubmit, loading }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title:       '',
    description: '',
    category_id: '',
    condition:   'good',
    price:       '',
    image:       null,
  });

  useEffect(() => {
    // Charger les catégories
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    // Pré-remplir le formulaire si mode édition
    if (initial) {
      setForm({
        title:       initial.title       || '',
        description: initial.description || '',
        category_id: initial.category_id ? String(initial.category_id) : '',
        condition:   initial.condition   || 'good',
        price:       initial.price       !== undefined ? String(initial.price) : '',
        image:       null, // on ne re-envoie pas l'image si pas modifiée
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title',       form.title);
    fd.append('description', form.description);
    fd.append('category_id', form.category_id);
    fd.append('condition',   form.condition);
    fd.append('price', parseFloat(form.price).toFixed(2));
    if (form.image) {
      fd.append('image', form.image);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      <div>
        <label style={label}>Titre *</label>
        <input
          name="title" value={form.title} onChange={handleChange}
          required placeholder="Ex: Perceuse électrique Bosch..."
        />
      </div>

      <div>
        <label style={label}>Description</label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          rows={3} placeholder="Décrivez l'état et les accessoires inclus..."
        />
      </div>

      <div>
        <label style={label}>Catégorie *</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} required>
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={label}>État *</label>
        <select name="condition" value={form.condition} onChange={handleChange}>
          <option value="new">Neuf</option>
          <option value="good">Bon état</option>
          <option value="fair">Correct</option>
        </select>
      </div>

      <div>
        <label style={label}>Prix par jour (MAD) *</label>
        <input
          name="price" type="number" min="0" step="0.01"
          value={form.price} onChange={handleChange}
          required placeholder="0 = Gratuit"
        />
      </div>

      <div>
        <label style={label}>
          Photo {initial ? '(laisser vide pour garder l\'actuelle)' : '(optionnel)'}
        </label>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} />
        {initial?.image_url && !form.image && (
          <img src={initial.image_url} alt="actuelle" style={{ marginTop: 6, height: 60, borderRadius: 4, objectFit: 'cover' }} />
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading
          ? 'Enregistrement...'
          : initial ? 'Mettre à jour l\'outil' : 'Ajouter l\'outil'
        }
      </button>
    </form>
  );
}

const label = {
  display: 'block', fontSize: '0.88rem',
  fontWeight: 600, marginBottom: '0.3rem', color: '#374151',
};
