/**
 * This page is the browser landing point after the backend OAuth redirect.
 * It runs once, reads query params, hydrates the store, then navigates away.
 * The user sees it for < 500ms — just a spinner.
 *
 * Two cases handled:
 *   A) ?requires2FA=true&twoFactorToken=xxx  → go to /2fa page (same flow as normal login)
 *   B) ?accessToken=xxx                      → hydrate store, go to dashboard
 *   C) ?error=...  or missing params         → toast + go to /login
 */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/features/auth/api/Auth.api";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/constants/queryKeys";
import { ROUTES, ROLE_REDIRECT } from "@/app/routes";
import { toast } from "sonner"
import { apiClient } from "@/lib/axios";
import { AuthUser } from "../types/Auth.types";
import { ApiResponse } from "@/lib/Api.types";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const hasRun = useRef(false); // prevent double-run in React StrictMode
 
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
 
    const handle = async () => {
      const accessToken = searchParams.get("accessToken");
      const requires2FA = searchParams.get("requires2FA");
      const twoFactorToken = searchParams.get("twoFactorToken");
      const error = searchParams.get("error");
 
      // ── Error from backend ──────────────────────────────────────────────
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
 
      // ── Branch A: 2FA required ──────────────────────────────────────────
      if (requires2FA === "true" && twoFactorToken) {
        navigate(ROUTES.TWO_FACTOR, {
          state: { twoFactorToken },
          replace: true,
        });
        return;
      }
 
      // ── Branch B: Normal Google login ───────────────────────────────────
      if (!accessToken) {
        toast.error("Sign-in failed. Please try again.");
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
 
      try {
        const res = await queryClient.fetchQuery({
          queryKey: queryKeys.auth.me,
          queryFn: () =>
            apiClient
              .get<ApiResponse<{ user: AuthUser }>>("/auth/me")
              .then((r) => r.data),
          staleTime: Infinity,
        });
 
        const user = res.data?.user;
 
        if (!user) {
          toast.error("Failed to load your profile. Please log in manually.");
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }
 
        setUser(user);
        toast.success(`Welcome, ${user.name}!`);
        navigate(ROLE_REDIRECT[user.role] ?? ROUTES.DASHBOARD_CLIENT, {
          replace: true,
        });
      } catch {
        toast.error("Failed to load your profile. Please log in manually.");
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };
 
    void handle();
  }, []);
 
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Completing Google sign-in…</p>
      </div>
    </div>
  );
}