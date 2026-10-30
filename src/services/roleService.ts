import { api } from "./api";
import type { Role, RolePayload } from "../types/role";

interface RoleCollectionResponse {
  data: Role[];
}

const getRolesFromResponse = (
  response: Role[] | RoleCollectionResponse,
): Role[] => (Array.isArray(response) ? response : response.data);

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[] | RoleCollectionResponse>("/roles");
  return getRolesFromResponse(response.data);
};

export const createRole = async (payload: RolePayload): Promise<Role> => {
  const response = await api.post<Role | { data: Role }>("/roles", payload);
  return "data" in response.data ? response.data.data : response.data;
};

export const updateRole = async (
  id: number,
  payload: RolePayload,
): Promise<Role> => {
  const response = await api.put<Role | { data: Role }>(`/roles/${id}`, payload);
  return "data" in response.data ? response.data.data : response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};