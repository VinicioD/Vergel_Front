import { api } from "./api";
import type { Role, RolePayload } from "../types/role";

interface RoleCollectionResponse {
  data: Role[] | { data: Role[] };
}

const getRoleName = (role: Role): string =>
  role.name || role.role_name || role.roleName || role.title || "Sin nombre";

const getRolesFromResponse = (
  response: Role[] | RoleCollectionResponse,
): Role[] => {
  const roles = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : response.data.data;

  return roles.map((role) => ({
    ...role,
    name: getRoleName(role),
    description: role.description || null,
  }));
};

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