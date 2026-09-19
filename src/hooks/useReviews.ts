import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface Review {
  _id?: string;
  id?: string;
  customerName: string;
  avatarUrl: string;
  rating: number;
  activity: string;
  lane: string;
  review: string;
  reviewDate: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewPayload {
  customerName: string;
  avatarUrl?: string;
  rating: number;
  activity: string;
  lane: string;
  review: string;
  reviewDate?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ReviewsResponse {
  reviews?: Review[];
  data?: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
}

export interface ReviewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useReviewsQuery = (params: ReviewsQueryParams = {}) => {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number | boolean> = {};
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.rating !== undefined) cleanParams.rating = params.rating;
      if (params.isFeatured !== undefined) cleanParams.isFeatured = params.isFeatured;
      if (params.isActive !== undefined) cleanParams.isActive = params.isActive;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await apiClient.get('/reviews', { params: cleanParams });
      
      // Standardize response payload if returned as an array or wrapped in object
      if (Array.isArray(response.data)) {
        return { reviews: response.data, data: response.data };
      }
      return response.data;
    },
    retry: 1,
  });
};

export const useReviewByIdQuery = (id?: string) => {
  return useQuery<{ review?: Review; data?: Review } | Review>({
    queryKey: ['review', id],
    queryFn: async () => {
      if (!id) throw new Error('Review ID is required');
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const response = await apiClient.post('/reviews', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ReviewPayload> }) => {
      try {
        const response = await apiClient.patch(`/reviews/${id}`, payload);
        return response.data;
      } catch (err: any) {
        // Fallback to PUT if backend only exposes PUT /reviews/:id
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          const response = await apiClient.put(`/reviews/${id}`, payload);
          return response.data;
        }
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', variables.id] });
    },
  });
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/reviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
