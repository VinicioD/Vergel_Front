// src/services/employeeService.ts
import { api } from "./api";
import type {
  PaginatedEmployeesResponse,
  EmployeeQueryParams,
  EmployeeDetailResponse,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  UpdateEmployeeStatusPayload,
  Employee,
} from "../types/employee";

// 1. Listar y filtrar empleados (GET /employees)
export const getEmployees = async (
  params?: EmployeeQueryParams,
): Promise<PaginatedEmployeesResponse> => {
  const response = await api.get<PaginatedEmployeesResponse>("/employees", {
    params,
  });
  return response.data;
};

// 2. Obtener el detalle de un empleado por ID (GET /employees/{id})
export const getEmployeeById = async (
  id: number | string,
): Promise<EmployeeDetailResponse> => {
  const response = await api.get<EmployeeDetailResponse>(`/employees/${id}`);
  return response.data;
};

// 3. Registrar un nuevo empleado (POST /employees)
export const createEmployee = async (
  payload: CreateEmployeePayload,
): Promise<{ data: Employee }> => {
  const response = await api.post<{ data: Employee }>("/employees", payload);
  return response.data;
};

// 4. Actualizar un empleado (PUT /employees/{id})
export const updateEmployee = async (
  id: number | string,
  payload: UpdateEmployeePayload,
): Promise<{ data: Employee }> => {
  const response = await api.put<{ data: Employee }>(
    `/employees/${id}`,
    payload,
  );
  return response.data;
};

// 5. Eliminar un empleado (Soft Delete) (DELETE /employees/{id})
export const deleteEmployee = async (id: number | string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};

// 6. Activar o desactivar un empleado (PATCH /employees/{id}/status)
export const updateEmployeeStatus = async (
  id: number | string,
  payload: UpdateEmployeeStatusPayload,
): Promise<{ data: Employee }> => {
  const response = await api.patch<{ data: Employee }>(
    `/employees/${id}/status`,
    payload,
  );
  return response.data;
};
