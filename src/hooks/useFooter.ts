import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface FooterData {
  companyInfo: {
    officeAddress: string;
    phoneNumber: string;
    copyrightText: string;
  };
  socialMediaLinks: {
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
  };
}

export interface FooterContent {
  _id: string;
  section: string;
  data: FooterData;
  isActive: boolean;
}

export interface FooterResponse {
  content: FooterContent;
}

export interface UpdateFooterPayload {
  section: string;
  data: FooterData;
  isActive: boolean;
  locationSlug?: string;
}

export const useFooterQuery = (locationSlug?: string) => {
  return useQuery<FooterResponse>({
    queryKey: ['footer-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug ? `?locationSlug=${encodeURIComponent(locationSlug)}` : '';
      const response = await apiClient.get(`/site-content/footer${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateFooterMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateFooterPayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const response = await apiClient.patch(`/site-content/footer${queryParam}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-content'] });
    },
  });
};
