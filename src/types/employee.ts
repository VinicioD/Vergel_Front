export interface EmployeeApiUser {
  name?: string | null;
  email?: string | null;
}

export interface EmployeeApiRole {
  id?: number;
  name?: string | null;
}

export interface EmployeeApiRecord {
  id: number | string;
  code?: string | null;
  fullName?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: EmployeeApiRole | string | null;
  roleName?: string | null;
  role_id?: number | string | null;
  roleId?: number | string | null;
  user?: EmployeeApiUser | null;
  active?: boolean | number | string | null;
  status?: string | null;
  hireDate?: string | null;
  hire_date?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

export interface EmployeePaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface EmployeeCollectionResponse {
  data: EmployeeApiRecord[];
  meta?: EmployeePaginationMeta;
}
