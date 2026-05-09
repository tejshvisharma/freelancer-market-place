/**
 * useResendVerification — for ResendVerificationEmailPage
 *
 * POST /auth/resend-verification
 *
 * API docs note: this is a protected route — it requires an accessToken or
 * auth cookie. In practice this page is also reachable by unauthenticated
 * users who just registered (their session cookie is fresh), so the axios
 * instance's withCredentials:true handles it automatically.
 *
 * Strategy:
 *   - User enters email on the page → we don't POST the email to this endpoint
 *     (the backend determines email from the auth cookie/token)
 *   - The email field on the page is for UX clarity / reassurance only
 *   - One-shot: once sent, disable the button with a cooldown
 *
 * On success → show "check your inbox" message
 * On error   → show inline error, allow retry after cooldown
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { getErrorMessage } from "@/lib/utils";

const COOLDOWN_SECONDS = 60;

export const useResendVerification = () => {
  const [cooldown, setCooldown] = useState(0);

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
    mutationFn: () => authApi.resendVerification(),

    onSuccess: (res) => {
      const msg =
        res.data.message ?? "Verification email sent. Check your inbox.";
      toast.success(msg);
      startCooldown();
    },

    onError: (error: unknown) => {
      const status = (error as any)?.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait before trying again.");
        startCooldown();
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });

  return {
    ...mutation,
    cooldown,
    isOnCooldown: cooldown > 0,
  };
};
