
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Eager load only what's needed before auth check
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Simple spinner for Suspense fallback
import { PageLoader } from '@/components/ui/PageLoader';

// Lazy loaded Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const ResendVerificationEmailPage = lazy(() => import('@/features/auth/pages/ResendVerificationEmailPage'));



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
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/resend-verification-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResendVerificationEmailPage />
      </Suspense>
    ),
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: '/forgot-password',
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
            path: '/dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <dashboard />
              </Suspense>
            ),
        }
        ],
      },
    ],
  },
]);
