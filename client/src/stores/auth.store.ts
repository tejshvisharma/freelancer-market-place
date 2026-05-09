import { create } from 'zustand';

import { apiClient } from '@/lib/axios';

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: {
        url: string;
        localPath?: string;
    };
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: UserProfile) => void;
    clearUser: () => void;
    checkAuth: () => Promise<void>;
}

interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
}

interface UserResponseEnvelope {
    user: UserProfile;
}

const extractUser = (data: UserProfile | UserResponseEnvelope): UserProfile => {
    if (typeof data === 'object' && data !== null && 'user' in data) {
        return data.user;
    }
    return data;
};

const fetchProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserResponseEnvelope | UserProfile>>('/auth/profile');
    return extractUser(response.data.data);
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

    setUser: (user: UserProfile) => {
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
