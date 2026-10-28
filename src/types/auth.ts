export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string; // 'admin', 'recepcionist', 'technical', etc.
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
  role?: Role | string; // Opcional por si viene anidado en el empleado
}

export interface User {
  id: number;
  name: string;
  email: string;
  employee_id: number;
  role_id?: number;
  created_at: string;
  updated_at: string;
  role?: string | Role; // 👈 Agregamos 'role' directamente al usuario
  employee?: Employee;
}

export interface LoginResponse {
  message?: string;
  data?: {
    user?: Partial<User>;
    access_token?: string;
    token?: string;
    token_type?: string;
  };
  user?: Partial<User>;
  access_token?: string;
  token?: string;
  token_type?: string;
}
