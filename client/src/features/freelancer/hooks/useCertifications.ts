import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { CertificationInput } from "../schemas/freelancer.schema";

interface UseCertificationsOptions {
  setError?: UseFormSetError<CertificationInput>;
}

interface UpdateCertificationPayload {
  certId: string;
  data: Partial<CertificationInput>;
}

const applyFieldErrors = (
  setError: UseFormSetError<CertificationInput> | undefined,
  fieldErrors: any,
) => {
  if (!setError || !Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    return false;
  }

  fieldErrors.forEach(({ field, message }: any) => {
    if (!field) return;
    setError(field as keyof CertificationInput, { message });
  });

  return true;
};

export const useAddCertification = (options?: UseCertificationsOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CertificationInput) =>
      freelancerApi.addCertification(data),

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
                certifications: res.data.data.certifications,
              },
            },
          },
        };
      });

      toast.success("Certification added");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid certification data");
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to add certification",
      );
    },
  });
};

export const useUpdateCertification = (options?: UseCertificationsOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ certId, data }: UpdateCertificationPayload) =>
      freelancerApi.updateCertification(certId, data),

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
                certifications: res.data.data.certifications,
              },
            },
          },
        };
      });

      toast.success("Certification updated");
    },

    onError: (error: any) => {
      const status = error?.response?.status;
      const fieldErrors = error?.response?.data?.errors;

      if (status === 422 && applyFieldErrors(options?.setError, fieldErrors)) {
        return;
      }

      if (status === 422 && Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item: any) => {
          toast.error(item?.message || "Invalid certification data");
        });
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to update certification",
      );
    },
  });
};

export const useDeleteCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certId: string) => freelancerApi.deleteCertification(certId),

    onMutate: async (certId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.freelancer.profile });
      const previous = queryClient.getQueryData(queryKeys.freelancer.profile);

      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old?.data?.data?.profile) return old;

        const nextItems = (old.data.data.profile.certifications || []).filter(
          (item: any) => item._id !== certId,
        );

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                certifications: nextItems,
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
                certifications: res.data.data.certifications,
              },
            },
          },
        };
      });

      toast.success("Certification removed");
    },

    onError: (error: any, _certId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.freelancer.profile, context.previous);
      }

      toast.error(
        error?.response?.data?.message || "Failed to remove certification",
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
    },
  });
};
