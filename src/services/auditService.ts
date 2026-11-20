// src/services/auditService.ts
import { api } from "./api";
import type {
  AuditLogQueryParams,
  PaginatedAuditLogsResponse,
  AuditLogDetailResponse,
} from "../types/audit";

// 1. Listar y filtrar bitácoras de auditoría (GET /audit-logs)
export const getAuditLogs = async (
  params?: AuditLogQueryParams,
): Promise<PaginatedAuditLogsResponse> => {
  const response = await api.get<PaginatedAuditLogsResponse>("/audit-logs", {
    params,
  });
  return response.data;
};

// 2. Obtener el detalle de una bitácora por ID (GET /audit-logs/{id})
export const getAuditLogById = async (
  id: number | string,
): Promise<AuditLogDetailResponse> => {
  const response = await api.get<AuditLogDetailResponse>(`/audit-logs/${id}`);
  return response.data;
};
