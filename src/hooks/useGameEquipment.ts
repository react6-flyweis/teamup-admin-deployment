import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface GameEquipmentLane {
  id: string | null;
  name: string;
  status: string;
  lastMaintenance: string;
  nextInspectionDue: string;
  nextInspection: string;
  issue: string;
  isActive: boolean;
  isIssueActive: boolean;
}

export interface GameEquipment {
  id: string | null;
  gameId: string;
  gameObjectId: string;
  slug: string;
  gameName: string;
  totalLanes: number;
  status: string;
  lastMaintenance: string;
  nextInspectionDue: string;
  nextInspection: string;
  issue: string;
  lanes: GameEquipmentLane[];
  isActive: boolean;
}

export interface GameEquipmentResponse {
  equipment: GameEquipment[];
}

export interface GameEquipmentFilters {
  gameId?: string;
  status?: string;
  includeInactive?: boolean;
}

export interface GameEquipmentPayload {
  gameId: string;
  status?: string;
  lastMaintenance?: string;
  nextInspectionDue?: string;
  issue?: string;
  lanes?: Partial<GameEquipmentLane>[];
  isActive?: boolean;
}

export const useGameEquipmentQuery = (filters?: GameEquipmentFilters) => {
  return useQuery<GameEquipmentResponse>({
    queryKey: ['gameEquipment', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.gameId) params.append('gameId', filters.gameId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.includeInactive !== undefined) params.append('includeInactive', String(filters.includeInactive));

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/game-equipment${queryStr}`);
      return response.data;
    },
  });
};

export const useSingleGameEquipmentQuery = (id?: string) => {
  return useQuery<{ equipment: GameEquipment }>({
    queryKey: ['gameEquipment', id],
    queryFn: async () => {
      if (!id) throw new Error('Game equipment ID is required');
      const response = await apiClient.get(`/game-equipment/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateGameEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GameEquipmentPayload) => {
      const response = await apiClient.post('/game-equipment', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameEquipment'] });
    },
  });
};

export const useUpdateGameEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<GameEquipmentPayload> }) => {
      const response = await apiClient.patch(`/game-equipment/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameEquipment'] });
    },
  });
};

export const useDeleteGameEquipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/game-equipment/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameEquipment'] });
    },
  });
};
