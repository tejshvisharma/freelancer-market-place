// /lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";




/* ────────────────────────────────────────────────────────────────
   🌐 API CLIENTS
   ──────────────────────────────────────────────────────────────── */

// Main API client WITH interceptors (for protected routes)
export const apiClient = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Minimal client WITHOUT interceptors (for auth hydration only)
export const authHydrationClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


let isRefreshing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, tokenRefreshed = false) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(tokenRefreshed);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & {
            _retry?: boolean;
        }) | undefined;

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthRoute =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/forgot-password") ||
            originalRequest.url?.includes("/auth/reset-password");

        if (isAuthRoute) {
            return Promise.reject(error);
        }

        // Prevent retrying refresh endpoint itself
        if (originalRequest.url?.includes("/auth/refresh-token")) {
            if (useAuthStore.getState().isAuthenticated) {
                useAuthStore.getState().clearUser();
            }
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            useAuthStore.getState().clearUser();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: () => resolve(apiClient(originalRequest)),
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            await authHydrationClient.post("/auth/refresh-token");
            processQueue(null, true);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, false);
            useAuthStore.getState().clearUser();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);