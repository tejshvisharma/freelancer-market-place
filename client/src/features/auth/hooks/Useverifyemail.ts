/**
 * useVerifyEmail — for VerifyEmailPage
 *
 * GET /auth/verify-email/:token
 *
 * This page is the magic-link destination from the verification email.
 * The token comes from useParams() in the component.
 *
 * Using useQuery (not useMutation) because:
 *   - The URL itself IS the trigger — fire on mount automatically
 *   - GET semantics — idempotent read
 *   - TanStack Query gives us isPending / isSuccess / isError states for free
 *
 * On success → shows success UI → redirects to /login after a short delay
 * On error   → shows "token invalid/expired" UI with resend option
 */
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { ROUTES } from "../../../app/routes";

export const useVerifyEmail = (token: string | undefined) => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: () => authApi.verifyEmail(token!),
    enabled: !!token, // only fire when token is present
    retry: false, // don't retry — a bad token won't get better
    staleTime: Infinity, // result is permanent
  });

  useEffect(() => {
    if (query.isSuccess) {
      toast.success("Email verified! You can now log in.");
      // Small delay so user can read the success UI before redirect
      const timer = setTimeout(
        () => navigate(ROUTES.LOGIN, { replace: true }),
        2500,
      );
      return () => clearTimeout(timer);
    }
  }, [query.isSuccess]);

  return query;
};
