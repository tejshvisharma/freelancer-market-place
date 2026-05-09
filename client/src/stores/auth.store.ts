import { create } from 'zustand';

import { apiClient } from '@/lib/axios';

import { AuthUser } from "../features/auth/types/Auth.types";
import { authApi } from '@/features/auth/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  checkAuth: () => Promise<void>;
}

interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
}

const fetchProfile = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
  return response.data.data.user;
};

/**
 * Zustand store for authentication state management
 * - Uses HTTP-only cookies for authentication (no tokens in localStorage)
 * - checkAuth() should be called on app startup to restore auth state from backend session
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as loading until checkAuth completes

    setUser: (user: AuthUser) => {
        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    clearUser: () => {
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    checkAuth: async () => {
        try {
            const user = await fetchProfile();

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },
}));
