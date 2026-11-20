// src/services/inspectionService.ts
import { api } from "./api";
import type {
  CreateInspectionPayload,
  InspectionResponse,
  InspectionStatus,
  UpdateInspectionPayload,
  UploadInspectionPhotosPayload,
} from "../types/inspection";

function appendInspectionFormData(
  formData: FormData,
  payload: CreateInspectionPayload | UpdateInspectionPayload,
): FormData {
  const scalarEntries: [string, string | number | undefined][] = [
    ["customer_id", payload.customer_id],
    ["appointment_id", payload.appointment_id],
    ["employee_id", payload.employee_id],
    ["inspection_date", payload.inspection_date],
    ["findings", payload.findings],
    ["terrain_width", payload.terrain_width],
    ["terrain_length", payload.terrain_length],
    ["total_area", payload.total_area],
    ["area_unit", payload.area_unit],
    ["terrain_notes", payload.terrain_notes],
    ["status", payload.status],
  ];

  for (const [key, value] of scalarEntries) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }

  if (payload.services && payload.services.length > 0) {
    payload.services.forEach((service, index) => {
      formData.append(
        `services[${index}][service_id]`,
        String(service.service_id),
      );
      formData.append(
        `services[${index}][suggested_quantity]`,
        String(service.suggested_quantity),
      );
      if (service.notes !== undefined && service.notes !== null) {
        formData.append(`services[${index}][notes]`, service.notes);
      }
    });
  }

  if (payload.photos && payload.photos.length > 0) {
    payload.photos.forEach((file) => {
      formData.append("photos[]", file);
    });
  }

  if (payload.photos_data && payload.photos_data.length > 0) {
    payload.photos_data.forEach((item, index) => {
      if (item.caption !== undefined && item.caption !== null) {
        formData.append(`photos_data[${index}][caption]`, item.caption);
      }
      if (item.file) {
        formData.append(`photos_data[${index}][file]`, item.file);
      }
    });
  }

  return formData;
}

// 1. Registrar inspección de campo (POST /inspections)
export const createInspection = async (
  payload: CreateInspectionPayload,
): Promise<InspectionResponse> => {
  const formData = appendInspectionFormData(new FormData(), payload);
  const response = await api.post<InspectionResponse>(
    "/inspections",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

// 2. Actualizar inspección de campo (PUT /inspections/{id})
export const updateInspection = async (
  id: number | string,
  payload: UpdateInspectionPayload,
): Promise<InspectionResponse> => {
  const formData = appendInspectionFormData(new FormData(), payload);
  const response = await api.put<InspectionResponse>(
    `/inspections/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

// 3. Eliminar inspección técnica (DELETE /inspections/{id})
export const deleteInspection = async (id: number | string): Promise<void> => {
  await api.delete(`/inspections/${id}`);
};

// 4. Cambiar estado de la inspección (PATCH /inspections/{inspection}/status)
export const updateInspectionStatus = async (
  inspectionId: number | string,
  status: InspectionStatus,
): Promise<InspectionResponse> => {
  const response = await api.patch<InspectionResponse>(
    `/inspections/${inspectionId}/status`,
    { status },
  );
  return response.data;
};

// 5. Subir fotos adicionales a la inspección (POST /inspections/{inspection}/photos)
export const uploadInspectionPhotos = async (
  inspectionId: number | string,
  payload: UploadInspectionPhotosPayload,
): Promise<InspectionResponse> => {
  const formData = new FormData();

  if (payload.photos && payload.photos.length > 0) {
    payload.photos.forEach((file) => {
      formData.append("photos[]", file);
    });
  }

  if (payload.photos_data && payload.photos_data.length > 0) {
    payload.photos_data.forEach((item, index) => {
      if (item.caption !== undefined && item.caption !== null) {
        formData.append(`photos_data[${index}][caption]`, item.caption);
      }
      if (item.file) {
        formData.append(`photos_data[${index}][file]`, item.file);
      }
    });
  }

  const response = await api.post<InspectionResponse>(
    `/inspections/${inspectionId}/photos`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

// 6. Eliminar foto de inspección (DELETE /inspections/{inspection}/photos/{photo})
export const deleteInspectionPhoto = async (
  inspectionId: number | string,
  photoId: number | string,
): Promise<void> => {
  await api.delete(`/inspections/${inspectionId}/photos/${photoId}`);
};
