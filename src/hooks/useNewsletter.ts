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

export interface NewsletterSignupSiteContent {
  _id?: string;
  section: string;
  isActive: boolean;
  locationSlug?: string;
  data?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSignupResponse {
  content?: NewsletterSignupSiteContent;
  section?: string;
  isActive?: boolean;
}

export interface ToggleNewsletterSignupPayload {
  isActive: boolean;
  locationSlug?: string;
}

export const useNewsletterSignupStatusQuery = (locationSlug?: string) => {
  return useQuery<{ isActive: boolean; raw?: unknown }>({
    queryKey: ['newsletter-signup-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug ? `?locationSlug=${encodeURIComponent(locationSlug)}` : '';
      try {
        const response = await apiClient.get(`/site-content/newsletter-signup${queryParam}`);
        const data = response.data;
        const isActive =
          data?.content?.isActive !== undefined
            ? Boolean(data.content.isActive)
            : data?.isActive !== undefined
            ? Boolean(data.isActive)
            : true;
        return { isActive, raw: data };
      } catch {
        try {
          const sep = queryParam ? '&' : '?';
          const fallbackRes = await apiClient.get(
            `/site-content${queryParam}${sep}section=newsletter-signup`
          );
          const fbData = fallbackRes.data;
          const isActive =
            fbData?.content?.isActive !== undefined
              ? Boolean(fbData.content.isActive)
              : fbData?.isActive !== undefined
              ? Boolean(fbData.isActive)
              : true;
          return { isActive, raw: fbData };
        } catch {
          // If not initialized yet, default to active
          return { isActive: true };
        }
      }
    },
  });
};

export const useToggleNewsletterSignupMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ToggleNewsletterSignupPayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const body = {
        section: 'newsletter-signup',
        isActive: payload.isActive,
        data:{}
      };
      try {
        const response = await apiClient.post(`/site-content${queryParam}`, body);
        return response.data;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || status === 409) {
          const response = await apiClient.patch(`/site-content/newsletter-signup${queryParam}`, body);
          return response.data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-signup-content'] });
    },
  });
};

