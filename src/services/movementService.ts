import { api } from "./api";
import type { MovementQueryParams, PaginatedMovementsResponse } from "../types/movement";

export const getMovements = async (
  params?: MovementQueryParams,
): Promise<PaginatedMovementsResponse> => {
  const response = await api.get<PaginatedMovementsResponse>("/movements", { params });
  return response.data;
};
