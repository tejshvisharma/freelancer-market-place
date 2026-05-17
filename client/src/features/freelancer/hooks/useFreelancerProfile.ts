import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { freelancerApi } from "../api/freelancer.api";
import type { FreelancerProfile } from "../types/freelancer.types";

// Helper — extracts profile from axios response
// Backend sends: { data: { profile: { ... } } }
export const selectProfile = (res: any): FreelancerProfile | undefined =>
	res?.data?.data?.profile;

export const useFreelancerProfile = () => {
	return useQuery({
		queryKey: queryKeys.freelancer.profile,
		queryFn: () => freelancerApi.getProfile(),
		select: selectProfile,
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: (count, error: any) => {
			// Never retry auth errors
			if ([401, 403].includes(error?.response?.status)) return false;
			return count < 2;
		},
	});
};
