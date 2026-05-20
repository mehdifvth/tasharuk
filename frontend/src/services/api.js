// src/services/api.js
// Instance Axios centralisée — token Bearer depuis localStorage

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json'
  }
  // Ne pas forcer Content-Type ici — laisser Axios le choisir
});

// Intercepteur REQUEST : attache le token Bearer automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ne pas écraser Content-Type si déjà défini (cas FormData)
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Intercepteur RESPONSE : gestion globale 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirection seulement si pas déjà sur /login ou /register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
