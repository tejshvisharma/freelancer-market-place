/**
 * useUpdateProfile — for ProfilePage (profile fields section)
 *
 * PUT /auth/update-profile
 *
 * After success:
 *   - Updates Zustand store immediately (optimistic-ish, server-confirmed)
 *   - Invalidates the /me query so any other subscriber gets fresh data
 *
 * On 422: push field errors to form
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import toast from "react-hot-toast";
import { authApi } from "../api/Auth.api";
import { useAuthStore } from "../../../stores/auth.store";
import { queryKeys } from "@/constants/queryKeys";
import { getErrorMessage, getFieldErrors } from "@/lib/utils";
import type { UpdateProfileInput } from "../schemas/auth.schema";

interface UseUpdateProfileOptions {
  setError: UseFormSetError<UpdateProfileInput>;
}

export const useUpdateProfile = ({ setError }: UseUpdateProfileOptions) => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => authApi.updateProfile(data),

    onSuccess: (res) => {
      const user = res.data.data?.user;
      if (user ) {
        // Sync Zustand store with the confirmed server state
        setAuth(user);
      }
      // Invalidate /me so any other component re-reads fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Profile updated successfully.");
    },  

    onError: (error: unknown) => {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }) => {
          setError(field as keyof UpdateProfileInput, { message });
        });
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
};
