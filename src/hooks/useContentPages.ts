import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface ContentPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tagline?: string;
  subtitle?: string;
  heroBgImage?: string;
  heroImage?: string;
  bgMediaUrl?: string;
  heroVideo?: string;
  videoUrl?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentPagesResponse {
  pages: ContentPage[];
}

export const useContentPagesQuery = (includeInactive: boolean = true) => {
  return useQuery<ContentPagesResponse>({
    queryKey: ['content-pages', { includeInactive }],
    queryFn: async () => {
      const response = await apiClient.get('/content-pages', {
        params: { includeInactive: String(includeInactive) },
      });
      return response.data;
    },
  });
};

export const useCreateContentPageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ContentPage>) => {
      const response = await apiClient.post('/content-pages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
    },
  });
};

export const useUpdateContentPageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<ContentPage> }) => {
      const response = await apiClient.patch(`/content-pages/${slug}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
    },
  });
};

export const useDeleteContentPageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiClient.delete(`/content-pages/${slug}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
    },
  });
};

export const useToggleContentPageActiveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, isActive }: { slug: string; isActive: boolean }) => {
      const response = await apiClient.patch(`/content-pages/${slug}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
    },
  });
};
