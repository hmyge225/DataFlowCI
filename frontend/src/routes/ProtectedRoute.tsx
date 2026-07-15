import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import ConcentricLoader from '../shared/components/feedback/ConcentricLoader';
import { ROLE_ROUTES, type Role } from '../config/dashConfig';

interface ProtectedRouteProps {
  allowedRole?: Role;
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  if (isLoading && !user) return <ConcentricLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    // Rôle insuffisant : on renvoie l'utilisateur vers son propre dashboard.
    const fallback = ROLE_ROUTES[user.role as Role] ?? '/login';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
