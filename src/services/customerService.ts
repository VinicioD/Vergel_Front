import { api } from "./api";
import type {
  PaginatedCustomersResponse,
  CustomerQueryParams,
  CustomerDetailResponse,
} from "../types/customer";

export interface CreateCustomerPayload {
  legal_name: string;
  trade_name?: string;
  tax_id?: string;
  nrc?: string;
  economic_activity?: string;
  address: string;
  department?: string;
  municipality: string;
  phone: string;
  email?: string;
  visit_frequency_value?: number;
  visit_frequency_unit?: string;
  current_plan_id?: number;
}

export interface UpdateCustomerPayload {
  legal_name: string;
  trade_name?: string;
  tax_id?: string;
  nrc?: string;
  economic_activity?: string;
  address: string;
  department?: string;
  municipality: string;
  phone: string;
  email?: string;
  visit_frequency_value?: number;
  visit_frequency_unit?: string;
}

// 1. Obtener lista de clientes
export const getCustomers = async (
  params?: CustomerQueryParams,
): Promise<PaginatedCustomersResponse> => {
  const response = await api.get<PaginatedCustomersResponse>("/customers", {
    params,
  });
  return response.data;
};

// 2. Obtener detalle de cliente por ID
export const getCustomerById = async (
  id: number | string,
): Promise<CustomerDetailResponse> => {
  const response = await api.get<CustomerDetailResponse>(`/customers/${id}`);
  return response.data;
};

// 3. Registrar un nuevo cliente (POST /customers)
export const createCustomer = async (payload: CreateCustomerPayload) => {
  const response = await api.post("/customers", payload);
  return response.data;
};

// 4. Actualizar información de cliente (PUT /customers/{id})
export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload,
) => {
  const response = await api.put(`/customers/${id}`, payload);
  return response.data;
};

// 5. Eliminar cliente (DELETE /customers/{id})
export const deleteCustomer = async (id: number) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// 6. Inactivar / Cambiar estado (PATCH /customers/{id}/status)
export const updateCustomerStatus = async (
  id: number,
  status: "active" | "inactive",
) => {
  const response = await api.patch(`/customers/${id}/status`, {
    status,
  });
  return response.data;
};

// 7. Cambiar el plan de suscripción (POST /customers/{id}/plan)
export const updateCustomerPlan = async (id: number, planId: number) => {
  const response = await api.post(`/customers/${id}/plan`, {
    plan_id: planId,
  });
  return response.data;
};

// 8. Obtener historial de planes (GET /customers/{id}/plan-history)
export const getCustomerPlanHistory = async (id: number) => {
  const response = await api.get(`/customers/${id}/plan-history`);
  return response.data;
};
