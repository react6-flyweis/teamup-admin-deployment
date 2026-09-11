import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface GamePackage {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
}

export interface Game {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  headline?: string;
  peopleAllowedPerLane?: number;
  totalLanes?: number;
  timeOption?: string;
  minimumAgeRequirement?: string;
  idRequired?: boolean;
  wheelchairAccessible?: boolean;
  gameIconUrl?: string;
  cardImageUrl?: string;
  bannerImageUrl?: string;
  imageUrl?: string;
  media?: string[];
  features?: string[];
  packages?: GamePackage[];
  duration?: string;
  priceFrom?: number;
  pricePerPerson?: number;
  tags?: string[];
  isActive?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  gameName?: string;
}

export interface GamesResponse {
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateGamePayload {
  gameName: string;
  peopleAllowedPerLane: number;
  totalLanes: number;
  timeOption: string;
  pricePerPerson: number;
  minimumAgeRequirement: string;
  idRequired: boolean;
  wheelchairAccessible: boolean;
  gameIconUrl?: string;
  cardImageUrl?: string;
  bannerImageUrl?: string;
  headline?: string;
  description?: string;
  isActive?: boolean;
}

export const useGamesQuery = () => {
  return useQuery<GamesResponse>({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await apiClient.get('/games');
      return response.data;
    },
  });
};

export const useCreateGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateGamePayload) => {
      const response = await apiClient.post('/games', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
};

export interface UpdateGamePayload {
  gameIdOrSlug: string;
  payload: Partial<CreateGamePayload>;
}

export const useUpdateGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameIdOrSlug, payload }: UpdateGamePayload) => {
      const response = await apiClient.patch(`/games/${gameIdOrSlug}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', variables.gameIdOrSlug] });
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
};

export const useDeleteGameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameIdOrSlug: string) => {
      const response = await apiClient.delete(`/games/${gameIdOrSlug}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game'] });
    },
  });
};
export interface SingleGameResponse {
  game: Game;
}

export const useSingleGameQuery = (gameIdOrSlug?: string) => {
  return useQuery<SingleGameResponse>({
    queryKey: ['game', gameIdOrSlug],
    queryFn: async () => {
      if (!gameIdOrSlug) throw new Error("gameIdOrSlug is required");
      const response = await apiClient.get(`/games/${gameIdOrSlug}`);
      return response.data;
    },
    enabled: !!gameIdOrSlug,
  });
};

export const fetchGame = async (gameIdOrSlug: string) => {
  const response = await apiClient.get(`/games/${gameIdOrSlug}`);
  return response.data;
};
