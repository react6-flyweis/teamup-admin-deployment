import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';
import type { AuditLogsQueryParams, AuditLogsResponse } from '@/types';

export const AUDIT_LOGS_QUERY_KEY = ['audit-logs'];

export const useAuditLogsQuery = (params?: AuditLogsQueryParams) => {
  return useQuery<AuditLogsResponse>({
    queryKey: [AUDIT_LOGS_QUERY_KEY, params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {};

      if (params?.page !== undefined) {
        cleanParams.page = params.page;
      }
      if (params?.limit !== undefined) {
        cleanParams.limit = params.limit;
      }
      if (params?.action && params.action !== 'all') {
        cleanParams.action = params.action;
      }
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      if (params?.entityType && params.entityType !== 'all') {
        cleanParams.entityType = params.entityType;
      }
      if (params?.fromDate) {
        cleanParams.fromDate = params.fromDate;
      }
      if (params?.toDate) {
        cleanParams.toDate = params.toDate;
      }

      const response = await apiClient.get<AuditLogsResponse>('/audit-logs', {
        params: cleanParams,
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds fresh cache
  });
};
