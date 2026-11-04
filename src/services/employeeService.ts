import { api } from "./api";
import type {
  EmployeeApiRecord,
  EmployeeCollectionResponse,
} from "../types/employee";

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
