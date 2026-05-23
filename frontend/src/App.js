// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import MyToolsPage from './pages/MyToolsPage';
import BookingsPage from './pages/BookingsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';

import UserLayout from './layouts/UserLayout';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTools from './pages/admin/AdminTools';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, token } = useAuth();
  return (token && user?.is_admin)
    ? children
    : <Navigate to="/" replace />;
}

// Layout avec Navbar normale
function UserLayoutWrapper({ children }) {
  return <UserLayout>{children}</UserLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques avec Navbar normale */}
        <Route path="/" element={<UserLayoutWrapper><HomePage /></UserLayoutWrapper>} />
        <Route path="/login" element={<UserLayoutWrapper><LoginPage /></UserLayoutWrapper>} />
        <Route path="/register" element={<UserLayout><RegisterPage /></UserLayout>} />
        <Route path="/tools" element={<UserLayout><ToolsPage /></UserLayout>} />
        <Route path="/tools/:id" element={<UserLayout><ToolDetailPage /></UserLayout>} />
        <Route path="/profile/:id" element={<UserLayout><PublicProfilePage /></UserLayout>} />

        {/* Routes protégées avec Navbar normale */}
        <Route path="/my-tools" element={<UserLayout><PrivateRoute><MyToolsPage /></PrivateRoute></UserLayout>} />
        <Route path="/bookings" element={<UserLayout><PrivateRoute><BookingsPage /></PrivateRoute></UserLayout>} />
        <Route path="/messages/:bookingId" element={<UserLayout><PrivateRoute><MessagesPage /></PrivateRoute></UserLayout>} />
        <Route path="/profile" element={<UserLayout><PrivateRoute><ProfilePage /></PrivateRoute></UserLayout>} />

        {/* Routes Admin — layout séparé sans Navbar normale */}
        <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/tools" element={<AdminRoute><AdminLayout><AdminTools /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminLayout><AdminBookings /></AdminLayout></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminLayout><AdminReviews /></AdminLayout></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}