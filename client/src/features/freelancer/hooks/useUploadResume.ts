import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";

interface UseUploadResumeOptions {
  onSuccess?: () => void;
}

export const useUploadResume = ({ onSuccess }: UseUploadResumeOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return freelancerApi.uploadResume(formData);
    },
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: res.data.data.profile,
            },
          },
        };
      });

      toast.success("Resume uploaded successfully");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to upload resume";
      toast.error(message);
    },
  });
};
