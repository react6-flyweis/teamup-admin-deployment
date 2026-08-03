import { useQuery } from '@tanstack/react-query';
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

export const useGameEquipmentQuery = () => {
  return useQuery<GameEquipmentResponse>({
    queryKey: ['gameEquipment'],
    queryFn: async () => {
      const response = await apiClient.get('/game-equipment');
      return response.data;
    },
  });
};
