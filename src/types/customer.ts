// Tipo para un cliente en el listado
export interface CustomerListItem {
  id: number;
  legalName: string;
  tradeName: string;
  taxId: string;
  nrc: string;
  address?: string;
  municipality?: string;
  email?: string;
  phone: string;
  status: "active" | "inactive" | string;
  currentPlanName: string;
  cashBalance: number;
  loyaltyPoints: number;
  createdAt: string;
}

// Tipo para el detalle completo de un cliente
export interface CustomerDetail {
  id: number;
  legalName: string;
  tradeName: string;
  taxId: string;
  nrc: string;
  economicActivity: string;
  address: string;
  municipality: string;
  department: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | string;
  visitFrequency: {
    value: number;
    unit: string;
  };
  currentPlan: {
    id: number;
    planCode: string;
    planName: string;
  };
  wallet: {
    cashBalance: number;
    reservedSubscriptionBalance: number;
  };
  loyaltyPoints: {
    pointsBalance: number;
  };
  createdAt: string;
}

// Parámetros opcionales de búsqueda para la consulta GET
export interface CustomerQueryParams {
  search?: string;
  status?: string;
  phone?: string;
  desde?: string; // Formato AAAA-MM-DD
  hasta?: string; // Formato AAAA-MM-DD
  limit?: number;
  page?: number;
}

// Estructura de la respuesta paginada de Laravel
export interface PaginatedCustomersResponse {
  data: CustomerListItem[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Respuesta individual de detalle
export interface CustomerDetailResponse {
  data: CustomerDetail;
}

// Plan de suscripción disponible (GET /subscription-plans)
export interface SubscriptionPlan {
  id: number;
  planCode: string;
  planName: string;
}

import type { ClientData } from "../components/clients/Form";

// Tipo flexible para clientType que acepta "Residencial", "Corporativo" o cualquier plan del backend
export type ClientType = "Residencial" | "Corporativo" | string;

export interface Client extends Omit<ClientData, "status"> {
  id: number;
  name: string;
  initials: string;
  clientType: ClientType;
  status: "Activo" | "Inactivo";
}

export interface ClientsViewProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
  canDelete?: boolean;
}
