import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { EducationInput } from "../schemas/freelancer.schema";

interface UseEducationOptions {
  setError?: UseFormSetError<EducationInput>;
}

interface UpdateEducationPayload {
  eduId: string;
  data: Partial<EducationInput>;
}

const applyFieldErrors = (
  setError: UseFormSetError<EducationInput> | undefined,
  fieldErrors: any,
) => {
  if (!setError || !Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    return false;
  }

  fieldErrors.forEach(({ field, message }: any) => {
    if (!field) return;
    setError(field as keyof EducationInput, { message });
  });

  return true;
};

export const useAddEducation = (options?: UseEducationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EducationInput) => freelancerApi.addEducation(data),

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
                education: res.data.data.education,
              },
            },
          },
        };
      });

      toast.success("Education added");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid education data");
        });
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to add education");
    },
  });
};

export const useUpdateEducation = (options?: UseEducationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eduId, data }: UpdateEducationPayload) =>
      freelancerApi.updateEducation(eduId, data),

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
                education: res.data.data.education,
              },
            },
          },
        };
      });

      toast.success("Education updated");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid education data");
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update education",
      );
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eduId: string) => freelancerApi.deleteEducation(eduId),

    onMutate: async (eduId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.freelancer.profile });
      const previous = queryClient.getQueryData(queryKeys.freelancer.profile);

      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old?.data?.data?.profile) return old;

        const nextItems = (old.data.data.profile.education || []).filter(
          (item: any) => item._id !== eduId,
        );

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                education: nextItems,
              },
            },
          },
        };
      });

      return { previous };
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
                education: res.data.data.education,
              },
            },
          },
        };
      });

      toast.success("Education removed");
    },

    onError: (error: any, _eduId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.freelancer.profile, context.previous);
      }

      toast.error(
        error?.response?.data?.message || "Failed to remove education",
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
    },
  });
};
