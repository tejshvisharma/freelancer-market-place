import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";

export const useDeletePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => freelancerApi.deletePortfolioItem(itemId),

    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.freelancer.profile });

      const previous = queryClient.getQueryData(queryKeys.freelancer.profile);

      queryClient.setQueryData(queryKeys.freelancer.profile, (old: any) => {
        if (!old?.data?.data?.profile) return old;

        const nextPortfolio = (old.data.data.profile.portfolio || []).filter(
          (item: any) => item._id !== itemId,
        );

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                portfolio: nextPortfolio,
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
                portfolio: res.data.data.portfolio,
              },
            },
          },
        };
      });

      toast.success("Portfolio item removed");
    },

    onError: (error: any, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.freelancer.profile, context.previous);
      }

      toast.error(
        error?.response?.data?.message || "Failed to remove portfolio item",
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
    },
  });
};
