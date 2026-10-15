import { Navigate, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';

// Register is the default landing page.
export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}
