import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface TopBannerData {
  text: string;
  isActive: boolean;
}

export interface ButtonData {
  text: string;
  link: string;
}

export interface HeroData {
  backgroundMediaUrl: string;
  title: string;
  subtitle: string;
  primaryButton: ButtonData;
  secondaryButton: ButtonData;
}

export interface BoomBundleItem {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

export interface BoomBundlesData {
  title: string;
  items: BoomBundleItem[];
}

export interface ChooseGameItem {
  title: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

export interface ChooseGameSectionData {
  title: string;
  subtitle: string;
  items: ChooseGameItem[];
}

export interface BitesDrinksItem {
  title: string;
  imageUrl: string;
  menuLink: string;
  isActive: boolean;
}

export interface NightsOutData {
  backgroundImageUrl: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

export interface BitesEventsData {
  bites: BitesDrinksItem;
  drinks: BitesDrinksItem;
  nightsOut: NightsOutData;
}

export interface HomeData {
  topBanner?: TopBannerData;
  hero?: HeroData;
  boomBundles?: BoomBundlesData;
  chooseGameSection?: ChooseGameSectionData;
  bitesEvents?: BitesEventsData;
}

export interface HomeContent {
  _id: string;
  section: string;
  data: HomeData;
  isActive: boolean;
}

export interface HomeResponse {
  content: HomeContent;
}

export interface UpdateHomePayload {
  data: HomeData;
  isActive?: boolean;
  locationSlug?: string;
}

export const useHomeQuery = (locationSlug?: string) => {
  return useQuery<HomeResponse>({
    queryKey: ['home-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug ? `?locationSlug=${encodeURIComponent(locationSlug)}` : '';
      const response = await apiClient.get(`/site-content/home${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateHomeMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateHomePayload) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const response = await apiClient.patch(`/site-content/home${queryParam}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
    },
  });
};
