import { api } from "./api";
import type { SubscriptionPlan } from "../types/customer";

// Forma cruda que puede devolver Laravel (camelCase o snake_case)
interface RawSubscriptionPlan {
  id?: number;
  planCode?: string;
  plan_code?: string;
  planName?: string;
  plan_name?: string;
  name?: string;
}

const normalizePlan = (raw: RawSubscriptionPlan): SubscriptionPlan => ({
  id: Number(raw.id ?? 0),
  planCode: raw.planCode ?? raw.plan_code ?? "",
  planName: raw.planName ?? raw.plan_name ?? raw.name ?? "",
});

// GET /api/v1/subscription-plans — trae todos los planes disponibles
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get("/subscription-plans");
  const payload = response.data;

  const list: RawSubscriptionPlan[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];

  return list.map(normalizePlan);
};
