// src/types/auth.ts

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Employee {
  id: number;
  full_name: string;
  role_id: number;
  dui?: string | null;
  address?: string | null;
  municipality?: string | null;
  department?: string | null;
  birth_date?: string | null;
  hire_date?: string | null;
  phone?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  employee_id: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}
