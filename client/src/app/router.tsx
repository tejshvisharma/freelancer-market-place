
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './routes';
// Eager load only what's needed before auth check
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Simple spinner for Suspense fallback
import { PageLoader } from '@/components/ui/PageLoader';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';

// Lazy loaded Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const VerifyEmailPromptPage = lazy(() => import('@/features/auth/pages/VerifyEmailPromptPage'));
const ResendVerificationEmailPage = lazy(() => import('@/features/auth/pages/ResendVerificationEmailPage'));
const TwoFactorEnablePage = lazy(() => import('@/features/auth/pages/TwoFactorEnablePage'));
const TwoFactorPage = lazy(() => import('@/features/auth/pages/TwoFactorPage'));

// Lazy loaded Dashboard Pages
const ClientDashboard = lazy(() => import('@/pages/dashboard/ClientDashboard'));
const FreelancerDashboard = lazy(() => import('@/pages/dashboard/FreelancerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));


/**
 * Application routing configuration using React Router v6
 * - Public routes: /login, /register
 * - Protected routes: /projects, /projects/:projectId (wrapped in ProtectedRoute)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
            <LoginPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.VERIFY_PENDING,
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPromptPage />
      </Suspense>
    ),
  },
  { 
    path: ROUTES.GOOGLE_CALLBACK,
    element: <GoogleCallbackPage /> },
  {
    path: ROUTES.RESEND_VERIFICATION,
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResendVerificationEmailPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.TWO_FACTOR,
    element: (
      <Suspense fallback={<PageLoader />}>
        <TwoFactorPage />
      </Suspense>
    ),
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD_CLIENT,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ClientDashboard />
              </Suspense>
            ),
          },
          {
            path: ROUTES.DASHBOARD_FREELANCER,
            element: (
              <Suspense fallback={<PageLoader />}>
                <FreelancerDashboard />
              </Suspense>
            ),
          },
          {
            path: ROUTES.DASHBOARD_ADMIN,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: ROUTES.PROFILE_PAGE,
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.TWO_FACTOR_SETUP,
            element: (
              <Suspense fallback={<PageLoader />}>
                <TwoFactorEnablePage />
              </Suspense>
            ),
          }
        ],
      },
    ],
  },
]);
