export interface Role {
  id: number;
  roleName: string;
  description: string | null;
  employeesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleQueryParams {
  search?: string;
  limit?: number;
  page?: number;
}

export interface CreateRolePayload {
  role_name: string;
  description?: string | null;
}

export interface UpdateRolePayload {
  role_name?: string;
  description?: string | null;
}

export interface RolePaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface RolePaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface RoleListResponse {
  data: Role[];
  links?: RolePaginationLinks;
  meta?: RolePaginationMeta;
}

export interface RoleDetailResponse {
  data: Role;
}
