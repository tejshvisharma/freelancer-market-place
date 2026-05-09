/**
 * useRegister — for RegisterPage
 *
 * POST /auth/register
 *
 * On success:
 *   - Does NOT auto-login (per API docs)
 *   - Stores the registered email in location state so VerifyEmailPromptPage
 *     can display it without props
 *   - Navigates to /verify-pending
 *
 * On 422: maps field-level errors back to the form via setError()
 * On 409: duplicate email — shown as a field error on the email field
 */
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { ROUTES } from "@/app/routes";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import type { RegisterInput } from "../schemas/auth.schema";

interface UseRegisterOptions {
  /** Pass form.setError so the hook can push 422 errors to the right fields */
  setError: UseFormSetError<RegisterInput>;
}

export const useRegister = ({ setError }: UseRegisterOptions) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),

    onSuccess: (res, variables) => {
      // API docs: always show verify-email screen, never auto-login
      toast.success("Account created! Please verify your email.");
      navigate(ROUTES.VERIFY_PENDING, {
        // Pass email so the prompt page can show it without a re-fetch
        state: { email: variables.email },
        replace: true,
      });
    },

    onError: (error: unknown) => {
      // Map 422 field errors → individual form fields
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof RegisterInput, { message });
        });
        return;
      }

      // 409 duplicate email
      const status = (error as any)?.response?.status;
      if (status === 409) {
        setError("email", {
          message: "An account with this email already exists.",
        });
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });
};
