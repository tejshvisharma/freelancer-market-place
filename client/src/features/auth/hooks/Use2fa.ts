/**
 * useSetup2FA — for ProfilePage (enable 2FA flow)
 *
 * Step 1: POST /auth/2fa/setup      → returns QR code + secret
 * Step 2: POST /auth/2fa/verify-setup → user enters code → 2FA enabled
 *
 * Both steps live here. The component controls which step is visible.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { queryKeys } from "../../../constants/queryKeys";
import { getErrorMessage, getFieldErrors } from "../../../lib/utils";
import type { TwoFACodeInput } from "../schemas/auth.schema";

// ── Step 1: initiate setup ────────────────────────────────────────────────────
export const useInitSetup2FA = () => {
  return useMutation({
    mutationFn: () => authApi.setup2FA(),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ── Step 2: verify the TOTP code and enable 2FA ───────────────────────────────
interface UseVerifySetup2FAOptions {
  setError: UseFormSetError<TwoFACodeInput>;
  onSuccess?: () => void;
}

export const useVerifySetup2FA = ({
  setError,
  onSuccess,
}: UseVerifySetup2FAOptions) => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: TwoFACodeInput) => authApi.verifySetup2FA(data),

    onSuccess: () => {
      // Patch the user in store so isTwoFactorEnabled flips immediately
      if (user) {
        setUser({ ...user, isTwoFactorEnabled: true });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Two-factor authentication enabled.");
      onSuccess?.();
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      if (status === 400 || status === 401) {
        setError("code", {
          message: "Invalid code. Check your authenticator app.",
        });
        return;
      }

      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof TwoFACodeInput, { message });
        });
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};

/**
 * useDisable2FA — for ProfilePage (disable 2FA flow)
 *
 * POST /auth/2fa/disable
 */
interface UseDisable2FAOptions {
  setError: UseFormSetError<TwoFACodeInput>;
  onSuccess?: () => void;
}

export const useDisable2FA = ({
  setError,
  onSuccess,
}: UseDisable2FAOptions) => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: TwoFACodeInput) => authApi.disable2FA(data),

    onSuccess: () => {
      if (user) {
        setUser({ ...user, isTwoFactorEnabled: false });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Two-factor authentication disabled.");
      onSuccess?.();
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      if (status === 400 || status === 401) {
        setError("code", {
          message:
            "Incorrect code. Check your authenticator app and try again.",
        });
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};
