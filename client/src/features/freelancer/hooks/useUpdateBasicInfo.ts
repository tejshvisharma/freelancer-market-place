import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { BasicInfoInput } from "../schemas/freelancer.schema";

interface UseUpdateBasicInfoOptions {
  setError: UseFormSetError<BasicInfoInput>;
}

export const useUpdateBasicInfo = ({
  setError,
}: UseUpdateBasicInfoOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BasicInfoInput) => freelancerApi.updateProfile(data),

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
                // spread only the fields returned in res.data.data.profile
                ...res.data.data.profile,
              },
            },
          },
        };
      });

      toast.success(res?.data?.message || "Profile updated");
    },

    onError: (error: any) => {
      const fieldErrors = error?.response?.data?.errors;

      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        fieldErrors.forEach(({ field, message }: any) => {
          const targetField =
            typeof field === "string" && field.startsWith("languages")
              ? "languages"
              : field;
          setError(targetField as keyof BasicInfoInput, { message });
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update profile",
      );
    },
  });
};
