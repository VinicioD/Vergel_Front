import { api } from "./api";
import type {
  PaginatedSuppliersResponse,
  SupplierDetailResponse,
  SupplierQueryParams,
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