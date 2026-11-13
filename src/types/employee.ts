// Tipos para colaboradores/empleados del backend

export interface EmployeeListItem {
  id: number;
  fullName: string;
  roleName: string;
  active: boolean;
}

// Tipos adicionales para las respuestas de Laravel y el CRUD
export interface EmployeeApiRecord {
  id: number;
  full_name?: string;
  fullName?: string;
  name?: string;
  email: string;
  active?: boolean;
  role?: { name?: string } | string;
  role_name?: string;
  roleName?: string;
}

export interface EmployeeCollectionResponse {
  data: EmployeeApiRecord[] | EmployeeListItem[];
  [key: string]: any; // Para paginación u otras propiedades de Laravel (links, meta, etc.)
}
