// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* AuthProvider remplace le Redux Provider — toute l'app a accès à user/token */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
