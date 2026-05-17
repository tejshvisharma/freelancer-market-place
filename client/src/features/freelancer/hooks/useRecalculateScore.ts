import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";

export const useRecalculateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => freelancerApi.recalculateScore(),
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
                profileCompletionScore: res.data.data.profileCompletionScore,
              },
            },
          },
        };
      });

      toast.success("Profile score recalculated");
    },
    onError: () => {
      toast.error("Failed to recalculate profile score");
    },
  });
};
