import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import { useAuthStore } from '@/store/authStore';
import type { UserProfileResponse, UpdateProfilePayload } from '@/types';

export const PROFILE_QUERY_KEY = ['auth-profile'];

export const useProfileQuery = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery<UserProfileResponse>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<UserProfileResponse>('/auth/profile');
      if (response.data?.user) {
        updateUser(response.data.user);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<UserProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.put<UserProfileResponse>('/auth/profile', payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data?.user) {
        updateUser(data.user);
      } else {
        updateUser(variables);
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};
