import { api } from "./api";
import type {
  PaginatedSuppliersResponse,
  SupplierPayload,
  SupplierDetailResponse,
  SupplierQueryParams,
  SupplierStatus,
} from "../types/supplier";

export const getSuppliers = async (
  params?: SupplierQueryParams,
): Promise<PaginatedSuppliersResponse> => {
  const response = await api.get<PaginatedSuppliersResponse>("/suppliers", {
    params,
  });
  return response.data;
};

export const getSupplierById = async (
  id: number | string,
): Promise<SupplierDetailResponse> => {
  const response = await api.get<SupplierDetailResponse>(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (payload: SupplierPayload) => {
  const response = await api.post("/suppliers", payload);
  return response.data;
};

export const updateSupplier = async (
  id: number | string,
  payload: Partial<SupplierPayload>,
) => {
  const response = await api.put(`/suppliers/${id}`, payload);
  return response.data;
};

export const deleteSupplier = async (id: number | string) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

export const updateSupplierStatus = async (
  id: number | string,
  status: SupplierStatus,
) => {
  const response = await api.patch(`/suppliers/${id}/status`, { status });
  return response.data;
};