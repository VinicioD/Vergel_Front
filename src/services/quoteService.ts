import { isAxiosError } from "axios";
import { api } from "./api";
import type {
  CreateQuotePayload,
  PaginatedQuotesResponse,
  Quote,
  QuoteItem,
  QuoteItemType,
  QuoteQueryParams,
  QuoteRefEntity,
  QuoteStatus,
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

const readNullableId = (value: unknown): number | null => {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

const normalizeRefEntity = (value: unknown): QuoteRefEntity | null => {
  const entity = record(value);
  const id = readNullableId(entity.id);
  if (id == null) return null;

  return {
    id,
    name: readText(entity.name) || undefined,
    legalName: readText(entity.legalName ?? entity.legal_name) || undefined,
    tradeName: readText(entity.tradeName ?? entity.trade_name) || undefined,
    fullName: readText(entity.fullName ?? entity.full_name) || undefined,
    planCode: readText(entity.planCode ?? entity.plan_code) || undefined,
    planName: readText(entity.planName ?? entity.plan_name) || undefined,
  };
};

const normalizeItem = (value: unknown): QuoteItem => {
  const item = record(value);
  const rawType = readText(item.itemType ?? item.item_type ?? item.type);
  const service = normalizeRefEntity(item.service);
  const plant = normalizeRefEntity(item.plant);
  const serviceId = readNullableId(
    item.serviceId ?? item.service_id ?? service?.id,
  );
  const plantId = readNullableId(item.plantId ?? item.plant_id ?? plant?.id);

  const itemType: QuoteItemType =
    rawType === "plant" || plantId != null ? "plant" : "service";

  const name =
    readText(item.name) ||
    (itemType === "plant"
      ? plant?.name || service?.name || ""
      : service?.name || plant?.name || "");

  return {
    id: item.id == null ? undefined : readNumber(item.id),
    itemType,
    serviceId,
    plantId,
    service,
    plant,
    name,
    quantity: readNumber(item.quantity),
    unitPrice: readNumber(item.unitPrice ?? item.unit_price),
    total: readNumber(item.total ?? item.line_total),
  };
};

const normalizeQuote = (value: unknown): Quote => {
  const quote = record(value);
  const customer = normalizeRefEntity(quote.customer);
  const appliedPlan = normalizeRefEntity(
    quote.appliedPlan ??
      quote.applied_plan ??
      quote.subscriptionPlan ??
      quote.subscription_plan,
  );
  const employee = normalizeRefEntity(quote.employee);

  const itemsValue = Array.isArray(quote.items)
    ? quote.items
    : Array.isArray(quote.quote_items)
      ? quote.quote_items
      : [];
  const normalizedItems = itemsValue.map(normalizeItem);

  const statusValue = readText(quote.status, "pending");
  const basePrice = readNumber(
    quote.basePrice ?? quote.base_price ?? quote.subtotal,
  );
  const discountedSubtotal = readNumber(
    quote.discountedSubtotal ?? quote.discounted_subtotal ?? basePrice,
  );

  return {
    id: readNumber(quote.id),
    quoteNumber: readText(
      quote.quoteNumber ??
        quote.quote_number ??
        quote.code ??
        `COT-${quote.id ?? ""}`,
    ),
    customerId: readNullableId(
      quote.customerId ?? quote.customer_id ?? customer?.id,
    ),
    customerName:
      customer?.legalName ||
      customer?.tradeName ||
      customer?.name ||
      readText(quote.customerName ?? quote.customer_name, "Sin cliente"),
    customer,
    appliedPlanId: readNullableId(
      quote.appliedPlanId ??
        quote.applied_plan_id ??
        quote.subscriptionPlanId ??
        quote.subscription_plan_id ??
        appliedPlan?.id,
    ),
    appliedPlanName:
      appliedPlan?.planName ||
      appliedPlan?.name ||
      readText(
        quote.appliedPlanName ??
          quote.applied_plan_name ??
          quote.planName ??
          quote.plan_name,
      ),
    appliedPlan,
    employeeId: readNullableId(
      quote.employeeId ?? quote.employee_id ?? employee?.id,
    ),
    employeeName:
      employee?.fullName ||
      employee?.name ||
      readText(quote.employeeName ?? quote.employee_name),
    employee,
    includesVat: Boolean(quote.includesVat ?? quote.includes_vat),
    loyaltyPointsUsed: readNumber(
      quote.loyaltyPointsUsed ?? quote.loyalty_points_used,
    ),
    loyaltyPointsEarned: readNumber(
      quote.loyaltyPointsEarned ?? quote.loyalty_points_earned,
    ),
    basePrice,
    discountedSubtotal,
    total: readNumber(quote.total),
    status: statusValue === "paid" ? "paid" : "pending",
    itemsCount: readNumber(
      quote.itemsCount ?? quote.items_count,
      normalizedItems.length,
    ),
    items: normalizedItems,
    createdAt: readText(quote.createdAt ?? quote.created_at),
    updatedAt: readText(quote.updatedAt ?? quote.updated_at) || undefined,
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
  const perPage = readNumber(
    meta.per_page,
    readNumber(params?.per_page ?? params?.limit, 15),
  );
  const total = readNumber(meta.total, dataValue.length);
  const lastPage = readNumber(
    meta.last_page,
    Math.max(1, Math.ceil(total / perPage)),
  );

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

export const getQuoteById = async (
  id: number | string,
): Promise<{ data: Quote }> => {
  const response = await api.get<unknown>(`/quotes/${id}`);
  return { data: normalizeQuote(unwrapData(response.data)) };
};

export const createQuote = async (
  payload: CreateQuotePayload,
): Promise<{ data: Quote }> => {
  const response = await api.post<unknown>("/quotes", payload);
  return { data: normalizeQuote(unwrapData(response.data)) };
};

export const updateQuote = async (
  id: number | string,
  payload: UpdateQuotePayload,
): Promise<{ data: Quote }> => {
  const response = await api.put<unknown>(`/quotes/${id}`, payload);
  return { data: normalizeQuote(unwrapData(response.data)) };
};

export const updateQuoteStatus = async (
  id: number | string,
  status: QuoteStatus,
): Promise<{ data: Quote }> => {
  const response = await api.patch<unknown>(`/quotes/${id}/status`, { status });
  return { data: normalizeQuote(unwrapData(response.data)) };
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
