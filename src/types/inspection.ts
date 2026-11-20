// src/types/inspection.ts

export type InspectionStatus = "draft" | "submitted" | "reviewed";

export type TerrainAreaUnit = "m2" | "v2" | "ha" | string;

export interface SuggestedServiceInput {
  service_id: number;
  suggested_quantity: number;
  notes?: string;
}

export interface InspectionPhotoInput {
  file?: File;
  caption?: string;
}

export interface InspectionPhoto {
  id: number | string;
  url?: string;
  path?: string;
  caption?: string | null;
  createdAt?: string;
}

export interface InspectionSuggestedService {
  id?: number;
  serviceId?: number;
  service_id?: number;
  suggestedQuantity?: number;
  suggested_quantity?: number;
  notes?: string | null;
  service?: {
    id: number;
    name: string;
  } | null;
}

export interface Inspection {
  id: number | string;
  customerId?: number;
  customer_id?: number;
  appointmentId?: number | null;
  appointment_id?: number | null;
  employeeId?: number | null;
  employee_id?: number | null;
  inspectionDate?: string;
  inspection_date?: string;
  findings?: string | null;
  terrainWidth?: number | null;
  terrain_width?: number | null;
  terrainLength?: number | null;
  terrain_length?: number | null;
  totalArea?: number | null;
  total_area?: number | null;
  areaUnit?: TerrainAreaUnit | null;
  area_unit?: TerrainAreaUnit | null;
  terrainNotes?: string | null;
  terrain_notes?: string | null;
  status: InspectionStatus;
  services?: InspectionSuggestedService[];
  photos?: InspectionPhoto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInspectionPayload {
  customer_id: number;
  appointment_id?: number;
  employee_id?: number;
  inspection_date: string; // Formato YYYY-MM-DD
  findings?: string;
  terrain_width?: number;
  terrain_length?: number;
  total_area?: number;
  area_unit?: TerrainAreaUnit;
  terrain_notes?: string;
  status?: InspectionStatus;
  services?: SuggestedServiceInput[];
  photos?: File[];
  photos_data?: InspectionPhotoInput[];
}

export interface UpdateInspectionPayload {
  customer_id?: number;
  appointment_id?: number;
  employee_id?: number;
  inspection_date?: string;
  findings?: string;
  terrain_width?: number;
  terrain_length?: number;
  total_area?: number;
  area_unit?: TerrainAreaUnit;
  terrain_notes?: string;
  status?: InspectionStatus;
  services?: SuggestedServiceInput[];
  photos?: File[];
  photos_data?: InspectionPhotoInput[];
}

export interface UploadInspectionPhotosPayload {
  photos?: File[];
  photos_data?: InspectionPhotoInput[];
}

export interface InspectionResponse {
  data: Inspection;
  message?: string;
}
