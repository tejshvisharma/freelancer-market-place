import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { UpdatePricingInput } from "../types/freelancer.types";

interface UseUpdatePricingOptions {
  setError: UseFormSetError<UpdatePricingInput>;
}

export const useUpdatePricing = ({ setError }: UseUpdatePricingOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePricingInput) => freelancerApi.updatePricing(data),

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
                pricing: res.data.data.pricing,
              },
            },
          },
        };
      });

      toast.success("Pricing updated");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (
        status === 422 &&
        Array.isArray(fieldErrors) &&
        fieldErrors.length > 0
      ) {
        fieldErrors.forEach(({ field, message }: any) => {
          if (field) {
            setError(field as keyof UpdatePricingInput, { message });
          } else {
            toast.error(message);
          }
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update pricing",
      );
    },
  });
};
