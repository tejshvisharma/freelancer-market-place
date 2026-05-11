/**
 * useLogout — for AppLayout Sidebar / any logout trigger
 *
 * POST /auth/logout
 *
 * - Clears Zustand store
 * - Wipes entire QueryClient cache (prevents stale user data leaking)
 * - Navigates to /login
 * - Fire-and-forget: even if the API call fails, local state is cleared
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { ROUTES } from "../../../app/routes";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSettled: () => {
      // Always clear local state regardless of server response
      clearAuth();
      queryClient.clear(); // wipe all cached queries
      toast.success("You have been signed out.");
      navigate(ROUTES.LOGIN, { replace: true });
    },

    onError: () => {
      // Silent — already cleared locally in onSettled
      toast.error(
        "Logout failed on server, but you have been signed out locally.",
      );
    },
  });
};
