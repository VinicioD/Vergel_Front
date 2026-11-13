// src/services/appointmentService.ts
import { api } from "./api";
import type {
  PaginatedAppointmentsResponse,
  AppointmentQueryParams,
  AppointmentDetailResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  CreateAppointmentFromQuotePayload,
  Appointment,
} from "../types/appointment";

// 1. Listar y filtrar citas (GET /appointments)
export const getAppointments = async (
  params?: AppointmentQueryParams,
): Promise<PaginatedAppointmentsResponse> => {
  const response = await api.get<PaginatedAppointmentsResponse>(
    "/appointments",
    {
      params,
    },
  );
  return response.data;
};

// 2. Obtener el detalle de una cita por ID (GET /appointments/{id})
export const getAppointmentById = async (
  id: number | string,
): Promise<AppointmentDetailResponse> => {
  const response = await api.get<AppointmentDetailResponse>(
    `/appointments/${id}`,
  );
  return response.data;
};

// 3. Agendar cita manualmente (POST /appointments)
export const createAppointment = async (
  payload: CreateAppointmentPayload,
): Promise<{ data: Appointment }> => {
  const response = await api.post<{ data: Appointment }>(
    "/appointments",
    payload,
  );
  return response.data;
};

// 4. Actualizar o reprogramar una cita (PUT /appointments/{id})
export const updateAppointment = async (
  id: number | string,
  payload: UpdateAppointmentPayload,
): Promise<{ data: Appointment }> => {
  const response = await api.put<{ data: Appointment }>(
    `/appointments/${id}`,
    payload,
  );
  return response.data;
};

// 5. Agendar cita desde una cotización (POST /quotes/{quoteId}/appointments)
export const createAppointmentFromQuote = async (
  quoteId: number | string,
  payload: CreateAppointmentFromQuotePayload,
): Promise<{ data: Appointment }> => {
  const response = await api.post<{ data: Appointment }>(
    `/quotes/${quoteId}/appointments`,
    payload,
  );
  return response.data;
};

// 6. Eliminar una cita: el backend no expone DELETE, así que se anula por estado.
export const deleteAppointment = async (
  id: number | string,
): Promise<{ data: Appointment }> => {
  const response = await api.patch<{ data: Appointment }>(`/appointments/${id}`, {
    status: "annulled",
  });
  return response.data;
};
