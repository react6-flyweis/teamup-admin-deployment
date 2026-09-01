import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface UserItem {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  totalVisits?: number;
  totalSpent?: number;
  lastVisit?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  users: UserItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const useUsersQuery = (params: UsersQueryParams = {}) => {
  return useQuery<UsersResponse>({
    queryKey: ['users', params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number | boolean> = {};
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.role) cleanParams.role = params.role;
      if (params.isActive !== undefined) cleanParams.isActive = params.isActive;

      const response = await apiClient.get('/users', { params: cleanParams });
      return response.data;
    },
    retry: 1,
  });
};

export const useUserByIdQuery = (id?: string) => {
  return useQuery<{ user: UserItem }>({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUserProfileQuery = () => {
  return useQuery<{ user: UserItem }>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
  });
};

export const useUserBookingsQuery = () => {
  return useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      const response = await apiClient.get('/users/bookings');
      return response.data;
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserItem>) => {
      const response = await apiClient.post('/users', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<UserItem> }) => {
      const response = await apiClient.patch(`/users/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
