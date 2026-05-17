import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { SkillItemInput } from "../schemas/freelancer.schema";

interface UpdateSkillsPayload {
  skills: SkillItemInput[];
}

export const useUpdateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSkillsPayload) => freelancerApi.updateSkills(data),

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
                skills: res.data.data.skills,
              },
            },
          },
        };
      });

      toast.success("Skills updated successfully");
    },

    onError: (error: any) => {
      const fieldErrors = error?.response?.data?.errors;

      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        fieldErrors.forEach((item) => {
          const message = item?.message || "Invalid skills input";
          toast.error(message);
        });
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to update skills");
    },
  });
};
