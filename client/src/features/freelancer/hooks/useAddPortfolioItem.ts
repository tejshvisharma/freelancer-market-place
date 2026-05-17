import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { PortfolioItemInput } from "../schemas/freelancer.schema";

interface AddPortfolioPayload extends PortfolioItemInput {
  file: File;
}

interface UseAddPortfolioItemOptions {
  onSuccess?: () => void;
}

export const useAddPortfolioItem = (options?: UseAddPortfolioItemOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddPortfolioPayload) => {
      const formData = new FormData();
      formData.append("image", data.file);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.link) formData.append("link", data.link);
      return freelancerApi.addPortfolioItem(formData);
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
              profile: {
                ...old.data.data.profile,
                portfolio: res.data.data.portfolio,
              },
            },
          },
        };
      });

      toast.success("Portfolio item added");
      options?.onSuccess?.();
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;
      const message = error?.response?.data?.message;

      if (status === 400) {
        const fileErrorMessage =
          fieldErrors?.[0]?.message || message || "Invalid file upload";
        toast.error(fileErrorMessage);
        return;
      }

      if (status === 422) {
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          fieldErrors.forEach((item: any) => {
            toast.error(item?.message || "Invalid portfolio input");
          });
          return;
        }
        toast.error(message || "Invalid portfolio input");
        return;
      }

      toast.error(message || "Failed to add portfolio item");
    },
  });
};
