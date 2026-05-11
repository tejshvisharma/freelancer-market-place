import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth.store';
import { Toaster } from 'react-hot-toast';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component
 * - Wraps the app with QueryClientProvider for React Query
 * - Initializes auth state by calling checkAuth on mount
 */
export function AppProviders({ children }: AppProvidersProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Check authentication status on app initialization
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
