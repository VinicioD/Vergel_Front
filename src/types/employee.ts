// src/types/employee.ts

export interface EmployeeRole {
  id: number;
  roleName: string;
}

export interface Employee {
  id: number;
  fullName: string;
  dui: string;
  address?: string;
  municipality?: string;
  department?: string;
  birthDate?: string; // Formato YYYY-MM-DD
  hireDate?: string; // Formato YYYY-MM-DD
  phone: string;
  active: boolean;
  roleName?: string; // Presente en el listado general
  role?: EmployeeRole; // Presente en el detalle individual
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeeQueryParams {
  search?: string;
  active?: boolean;
  role_id?: number;
  limit?: number;
  per_page?: number;
  page?: number;
}

export interface PaginatedEmployeesResponse {
  data: Employee[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface EmployeeDetailResponse {
  data: Employee;
}

export interface CreateEmployeePayload {
  full_name: string;
  role_id: number;
  dui?: string;
  address?: string;
  municipality?: string;
  department?: string;
  birth_date?: string; // Formato "YYYY-MM-DD"
  hire_date?: string; // Formato "YYYY-MM-DD"
  phone?: string;
  active?: boolean;
}

export interface UpdateEmployeePayload {
  full_name?: string;
  role_id?: number;
  dui?: string;
  address?: string;
  municipality?: string;
  department?: string;
  birth_date?: string;
  hire_date?: string;
  phone?: string;
  active?: boolean;
}

export interface UpdateEmployeeStatusPayload {
  active: boolean;
}
