import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface LocationOpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Location {
  _id: string;
  name: string;
  slug?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  address: string;
  phone?: string;
  email?: string;
  openingHours?: LocationOpeningHour[];
  mapEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationsResponse {
  locations: Location[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useLocationsQuery = () => {
  return useQuery<LocationsResponse>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await apiClient.get('/locations');
      return response.data;
    },
  });
};

export const useLocationByIdQuery = (id?: string) => {
  return useQuery<{ location: Location }>({
    queryKey: ['location', id],
    queryFn: async () => {
      if (!id) throw new Error('Location ID is required');
      const response = await apiClient.get(`/locations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export interface CreateLocationPayload {
  name: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  address: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  openingHours?: LocationOpeningHour[];
  isActive?: boolean;
}

export interface UpdateLocationPayload {
  name?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  openingHours?: LocationOpeningHour[];
  isActive?: boolean;
}

export const useCreateLocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLocationPayload) => {
      const response = await apiClient.post('/locations', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useUpdateLocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ locationId, payload }: { locationId: string; payload: UpdateLocationPayload }) => {
      const response = await apiClient.patch(`/locations/${locationId}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.locationId] });
    },
  });
};

export const useDeleteLocationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (locationId: string) => {
      const response = await apiClient.delete(`/locations/${locationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};


