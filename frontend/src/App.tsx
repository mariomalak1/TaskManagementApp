import { Navigate, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
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
