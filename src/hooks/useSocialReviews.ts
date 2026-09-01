import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface ReviewCard {
  customerName: string;
  avatarUrl: string;
  rating: number;
  gameName: string;
  lane: string;
  review: string;
  period: string; // "daily" | "weekly" | "monthly"
  isFeatured: boolean;
  isActive: boolean;
}

export interface ReviewsDashboard {
  activeFilter: string;
  filters: string[];
  cards: ReviewCard[];
}

export interface PositiveReviewItem {
  _id?: string;
  id?: string;
  customerName: string;
  avatarUrl: string;
  rating: number;
  review: string;
  gameZone: string;
  date: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface PositiveReviews {
  title: string;
  items: PositiveReviewItem[];
  featuredReviewIds?: string[];
  featuredIndexes?: number[];
}

export interface FeedbackItem {
  _id?: string;
  customerName: string;
  date: string;
  summary: string;
  message: string;
  reply: string;
  status: string; // "pending" | "replied"
  isActive: boolean;
}

export interface PreviousFeedbackItem {
  message: string;
  date: string;
}

export interface CustomerFeedback {
  title: string;
  items: FeedbackItem[];
  previousFeedback?: PreviousFeedbackItem[];
}

export interface SocialReviewsData {
  reviewsDashboard?: ReviewsDashboard;
  positiveReviews?: PositiveReviews;
  customerFeedback?: CustomerFeedback;
}

export interface SocialReviewsContent {
  _id: string;
  section: string;
  data: SocialReviewsData;
  isActive: boolean;
}

export interface SocialReviewsResponse {
  content: SocialReviewsContent;
}

export interface UpdateSocialReviewsPayload {
  data: SocialReviewsData;
  isActive?: boolean;
  locationSlug?: string;
}

export const useSocialReviewsQuery = (locationSlug?: string) => {
  return useQuery<SocialReviewsResponse>({
    queryKey: ['social-reviews-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug ? `?locationSlug=${encodeURIComponent(locationSlug)}` : '';
      const response = await apiClient.get(`/site-content/social-reviews${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateSocialReviewsMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSocialReviewsPayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const response = await apiClient.patch(`/site-content/social-reviews${queryParam}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-reviews-content'] });
    },
  });
};

export const useSeedSocialReviewsMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { section: string; data: SocialReviewsData; isActive: boolean; locationSlug?: string }) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const response = await apiClient.put(`/site-content/social-reviews${queryParam}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-reviews-content'] });
    },
  });
};
