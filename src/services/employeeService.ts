import { api } from "./api";
import type { EmployeeListItem } from "../types/employee";

// Forma cruda que puede devolver Laravel (snake_case o camelCase)
interface RawEmployee {
  id?: number;
  full_name?: string;
  fullName?: string;
  name?: string;
  active?: boolean;
  role?: { name?: string } | string;
  role_name?: string;
  roleName?: string;
}

const normalizeEmployee = (raw: RawEmployee): EmployeeListItem => {
  const role =
    typeof raw.role === "string"
      ? raw.role
      : raw.role?.name ?? raw.role_name ?? raw.roleName ?? "";

  return {
    id: Number(raw.id ?? 0),
    fullName: raw.full_name ?? raw.fullName ?? raw.name ?? "Colaborador",
    roleName: role,
    active: raw.active !== false,
  };
};

// GET /employees — trae los colaboradores disponibles para asignar citas
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
