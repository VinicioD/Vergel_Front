// src/types/audit.ts

export type AuditAction = "insert" | "update" | "delete" | "restore" | "denied";

export type AuditSnapshot = Record<string, unknown> | null;

export interface AuditActor {
  employeeId?: number | null;
  fullName?: string | null;
  role?: string | null;
  userId?: number | null;
  email?: string | null;
}

export interface AuditLog {
  id: number;
  action: AuditAction;
  affectedTable: string;
  affectedRecordId: number | string | null;
  oldData?: AuditSnapshot;
  newData?: AuditSnapshot;
  ipAddress?: string | null;
  createdAt: string;
  actor?: AuditActor | null;
}

export interface AuditLogQueryParams {
  user_id?: number;
  employee_id?: number;
  action?: AuditAction;
  table_name?: string;
  affected_table?: string;
  affected_record_id?: number;
  start_date?: string; // Formato YYYY-MM-DD
  end_date?: string; // Formato YYYY-MM-DD
  desde?: string; // Alias de start_date (YYYY-MM-DD)
  hasta?: string; // Alias de end_date (YYYY-MM-DD)
  limit?: number; // 1 - 100
  per_page?: number; // 1 - 100
  page?: number;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from?: number | null;
    last_page: number;
    path?: string;
    per_page: number;
    to?: number | null;
    total: number;
  };
}

export interface AuditLogDetailResponse {
  data: AuditLog;
}
