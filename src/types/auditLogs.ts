export interface AuditLogUser {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

export interface AuditLogEntity {
  type: string;
  id: string;
}

export interface AuditLogMetadata {
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface AuditLogItem {
  id: string;
  user: AuditLogUser;
  action: string;
  entity: AuditLogEntity;
  changes?: Record<string, unknown>;
  metadata?: AuditLogMetadata;
  timestamp: string;
}

export interface AuditLogsResponse {
  total: number;
  logs: AuditLogItem[];
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}
