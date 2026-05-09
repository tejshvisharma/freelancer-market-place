/**
 * useVerify2FA — for the 2FA verification page (TwoFactorPage)
 *
 * POST /auth/2fa/verify
 *
 * The twoFactorToken comes from location.state (set by useLogin on redirect).
 * The user enters their 6-digit TOTP code.
 *
 * On success: same path as normal login — hydrate store, navigate to dashboard.
 * On 401/400: code wrong or token expired → show inline error on the code field.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES, ROLE_REDIRECT } from "@/app/routes";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/utils";
import type { TwoFAVerifyInput } from "../schemas/auth.schema";

interface UseVerify2FAOptions {
  setError: UseFormSetError<TwoFAVerifyInput>;
}

export const useVerify2FA = ({ setError }: UseVerify2FAOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: TwoFAVerifyInput) => authApi.verify2FA(data),

    onSuccess: (res) => {
      const payload = res.data.data;
      if (!payload) return;

      setAuth(payload.user);
      queryClient.setQueryData(queryKeys.auth.me, res);

      toast.success(`Welcome, ${payload.user.name}!`);
      navigate(ROLE_REDIRECT[payload.user.role] ?? ROUTES.DASHBOARD_CLIENT, {
        replace: true,
      });
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      if (status === 400 || status === 401) {
        setError("code", {
          message:
            "Invalid or expired code. Try again or re-login to get a new token.",
        });
        return;
      }

      if (status === 429) {
        toast.error("Too many attempts. Please wait before trying again.");
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};
