export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  VERIFY_EMAIL: "/verify-email/:token",
  TWO_FACTOR: "/2fa",
  TWO_FACTOR_SETUP: "/2fa/setup",
  VERIFY_PENDING: "/verify-pending",

  // Dashboards
  DASHBOARD_CLIENT: "/dashboard/client",
  DASHBOARD_FREELANCER: "/dashboard/freelancer",
  DASHBOARD_ADMIN: "/admin",

  // Helpers for navigation (no param placeholders)
  resetPassword: (token: string) => `/reset-password/${token}`,
  verifyEmail: (token: string) => `/verify-email/${token}`,
} as const;

export const ROLE_REDIRECT: Record<string, string> = {
  client: ROUTES.DASHBOARD_CLIENT,
  freelancer: ROUTES.DASHBOARD_FREELANCER,
  admin: ROUTES.DASHBOARD_ADMIN,
};
