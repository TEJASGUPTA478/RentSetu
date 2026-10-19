import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

/**
 * Wraps a group of routes to require authentication.
 * Redirects to /login if not authenticated.
 * Optionally restricts to specific roles (pass an array).
 * Renders <Outlet /> for nested routes when authorized.
 */
export default function ProtectedRoute({ roles }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles specified, check membership
  if (roles && roles.length > 0 && !roles.includes(currentUser.role)) {
    const fallback =
      currentUser.role === 'tenant' ? '/tenant/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
