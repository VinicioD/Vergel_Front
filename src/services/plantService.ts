import { api } from "./api";
import type {
  PaginatedPlantsResponse,
  PlantQueryParams,
  PlantDetailResponse,
  CreatePlantPayload,
  UpdatePlantPayload,
} from "../types/plant";

// ==================== CONSULTAS (GET) ====================

export const getPlants = async (
  params?: PlantQueryParams,
): Promise<PaginatedPlantsResponse> => {
  const response = await api.get<PaginatedPlantsResponse>("/plants", {
    params,
  });
  return response.data;
};

export const getPlantById = async (
  id: number | string,
): Promise<PlantDetailResponse> => {
  const response = await api.get<PlantDetailResponse>(`/plants/${id}`);
  return response.data;
};

// ==================== ESCRITURA (POST, PUT, DELETE) ====================

// 1. Registrar nueva planta (POST /plants con FormData)
export const createPlant = async (payload: CreatePlantPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("price", String(payload.price));

  if (payload.category_type) {
    formData.append("category_type", payload.category_type);
  }
  if (payload.active !== undefined) {
    formData.append("active", payload.active ? "1" : "0");
  }
  if (payload.image) {
    formData.append("image", payload.image);
  }
  if (payload.image_url) {
    formData.append("image_url", payload.image_url);
  }

  console.log("=== POST /plants (crear planta) ===");
  formData.forEach((value, key) => {
    if (value instanceof File) {
      console.log(`  ${key}:`, {
        nombre: value.name,
        tipo: value.type,
        tamanoKB: Number((value.size / 1024).toFixed(2)),
      });
    } else {
      console.log(`  ${key}:`, value);
    }
  });

  const response = await api.post("/plants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const createdPlant = response.data?.data ?? response.data;
  console.log("Respuesta al crear planta:", response.data);
  console.log(
    "URL de imagen guardada:",
    createdPlant?.imageUrl ??
      createdPlant?.image_url ??
      createdPlant?.imagePath ??
      "El backend no devolvió una URL de imagen",
  );

  return response.data;
};

// 2. Actualizar planta (PUT /plants/{id} con FormData)
// Nota: Laravel a veces requiere _method="PUT" cuando se usa POST/multipart,
// pero tu documentación indica PUT directo. Si te da problemas de validación con archivos,
// puedes cambiar a api.post(`/plants/${id}`, formData) con un formData.append("_method", "PUT")
export const updatePlant = async (
  id: number | string,
  payload: UpdatePlantPayload,
) => {
  const formData = new FormData();

  if (payload.name) formData.append("name", payload.name);
  if (payload.price !== undefined)
    formData.append("price", String(payload.price));
  if (payload.category_type)
    formData.append("category_type", payload.category_type);
  if (payload.active !== undefined)
    formData.append("active", payload.active ? "1" : "0");
  if (payload.remove_image !== undefined) {
    formData.append("remove_image", payload.remove_image ? "1" : "0");
  }
  if (payload.image) formData.append("image", payload.image);
  if (payload.image_url) formData.append("image_url", payload.image_url);

  const response = await api.put(`/plants/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 3. Eliminar planta (DELETE /plants/{id})
export const deletePlant = async (id: number | string) => {
  const response = await api.delete(`/plants/${id}`);
  return response.data;
};
