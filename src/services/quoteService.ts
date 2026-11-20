import { isAxiosError } from "axios";
import { api } from "./api";
import type {
  CreateQuotePayload,
  PaginatedQuotesResponse,
  Quote,
  QuoteQueryParams,
  UpdateQuotePayload,
} from "../types/quote";

interface UnknownRecord {
  [key: string]: unknown;
}

const record = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const readText = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;

const readNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const unwrapData = (value: unknown) => {
  let current = value;
  for (let depth = 0; depth < 3; depth += 1) {
    const wrapper = record(current);
    if (wrapper.data != null) {
      current = wrapper.data;
    } else if (wrapper.quote != null) {
      current = wrapper.quote;
    } else {
      break;
    }
  }
  return current;
};

const normalizeItem = (value: unknown) => {
  const item = record(value);
  const itemType = readText(item.item_type ?? item.itemType ?? item.type);
  const service = record(item.service);
  const plant = record(item.plant);
  const name =
    readText(item.name) ||
    readText(service.name) ||
    readText(plant.name);

  return {
    id: item.id == null ? undefined : readNumber(item.id),
    itemType: itemType === "plant" || item.plant_id != null || item.plantId != null || item.plant
      ? ("plant" as const)
      : ("service" as const),
    serviceId: item.service_id == null && item.serviceId == null && service.id == null
      ? undefined
      : readNumber(item.service_id ?? item.serviceId ?? service.id),
    plantId: item.plant_id == null && item.plantId == null && plant.id == null
      ? undefined
      : readNumber(item.plant_id ?? item.plantId ?? plant.id),
    name,
    quantity: readNumber(item.quantity),
    unitPrice: readNumber(item.unit_price ?? item.unitPrice),
    total: readNumber(item.total ?? item.line_total),
  };
};

const normalizeQuote = (value: unknown): Quote => {
  const quote = record(value);
  const customer = record(quote.customer);
  const plan = record(quote.applied_plan ?? quote.appliedPlan ?? quote.subscription_plan ?? quote.subscriptionPlan);
  const employee = record(quote.employee);
  const itemsValue = Array.isArray(quote.items)
    ? quote.items
    : Array.isArray(quote.quote_items)
      ? quote.quote_items
      : [];
  const statusValue = readText(quote.status, "pending");

  return {
    id: readNumber(quote.id),
    code: readText(quote.code ?? quote.quote_code ?? `COT-${quote.id ?? ""}`),
    customerId:
      quote.customer_id == null && quote.customerId == null && customer.id == null
        ? null
        : readNumber(quote.customer_id ?? quote.customerId ?? customer.id),
    customerName:
      readText(customer.legal_name ?? customer.legalName) ||
      readText(customer.trade_name ?? customer.tradeName) ||
      readText(quote.customer_name ?? quote.customerName, "Sin cliente"),
    appliedPlanId:
      quote.applied_plan_id == null && quote.appliedPlanId == null && quote.subscription_plan_id == null && plan.id == null
        ? null
        : readNumber(quote.applied_plan_id ?? quote.appliedPlanId ?? quote.subscription_plan_id ?? plan.id),
    planName:
      readText(plan.plan_name ?? plan.planName) ||
      readText(quote.plan_name ?? quote.planName),
    employeeId:
      quote.employee_id == null && quote.employeeId == null
        ? null
        : readNumber(quote.employee_id ?? quote.employeeId),
    employeeName:
      readText(employee.full_name ?? employee.fullName) ||
      readText(quote.employee_name ?? quote.employeeName),
    includesVat: Boolean(quote.includes_vat ?? quote.includesVat),
    loyaltyPointsUsed: readNumber(quote.loyalty_points_used ?? quote.loyaltyPointsUsed),
    loyaltyPointsEarned: readNumber(quote.loyalty_points_earned ?? quote.loyaltyPointsEarned),
    subtotal: readNumber(quote.subtotal),
    discountAmount: readNumber(quote.discount_amount ?? quote.discountAmount),
    vatAmount: readNumber(quote.vat_amount ?? quote.vatAmount),
    total: readNumber(quote.total),
    status: statusValue === "paid" ? "paid" : "pending",
    items: itemsValue.map(normalizeItem),
    createdAt: readText(quote.created_at ?? quote.createdAt),
  };
};

