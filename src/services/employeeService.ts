import { api } from "./api";
import type {
  EmployeeListItem,
  EmployeeCollectionResponse,
} from "../types/employee";

// 1. Tipos de datos para el payload de creación/actualización (de developer)
export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  password?: string;
  roleId: number;
}

// 2. Forma cruda que puede devolver Laravel (de feat-agenda)
interface RawEmployee {
  id?: number;
  full_name?: string;
  fullName?: string;
  name?: string;
  active?: boolean;
  role?: { name?: string } | string;
  role_name?: string;
  roleName?: string;
  email?: string;
}

// 3. Función de normalización adaptada (de feat-agenda)
const normalizeEmployee = (raw: RawEmployee): EmployeeListItem => {
  const role =
    typeof raw.role === "string"
      ? raw.role
      : (raw.role?.name ?? raw.role_name ?? raw.roleName ?? "");

  return {
    id: Number(raw.id ?? 0),
    fullName: raw.full_name ?? raw.fullName ?? raw.name ?? "Colaborador",
    roleName: role,
    active: raw.active !== false,
    email: raw.email ?? "",
  } as EmployeeListItem;
};

// 4. GET /employees — Con soporte para traer todos ({ params: { all: true } }) y normalización
export const getEmployees = async (): Promise<EmployeeListItem[]> => {
  const response = await api.get("/employees", { params: { all: true } });
  const payload = response.data;

  const list: RawEmployee[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];

  return list.map(normalizeEmployee).filter((employee) => employee.id > 0);
};

// 5. Métodos CRUD (de developer)
export const createEmployee = async (payload: CreateEmployeePayload) => {
  const response = await api.post("/employees", payload);
  return response.data;
};

export const updateEmployee = async (
  id: string | number,
  payload: CreateEmployeePayload,
) => {
  const response = await api.put(`/employees/${id}`, payload);
  return response.data;
};

export const deleteEmployee = async (id: string | number) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};
