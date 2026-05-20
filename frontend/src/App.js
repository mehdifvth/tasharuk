// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar          from './components/common/Navbar';
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import ToolsPage       from './pages/ToolsPage';
import ToolDetailPage  from './pages/ToolDetailPage';
import MyToolsPage     from './pages/MyToolsPage';
import BookingsPage    from './pages/BookingsPage';
import MessagesPage    from './pages/MessagesPage';
import AdminDashboard   from './pages/AdminDashboard';

// Composant de protection de route — redirige vers /login si pas connecté
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// Protection Admin
function AdminRoute({ children }) {
  const { user, token } = useAuth();
  return (token && user?.is_admin) ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/"           element={<HomePage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/tools"      element={<ToolsPage />} />
          <Route path="/tools/:id"  element={<ToolDetailPage />} />

          {/* Routes protégées (token requis) */}
          <Route path="/my-tools"  element={<PrivateRoute><MyToolsPage /></PrivateRoute>} />
          <Route path="/bookings"  element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
          <Route path="/messages/:bookingId" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/admin"     element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
