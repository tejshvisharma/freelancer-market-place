import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { WorkExperienceInput } from "../schemas/freelancer.schema";

interface UseExperienceOptions {
  setError?: UseFormSetError<WorkExperienceInput>;
}

interface UpdateExperiencePayload {
  expId: string;
  data: Partial<WorkExperienceInput>;
}

const applyFieldErrors = (
  setError: UseFormSetError<WorkExperienceInput> | undefined,
  fieldErrors: any,
) => {
  if (!setError || !Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    return false;
  }

  fieldErrors.forEach(({ field, message }: any) => {
    if (!field) return;
    setError(field as keyof WorkExperienceInput, { message });
  });

  return true;
};

export const useAddExperience = (options?: UseExperienceOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkExperienceInput) => freelancerApi.addExperience(data),

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
                workExperience: res.data.data.workExperience,
              },
            },
          },
        };
      });

      toast.success("Experience added");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid experience data");
        });
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to add experience");
    },
  });
};

export const useUpdateExperience = (options?: UseExperienceOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expId, data }: UpdateExperiencePayload) =>
      freelancerApi.updateExperience(expId, data),

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
                workExperience: res.data.data.workExperience,
              },
            },
          },
        };
      });

      toast.success("Experience updated");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid experience data");
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update experience",
      );
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expId: string) => freelancerApi.deleteExperience(expId),

    onMutate: async (expId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.freelancer.profile });
      const previous = queryClient.getQueryData(queryKeys.freelancer.profile);

      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old?.data?.data?.profile) return old;

        const nextItems = (old.data.data.profile.workExperience || []).filter(
          (item: any) => item._id !== expId,
        );

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                workExperience: nextItems,
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
                workExperience: res.data.data.workExperience,
              },
            },
          },
        };
      });

      toast.success("Experience removed");
    },

    onError: (error: any, _expId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.freelancer.profile, context.previous);
      }

      toast.error(
        error?.response?.data?.message || "Failed to remove experience",
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
    },
  });
};
