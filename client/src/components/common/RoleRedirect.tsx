// src/components/common/RoleRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_REDIRECT } from "@/app/routes";

// Mounted at /dashboard index — immediately redirects to the
// role-appropriate dashboard. User only ever sees /dashboard in the URL
// for a split second before the redirect completes.
export default function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  const destination = user ? ROLE_REDIRECT[user.role] : "/login";
  return <Navigate to={destination} replace />;
}