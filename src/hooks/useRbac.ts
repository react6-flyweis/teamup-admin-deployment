import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type { RbacPermissionsResponse, UpdateRolePermissionsPayload, Role } from '@/types';

export const RBAC_PERMISSIONS_QUERY_KEY = ['rbac-permissions'];

export const useRbacPermissionsQuery = () => {
  return useQuery<RbacPermissionsResponse>({
    queryKey: RBAC_PERMISSIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<RbacPermissionsResponse>('/rbac/permissions');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export interface UpdateRolePermissionsVariables {
  role: Role | string;
  payload: UpdateRolePermissionsPayload;
}

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateRolePermissionsVariables>({
    mutationFn: async ({ role, payload }) => {
      const response = await apiClient.put(`/rbac/permissions/${role}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RBAC_PERMISSIONS_QUERY_KEY });
    },
  });
};
