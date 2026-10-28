import { api } from "./api";
import type {
  SubscriptionPlanResponse,
  SingleSubscriptionPlanResponse,
  SubscriptionPlanParams,
  CreateSubscriptionPlanDTO,
  UpdateSubscriptionPlanDTO,
  SubscriberResponse,
  SubscriberParams,
} from "../types/plan";

// 1. Listar y filtrar planes de suscripción paginados
export const getSubscriptionPlans = async (
  params?: SubscriptionPlanParams,
): Promise<SubscriptionPlanResponse> => {
  const response = await api.get<SubscriptionPlanResponse>(
    "/subscription-plans",
    { params },
  );
  return response.data;
};

// 2. Obtener detalle de un plan de suscripción por ID o código
export const getSubscriptionPlanById = async (
  id: number | string,
): Promise<SingleSubscriptionPlanResponse> => {
  const response = await api.get<SingleSubscriptionPlanResponse>(
    `/subscription-plans/${id}`,
  );
  return response.data;
};

// 3. Listar los clientes suscritos a un plan
export const getSubscriptionPlanSubscribers = async (
  planId: number | string,
  params?: SubscriberParams,
): Promise<SubscriberResponse> => {
  const response = await api.get<SubscriberResponse>(
    `/subscription-plans/${planId}/subscribers`,
    { params },
  );
  return response.data;
};

// 4. Crear un plan de suscripción
export const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanDTO,
): Promise<SingleSubscriptionPlanResponse> => {
  const response = await api.post<SingleSubscriptionPlanResponse>(
    "/subscription-plans",
    data,
  );
  return response.data;
};

// 5. Actualizar un plan de suscripción (PUT / PATCH)
export const updateSubscriptionPlan = async (
  id: number | string,
  data: UpdateSubscriptionPlanDTO,
): Promise<SingleSubscriptionPlanResponse> => {
  const response = await api.put<SingleSubscriptionPlanResponse>(
    `/subscription-plans/${id}`,
    data,
  );
  return response.data;
};

// 6. Eliminar un plan de suscripción (Soft delete)
export const deleteSubscriptionPlan = async (
  id: number | string,
): Promise<void> => {
  await api.delete(`/subscription-plans/${id}`);
};

// 7. Activar o desactivar un plan
export const toggleSubscriptionPlanStatus = async (
  id: number | string,
  active: boolean,
): Promise<SingleSubscriptionPlanResponse> => {
  const response = await api.patch<SingleSubscriptionPlanResponse>(
    `/subscription-plans/${id}/status`,
    { active },
  );
  return response.data;
};
