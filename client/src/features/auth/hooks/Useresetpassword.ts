/**
 * useResetPassword — for ResetPasswordPage
 *
 * PUT /auth/reset-password/:token
 *
 * The token comes from useParams() in the component — pass it in.
 *
 * On success:
 *   - Toast success
 *   - Navigate to /login (replace so Back button doesn't return here)
 *
 * On 400/401 (bad/expired token):
 *   - Show "link expired" UI with a link to /forgot-password
 *
 * On 422: push field errors to form
 */
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { ROUTES } from "@/app/routes";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import type { ResetPasswordInput } from "../schemas/auth.schema";

interface UseResetPasswordOptions {
  token: string | undefined;
  setError: UseFormSetError<ResetPasswordInput>;
}

export const useResetPassword = ({
  token,
  setError,
}: UseResetPasswordOptions) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordInput) => {
      if (!token) throw new Error("Reset token is missing from URL.");
      return authApi.resetPassword(token, data);
    },

    onSuccess: () => {
      toast.success("Password reset successfully. Please log in.");
      navigate(ROUTES.LOGIN, { replace: true });
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      // 400 / 401 → token invalid or expired
      if (status === 400 || status === 401) {
        toast.error(
          "This reset link has expired or is invalid. Please request a new one.",
        );
        // Let the component render a "Go to forgot password" CTA
        // We signal this via the error object — component can check
        return;
      }

      // 422 field errors
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof ResetPasswordInput, { message });
        });
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};
