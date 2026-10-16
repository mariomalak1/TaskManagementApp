import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { setUnauthorizedHandler } from './api/client';

export default function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // On an expired/invalid token (API 401), log out and redirect to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login?expired=1', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
