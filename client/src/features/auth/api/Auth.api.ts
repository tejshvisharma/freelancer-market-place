import { apiClient as api } from "@/lib/axios";
import type { ApiResponse } from "@/lib/Api.types.ts";
import type {
  AuthUser,
  LoginResponseData,
  TwoFASetupData,
} from "../types/Auth.types";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
  TwoFAVerifyInput,
  TwoFACodeInput,
} from "../schemas/auth.schema";

export const authApi = {
  // ── Registration & Login ────────────────────────────────────────────────
  register: (body: RegisterInput) =>
    api.post<ApiResponse<{ user: AuthUser }>>("/auth/register", body),

  login: (body: LoginInput) =>
    api.post<ApiResponse<LoginResponseData>>("/auth/login", body),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  // ── Session ──────────────────────────────────────────────────────────────
  me: () =>
    api.get<ApiResponse<{ user: AuthUser }>>("/auth/me"),

  refreshToken: () =>
    api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>(
      "/auth/refresh-token"
    ),

  // ── Email verification ───────────────────────────────────────────────────
  verifyEmail: (token: string) =>
    api.get<ApiResponse<{ user: Partial<AuthUser> }>>(
      `/auth/verify-email/${token}`
    ),

  resendVerification: () =>
    api.post<ApiResponse<{ user: Partial<AuthUser> }>>(
      "/auth/resend-verification"
    ),

  // ── Password ─────────────────────────────────────────────────────────────
  forgotPassword: (body: ForgotPasswordInput) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", body),

  resetPassword: (token: string, body: ResetPasswordInput) =>
    api.put<ApiResponse<null>>(`/auth/reset-password/${token}`, body),

  changePassword: (body: ChangePasswordInput) =>
    api.put<ApiResponse<null>>("/auth/change-password", body),

  // ── Profile ──────────────────────────────────────────────────────────────
  updateProfile: (body: UpdateProfileInput) =>
    api.put<ApiResponse<{ user: AuthUser }>>("/auth/update-profile", body),

  // ── 2FA ──────────────────────────────────────────────────────────────────
  verify2FA: (body: TwoFAVerifyInput) =>
    api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>(
      "/auth/2fa/verify",
      body
    ),

  setup2FA: () =>
    api.post<ApiResponse<TwoFASetupData>>("/auth/2fa/setup"),

  verifySetup2FA: (body: TwoFACodeInput) =>
    api.post<ApiResponse<{ user: Partial<AuthUser> }>>(
      "/auth/2fa/verify-setup",
      body
    ),

  disable2FA: (body: TwoFACodeInput) =>
    api.post<ApiResponse<{ user: Partial<AuthUser> }>>(
      "/auth/2fa/disable",
      body
    ),

  // ── Google OAuth ─────────────────────────────────────────────────────────
  googleLogin: () => {
    // Redirect browser — backend handles OAuth handshake
    window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"}/auth/oauth/google`;
  },
};