/**
 * useInitAuth
 *
 * Called ONCE in AppProviders / App root on mount.
 * Implements the session restore flow from API docs:
 *   1. GET /me
 *   2. On 401 → POST /refresh-token (interceptor handles this automatically)
 *   3. On refresh success → interceptor retries /me → store gets hydrated
 *   4. On refresh failure → interceptor clears auth → user sees /login
 *
 * The axios interceptor already handles the refresh+retry cycle,
 * so here we only need to fire /me and react to the result.
 */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { queryKeys } from "@/constants/queryKeys";

export const useInitAuth = () => {
  const setAuth = useAuthStore((s) => s.setUser);
  
  

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    retry: false, // axios interceptor handles the one refresh retry
    staleTime: Infinity, // don't re-fetch /me in background — only on explicit invalidate
  });

  useEffect(() => {
    if (query.isSuccess && query.data.data.data) {
      const user = query.data.data.data.user;
      setAuth(user);
    }

    if (query.isError) {
      // Refresh also failed (interceptor already cleared auth + will redirect)
     
    }
  }, [query.isSuccess, query.isError]);

  return query;
};
