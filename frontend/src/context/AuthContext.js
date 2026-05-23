// src/context/AuthContext.js
// Remplace Redux : Context React simple pour partager user + token dans toute l'app

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupère le profil frais si token présent (utile après un refresh de page)
  useEffect(() => {
    if (token) {
      api.get('/user')
        .then((r) => {
          setUser(r.data);
          localStorage.setItem('user', JSON.stringify(r.data));
        })
        .catch(() => {
          // Token invalide ou expiré → déconnexion silencieuse
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const _saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (data) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post('/auth/register', data);
      _saveSession(res.data);
      return { success: true };
    } catch (err) {
      // Gère les erreurs de validation Laravel (422) ET les autres erreurs
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription';
      const msg = errors ? Object.values(errors).flat().join(' — ') : message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post('/auth/login', data);
      _saveSession(res.data);
      return { success: true };
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || 'Email ou mot de passe incorrect';
      const msg = errors ? Object.values(errors).flat().join(' — ') : message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const updateRole = async (newRole) => {
    setLoading(true);
    try {
      const res = await api.put('/user/role', { role: newRole });
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de rôle';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression du compte';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout, updateRole, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
