import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDeniedPage from '../pages/AccessDeniedPage';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

// Layout route guard:
//  - not logged in            -> redirect to /login (remembering where they were)
//  - logged in, needs admin   -> Access denied page
//  - otherwise                -> render the nested routes
export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
}
