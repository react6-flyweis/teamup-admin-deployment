import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface NewsletterSubscription {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  source?: string;
  optIn?: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface NewsletterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NewsletterResponse {
  subscriptions: NewsletterSubscription[];
  pagination: NewsletterPagination;
}

export interface NewsletterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  optIn?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useNewsletterQuery = (params: NewsletterQueryParams = {}) => {
  return useQuery<NewsletterResponse>({
    queryKey: ['newsletter-subscriptions', params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number | boolean> = {};

      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.search && params.search.trim() !== '') cleanParams.search = params.search.trim();
      if (params.source && params.source !== 'all') cleanParams.source = params.source;
      if (params.optIn !== undefined) cleanParams.optIn = params.optIn;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await apiClient.get('/newsletter', {
        params: cleanParams,
      });
      return response.data;
    },
  });
};

export const useDeleteNewsletterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/newsletter/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscriptions'] });
    },
  });
};
