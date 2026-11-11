import { api } from "./api";
import type {
  EmployeeApiRecord,
  EmployeeCollectionResponse,
} from "../types/employee";

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  password?: string;
  roleId: number;
}

type EmployeeResponse = EmployeeCollectionResponse | EmployeeApiRecord[];

const getEmployeesFromResponse = (
  response: EmployeeResponse,
): EmployeeCollectionResponse => {
  if (Array.isArray(response)) {
    return { data: response };
  }

  return response;
};

export const getEmployees = async (): Promise<EmployeeCollectionResponse> => {
  const response = await api.get<EmployeeResponse>("/employees");
  return getEmployeesFromResponse(response.data);
};

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
