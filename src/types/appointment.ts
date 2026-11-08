// src/types/appointment.ts

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "annulled";

export interface AppointmentCustomer {
  id: number;
  legalName: string;
  tradeName?: string | null;
  phone: string;
  address: string;
  municipality: string;
  department: string;
  email: string;
}

export interface AppointmentEmployee {
  id: number;
  fullName: string;
}

export interface AppointmentService {
  id: number;
  name: string;
  price: number;
}

export interface Appointment {
  id: number;
  customerId: number;
  customer: AppointmentCustomer;
  employeeId: number;
  employee: AppointmentEmployee;
  serviceId: number;
  service: AppointmentService;
  quoteId?: number | null;
  appointmentDate: string; // Formato AAAA-MM-DD
  appointmentTime: string; // Formato HH:mm
  status: AppointmentStatus;
  origin: string;
  notes?: string | null;
  isInspection?: boolean;
  is_inspection?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentQueryParams {
  start_date?: string;
  end_date?: string;
  date?: string;
  status?: AppointmentStatus;
  client_id?: number;
  customer_id?: number;
  employee_id?: number;
  service_id?: number;
  sort_by?:
    | "id"
    | "appointment_date"
    | "appointment_time"
    | "status"
    | "created_at";
  sort_direction?: "asc" | "desc";
  per_page?: number;
  limit?: number;
  all?: boolean;
}

export interface PaginatedAppointmentsResponse {
  data: Appointment[];
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from?: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to?: number | null;
    total: number;
  };
}

export interface AppointmentDetailResponse {
  data: Appointment;
}

// Sub-interfaz para crear un cliente nuevo directamente al agendar
export interface NewAppointmentCustomerPayload {
  legal_name: string;
  phone: string;
  address: string;
  municipality: string;
  department?: string;
  email?: string;
}

export interface CreateAppointmentPayload {
  customer_id?: number;
  customer?: NewAppointmentCustomerPayload;
  employee_id: number;
  service_id?: number;
  appointment_date: string; // "AAAA-MM-DD"
  appointment_time: string; // "HH:MM"
  status?: AppointmentStatus;
  notes?: string;
  is_inspection?: boolean;
}

export interface UpdateAppointmentPayload {
  employee_id?: number;
  service_id?: number | null;
  appointment_date?: string;
  appointment_time?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface CreateAppointmentFromQuotePayload {
  employee_id: number;
  service_id?: number;
  appointment_date: string;
  appointment_time: string;
  status?: AppointmentStatus;
  notes?: string;
  is_inspection?: boolean;
}
