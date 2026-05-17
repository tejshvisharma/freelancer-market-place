/**
 * useChangePassword — for ProfilePage (change password section)
 *
 * PUT /auth/change-password
 *
 * API docs: after success, backend clears all refresh tokens and cookies.
 * Frontend must:
 *   - Clear local auth state
 *   - Wipe query cache
 *   - Redirect to /login so user re-authenticates with new password
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { ROUTES } from "../../../app/routes";
import { getErrorMessage, getFieldErrors } from "../../../lib/utils";
import type { ChangePasswordInput } from "../schemas/auth.schema";

interface UseChangePasswordOptions {
  setError: UseFormSetError<ChangePasswordInput>;
}

export const useChangePassword = ({ setError }: UseChangePasswordOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }),

    onSuccess: () => {
      toast.success(
        "Password changed. Please log in again with your new password.",
      );
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      // 401 → current password wrong
      if (status === 401) {
        setError("currentPassword", {
          message: "Current password is incorrect.",
        });
        return;
      }

      // 422 field errors
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          // Backend sends 'newPassword', schema uses 'newPassword' too — direct map
          setError(field as keyof ChangePasswordInput, { message });
        });
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};
