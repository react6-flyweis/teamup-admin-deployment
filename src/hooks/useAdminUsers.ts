import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type {
  AdminUser,
  AdminUsersResponse,
  AdminUsersQueryParams,
  UpdateAdminUserPayload,
  CreateAdminUserPayload,
} from '@/types';

export const ADMIN_USERS_QUERY_KEY = ['admin-users'];

export const useAdminUsersQuery = (params?: AdminUsersQueryParams) => {
  return useQuery<AdminUsersResponse>({
    queryKey: [ADMIN_USERS_QUERY_KEY, params],
    queryFn: async () => {
      const cleanParams: Record<string, string | boolean> = {};
      if (params?.isActive !== undefined) {
        cleanParams.isActive = params.isActive;
      }
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }

      const response = await apiClient.get<AdminUsersResponse>('/admin/admin-users', {
        params: cleanParams,
      });
      return response.data;
    },
  });
};

export interface UpdateAdminUserVariables {
  userId: string;
  payload: UpdateAdminUserPayload;
}

export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, UpdateAdminUserVariables>({
    mutationFn: async ({ userId, payload }) => {
      const response = await apiClient.patch<AdminUser>(
        `/admin/admin-users/${userId}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/admin/admin-users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, CreateAdminUserPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<AdminUser>('/admin/admin-users', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
    },
  });
};

