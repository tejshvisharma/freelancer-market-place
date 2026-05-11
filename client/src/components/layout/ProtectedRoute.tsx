import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/spinner';
import { UserRole } from '@/features/auth/types/Auth.types';
import { ROLE_REDIRECT } from '@/app/routes';

interface Props {
  allowedRoles?: UserRole[];
}
export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated ) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → their own dashboard
  // Uses your existing ROLE_REDIRECT map — no hardcoded paths
  if (allowedRoles&& user && !allowedRoles.includes(user?.role)) {
    const ownDashboard = ROLE_REDIRECT[user?.role] ?? "/login";
    return <Navigate to={ownDashboard} replace />;
  }

  // Render protected content
  return <Outlet />;
}
