import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type { HeaderCategory } from '@/components/ManageHeader/types';

export interface HeaderCategoriesResponse {
  categories: HeaderCategory[];
}

export const useHeaderCategoriesQuery = () => {
  return useQuery<HeaderCategoriesResponse>({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/menu-items/categories');
      return response.data;
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, name, isActive }: { categoryId: string; name?: string; isActive?: boolean }) => {
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (isActive !== undefined) payload.isActive = isActive;

      const response = await apiClient.patch(`/menu-items/categories/${categoryId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
    },
  });
};

export const useUpdateMenuItemStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuItemId, isActive }: { menuItemId: string; isActive: boolean }) => {
      const response = await apiClient.patch(`/menu-items/${menuItemId}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
    },
  });
};


