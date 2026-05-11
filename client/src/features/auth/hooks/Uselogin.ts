/**
 * useLogin — for LoginPage
 *
 * POST /auth/login
 *
 * Handles two response shapes:
 *   A) Normal login  → { user, accessToken }
 *      - Hydrates Zustand store
 *      - Navigates to role-based dashboard
 *
 *   B) 2FA required  → { requires2FA: true, twoFactorToken }
 *      - Does NOT touch auth store (user not yet verified)
 *      - Navigates to /2fa with twoFactorToken in location state
 *
 * On 403: email not yet verified → navigate to /verify-pending
 * On 422: push field errors to form
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { ROUTES, ROLE_REDIRECT } from "@/app/routes";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import type { LoginInput } from "../schemas/auth.schema";

interface UseLoginOptions {
  setError: UseFormSetError<LoginInput>;
}

export const useLogin = ({ setError }: UseLoginOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),

    onSuccess: (res) => {
      const payload = res.data.data;
      if (!payload) return;

      // ── Branch A: 2FA required ──────────────────────────────────────────
      if ("requires2FA" in payload && payload.requires2FA) {
        navigate(ROUTES.TWO_FACTOR, {
          state: { twoFactorToken: payload.twoFactorToken },
          replace: true,
        });
        return;
      }

      // ── Branch B: Normal login ──────────────────────────────────────────
      if ("user" in payload) {
        setAuth(payload.user);

        // Pre-populate the /me query cache so the first protected page
        // doesn't fire an extra network request
        queryClient.setQueryData(queryKeys.auth.me, res);

        toast.success(`Welcome back, ${payload.user.name}!`);
        navigate("/dashboard", { replace: true });
      }
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      // 403 → email not verified
      if (status === 403) {
        toast.error("Please verify your email before logging in.");
        navigate(ROUTES.VERIFY_PENDING, { replace: true });
        return;
      }

      // 422 field errors
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof LoginInput, { message });
        });
        return;
      }

      // 401 wrong credentials or generic
      toast.error(getErrorMessage(error));
    },
  });
};