export const getQuotes = async (
  params?: QuoteQueryParams,
): Promise<PaginatedQuotesResponse> => {
  const response = await api.get<unknown>("/quotes", { params });
  const payload = record(response.data);
  const dataValue = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.quotes)
      ? payload.quotes
      : Array.isArray(response.data)
        ? response.data
        : [];
  const meta = record(payload.meta);
  const page = readNumber(meta.current_page, readNumber(params?.page, 1));
  const perPage = readNumber(meta.per_page, readNumber(params?.per_page ?? params?.limit, 10));
  const total = readNumber(meta.total, dataValue.length);
  const lastPage = readNumber(meta.last_page, Math.max(1, Math.ceil(total / perPage)));

  return {
    data: dataValue.map(normalizeQuote),
    meta: {
      current_page: page,
      from: meta.from == null ? null : readNumber(meta.from),
      last_page: lastPage,
      path: readText(meta.path),
      per_page: perPage,
      to: meta.to == null ? null : readNumber(meta.to),
      total,
    },
  };
};

export const getQuoteById = async (id: number | string): Promise<{ data: Quote }> => {
  const response = await api.get<unknown>(`/quotes/${id}`);
  return { data: normalizeQuote(unwrapData(response.data)) };
};

export const createQuote = async (payload: CreateQuotePayload): Promise<{ data: Quote }> => {
  const response = await api.post<unknown>("/quotes", payload);
  const body = record(response.data);
  return { data: normalizeQuote(body.data ?? body.quote ?? body) };
};

export const updateQuote = async (
  id: number | string,
  payload: UpdateQuotePayload,
): Promise<{ data: Quote }> => {
  const response = await api.put<unknown>(`/quotes/${id}`, payload);
  const body = record(response.data);
  return { data: normalizeQuote(body.data ?? body.quote ?? body) };
};

export const updateQuoteStatus = async (
  id: number | string,
  status: "pending" | "paid",
): Promise<{ data: Quote }> => {
  const response = await api.patch<unknown>(`/quotes/${id}/status`, { status });
  const body = record(response.data);
  return { data: normalizeQuote(body.data ?? body.quote ?? body) };
};

export const deleteQuote = async (id: number | string): Promise<void> => {
  await api.delete(`/quotes/${id}`);
};

export const getQuoteErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;
  const body = record(error.response?.data);
  const errors = record(body.errors);
  const labels: Record<string, string> = {
    customer_id: "Cliente",
    applied_plan_id: "Plan aplicado",
    includes_vat: "IVA incluido",
    loyalty_points_used: "Puntos utilizados",
    status: "Estado",
    items: "Ítems",
  };

  const messages = Object.entries(errors).flatMap(([field, value]) => {
    const itemMatch = /^items\.(\d+)\.(.+)$/.exec(field);
    const baseLabel = itemMatch
      ? `Ítem ${Number(itemMatch[1]) + 1}`
      : labels[field] || field;
    const detailLabel = itemMatch
      ? {
          service_id: "Servicio",
          plant_id: "Planta",
          quantity: "Cantidad",
          unit_price: "Precio unitario",
          item_type: "Tipo",
        }[itemMatch[2]] || itemMatch[2]
      : "";
    const label = detailLabel ? `${baseLabel} · ${detailLabel}` : baseLabel;

    const details = Array.isArray(value)
      ? value.map((message) => String(message))
      : [String(value)];

    return details.map((message) => `${label}: ${message}`);
  });

  if (messages.length) return messages.join(" ");
  return readText(body.message ?? body.error, fallback);
};
