export interface EmployeeApiUser {
  name?: string | null;
  email?: string | null;
}

export interface EmployeeApiRole {
  name?: string | null;
}

export interface EmployeeApiRecord {
  id: number | string;
  code?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: EmployeeApiRole | string | null;
  user?: EmployeeApiUser | null;
  active?: boolean | number | string | null;
  status?: string | null;
  hire_date?: string | null;
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
