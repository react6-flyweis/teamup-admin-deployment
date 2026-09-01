import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface Booking {
  id: string;
  _id?: string;
  userName: string;
  bookingDate: string;
  timeSlot: string;
  status: string;
  amount: number;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  game?: {
    _id: string;
    name: string;
  };
  location?: {
    _id: string;
    name: string;
  };
  guestsCount?: number;
  totalPrice?: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  locationId?: string;
  gameId?: string;
}

export const useBookingsQuery = (params: BookingsQueryParams = {}) => {
  return useQuery<BookingsResponse>({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {};
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== 'All' && params.status !== 'all') cleanParams.status = params.status;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.locationId) cleanParams.locationId = params.locationId;
      if (params.gameId) cleanParams.gameId = params.gameId;

      const response = await apiClient.get('/bookings', { params: cleanParams });
      return response.data;
    },
    retry: 1,
  });
};

export const useBookingByIdQuery = (id?: string) => {
  return useQuery<{ booking: Booking }>({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) throw new Error('Booking ID is required');
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useBookingRedirectUrlQuery = () => {
  return useQuery<{ redirectUrl: string }>({
    queryKey: ['booking-redirect-url'],
    queryFn: async () => {
      const response = await apiClient.get('/bookings/redirect-url');
      return response.data;
    },
  });
};

export const useUpdateBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Booking> }) => {
      const response = await apiClient.patch(`/bookings/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useDeleteBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/bookings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
