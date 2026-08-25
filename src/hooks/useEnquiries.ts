import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface Enquiry {
  _id: string;
  enquiryType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  location?: string;
  message: string;
  status: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  reply?: string;
  __v?: number;
}

export interface EnquiriesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EnquiriesResponse {
  enquiries: Enquiry[];
  pagination: EnquiriesPagination;
}

export interface EnquiriesQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  enquiryType?: string;
  location?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useEnquiriesQuery = (params: EnquiriesQueryParams = {}) => {
  return useQuery<EnquiriesResponse>({
    queryKey: ['enquiries', params],
    queryFn: async () => {
      // Build clean query params object without empty string keys
      const cleanParams: Record<string, string | number> = {};
      
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.status && params.status !== 'all') cleanParams.status = params.status;
      if (params.enquiryType && params.enquiryType !== 'all') cleanParams.enquiryType = params.enquiryType;
      if (params.location && params.location !== 'all') cleanParams.location = params.location;
      if (params.search && params.search.trim() !== '') cleanParams.search = params.search.trim();
      if (params.fromDate) cleanParams.fromDate = params.fromDate;
      if (params.toDate) cleanParams.toDate = params.toDate;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await apiClient.get('/contact', {
        params: cleanParams,
      });
      return response.data;
    },
  });
};

export const useUpdateEnquiryStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/contact/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
};

export const useDeleteEnquiryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/contact/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
};
