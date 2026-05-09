/**
 * useResendVerification — for ResendVerificationEmailPage
 *
 * POST /auth/resend-verification
 *
 * The backend always returns 200 for two distinct cases:
 *   A) Email WAS sent       → data.user.isEmailVerified === false
 *   B) Already verified     → data.user.isEmailVerified === true
 *
 * We distinguish them via `isAlreadyVerified` so the page can
 * render the correct UI for each case.
 *
 * mutate() takes NO arguments — the backend derives the email
 * from the auth cookie / access token.
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import type { ResendVerificationInput } from "../schemas/auth.schema";

const COOLDOWN_SECONDS = 60;

interface UseResendVerificationOptions {
  setError?: UseFormSetError<ResendVerificationInput>;
}

export const useResendVerification = (
  options: UseResendVerificationOptions = {}
) => {
  const { setError } = options;
  const [cooldown, setCooldown] = useState(0);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const mutation = useMutation({
    // Backend derives email from auth cookie — no body needed
    mutationFn: () => authApi.resendVerification(),

    onSuccess: (res) => {
      const user = res.data?.data?.user;

      // Case B: backend says email is already verified
      if (user?.isEmailVerified === true) {
        setIsAlreadyVerified(true);
        toast.success(res.data.message ?? "Email is already verified.");
        return;
      }

      // Case A: verification email was sent
      setIsAlreadyVerified(false);
      toast.success(
        res.data.message ?? "Verification email sent. Check your inbox."
      );
      startCooldown();
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;

      if (status === 429) {
        toast.error("Too many requests. Please wait before trying again.");
        startCooldown();
        return;
      }

      // Map 422 field errors to form if setError provided
      if (setError) {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors.length > 0) {
          fieldErrors.forEach(({ field, message }) => {
            setError(field as keyof ResendVerificationInput, { message });
          });
          return;
        }
      }

      toast.error(getErrorMessage(error));
    },
  });

  return {
    ...mutation,
    cooldown,
    isOnCooldown: cooldown > 0,
    isAlreadyVerified,
  };
};
