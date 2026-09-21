import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type { HomeResponse } from './useHome';
import type { EventPageData } from '@/types/events';
import { DEFAULT_SOCIAL_EVENTS_DATA, DEFAULT_CORPORATE_EVENTS_DATA } from '@/types/events';

export type EventPageType = 'socialEvents' | 'corporateEvents';

export interface UpdateEventPagePayload {
  data: EventPageData;
  locationSlug?: string;
}

export const useEventPageQuery = (_pageType: EventPageType, locationSlug?: string) => {
  return useQuery<HomeResponse>({
    queryKey: ['home-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug
        ? `?locationSlug=${encodeURIComponent(locationSlug)}`
        : '';
      const response = await apiClient.get(`/site-content/home${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateEventPageMutation = (pageType: EventPageType, locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEventPagePayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const body = {
        data: {
          [pageType]: payload.data,
        },
      };
      const response = await apiClient.patch(
        `/site-content/home${queryParam}`,
        body
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      const slug = variables.locationSlug || locationSlug;
      queryClient.setQueryData(['home-content', slug], data);
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
    },
  });
};

export const getInitialEventPageData = (
  rawPageData: EventPageData | undefined,
  pageType: EventPageType
): EventPageData => {
  const defaultData =
    pageType === 'socialEvents'
      ? DEFAULT_SOCIAL_EVENTS_DATA
      : DEFAULT_CORPORATE_EVENTS_DATA;

  if (!rawPageData) return defaultData;

  return {
    hero: {
      title: rawPageData.hero?.title ?? defaultData.hero.title,
      subtitle: rawPageData.hero?.subtitle ?? defaultData.hero.subtitle,
      bgMediaUrl: rawPageData.hero?.bgMediaUrl ?? defaultData.hero.bgMediaUrl,
      bgMediaType: rawPageData.hero?.bgMediaType ?? defaultData.hero.bgMediaType,
      pageUrl: rawPageData.hero?.pageUrl ?? defaultData.hero.pageUrl,
    },
    ageGroups: {
      sectionTitle: rawPageData.ageGroups?.sectionTitle ?? defaultData.ageGroups.sectionTitle,
      sectionSubtitle: rawPageData.ageGroups?.sectionSubtitle ?? defaultData.ageGroups.sectionSubtitle,
      cards: rawPageData.ageGroups?.cards && rawPageData.ageGroups.cards.length > 0
        ? rawPageData.ageGroups.cards
        : defaultData.ageGroups.cards,
    },
    infoCards: {
      sectionTitle: rawPageData.infoCards?.sectionTitle ?? defaultData.infoCards.sectionTitle,
      sectionSubtitle: rawPageData.infoCards?.sectionSubtitle ?? defaultData.infoCards.sectionSubtitle,
      cards: rawPageData.infoCards?.cards && rawPageData.infoCards.cards.length > 0
        ? rawPageData.infoCards.cards
        : defaultData.infoCards.cards,
    },
  };
};
