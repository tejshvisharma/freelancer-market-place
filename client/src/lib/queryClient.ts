import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: (failureCount, error: any) => {
                // Don't retry on 401 errors (handled by axios interceptor)
                if (error?.response?.status === 401) {
                    return false;
                }
                // Retry up to 2 times for other errors
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
});
