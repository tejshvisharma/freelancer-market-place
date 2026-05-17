import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { UpdateAvailabilityInput } from "../types/freelancer.types";

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAvailabilityInput) =>
      freelancerApi.updateAvailability(data),

    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                availability: res.data.data.availability,
              },
            },
          },
        };
      });

      toast.success("Availability updated");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (
        status === 422 &&
        Array.isArray(fieldErrors) &&
        fieldErrors.length > 0
      ) {
        fieldErrors.forEach(({ message }: any) => {
          toast.error(message);
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update availability",
      );
    },
  });
};
