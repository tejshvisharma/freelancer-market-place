import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/spinner';
import { ROLE_REDIRECT, ROUTES } from '@/app/routes';

export function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Already logged in → send to their role-based dashboard
  if (isAuthenticated) {
    const destination =
      (user?.role && ROLE_REDIRECT[user.role]) ?? ROUTES.DASHBOARD_CLIENT;
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
