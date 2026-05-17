/**
 * useForgotPassword — for ForgotPasswordPage
 *
 * POST /auth/forgot-password
 *
 * Security rule from API docs:
 *   "Always show the same generic success message.
 *    Do not reveal whether the email exists."
 *
 * Implementation:
 *   - On success AND on 404 → show identical generic message
 *   - Only show real errors for 429 (rate limit) and 500 (server error)
 *   - After success, show a "sent" state so user knows not to re-submit
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { authApi } from "../api/Auth.api";
import { getFieldErrors } from "../../../lib/utils";
import type { ForgotPasswordInput } from "../schemas/auth.schema";

const GENERIC_SUCCESS_MSG =
  "If that email is registered, you'll receive a reset link shortly.";

interface UseForgotPasswordOptions {
  setError: UseFormSetError<ForgotPasswordInput>;
}

export const useForgotPassword = ({ setError }: UseForgotPasswordOptions) => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),

    onSuccess: () => {
      setIsEmailSent(true);
      toast.success(GENERIC_SUCCESS_MSG);
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      // 404 → treat identically to success (don't leak email existence)
      if (status === 404) {
        setIsEmailSent(true);
        toast.success(GENERIC_SUCCESS_MSG);
        return;
      }

      // 422 field errors
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof ForgotPasswordInput, { message });
        });
        return;
      }

      // 429 rate limit
      if (status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
        return;
      }

      toast.error("Something went wrong. Please try again later.");
    },
  });

  return {
    ...mutation,
    isEmailSent,
  };
};
