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

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await apiClient.post('/menu-items/categories', { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
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

export const useUpdateMenuItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      menuItemId,
      payload,
    }: {
      menuItemId: string;
      payload: Record<string, unknown>;
    }) => {
      const response = await apiClient.patch(`/menu-items/${menuItemId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-item'] });
    },
  });
};


export const useMenuItemQuery = (menuItemId?: string) => {
  return useQuery({
    queryKey: ['menu-item', menuItemId],
    queryFn: async () => {
      if (!menuItemId) return null;
      const response = await apiClient.get(`/menu-items/${menuItemId}`);
      return response.data;
    },
    enabled: !!menuItemId && menuItemId !== 'new',
  });
};



