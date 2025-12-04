import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MovieList from './pages/MovieList';
import MovieUpload from './pages/MovieUpload';
import ClientHome from './pages/ClientHome';
import { getCurrentUser } from './services/api';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Client Route */}
        <Route path="/" element={<ClientHome />} />
        
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
           <Route path="" element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="movies" element={<MovieList />} />
           <Route path="upload" element={<MovieUpload />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;