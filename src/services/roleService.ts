import { api } from "./api";
import type {
  CreateRolePayload,
  RoleDetailResponse,
  RoleListResponse,
  RoleQueryParams,
  UpdateRolePayload,
} from "../types/role";

export const getRoles = async (
  params?: RoleQueryParams,
): Promise<RoleListResponse> => {
  const { data } = await api.get<RoleListResponse>("/roles", { params });
  return data;
};

export const getRoleById = async (
  id: number | string,
): Promise<RoleDetailResponse> => {
  const { data } = await api.get<RoleDetailResponse>(`/roles/${id}`);
  return data;
};

export const createRole = async (
  payload: CreateRolePayload,
): Promise<RoleDetailResponse> => {
  const { data } = await api.post<RoleDetailResponse>("/roles", payload);
  return data;
};

export const updateRole = async (
  id: number | string,
  payload: UpdateRolePayload,
): Promise<RoleDetailResponse> => {
  const { data } = await api.put<RoleDetailResponse>(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id: number | string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};
