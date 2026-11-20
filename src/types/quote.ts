export type QuoteStatus = "pending" | "paid";

export interface QuoteItem {
  id?: number;
  itemType?: "service" | "plant";
  serviceId?: number | null;
  plantId?: number | null;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: number;
  code: string;
  customerId: number | null;
  customerName: string;
  appliedPlanId: number | null;
  planName: string;
  employeeId: number | null;
  employeeName: string;
  includesVat: boolean;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  status: QuoteStatus;
  items: QuoteItem[];
  createdAt: string;
}

export interface QuoteQueryParams {
  page?: number;
  limit?: number;
  per_page?: number;
  search?: string;
  status?: QuoteStatus;
}

export interface PaginatedQuotesResponse {
  data: Quote[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface CreateQuoteItemPayload {
  item_type: "service" | "plant";
  service_id?: number;
  plant_id?: number;
  quantity: number;
  unit_price: number;
}

export interface CreateQuotePayload {
  customer_id?: number;
  applied_plan_id: number;
  includes_vat?: boolean;
  loyalty_points_used?: number;
  status?: QuoteStatus;
  items: CreateQuoteItemPayload[];
}

export type UpdateQuotePayload = Partial<Omit<CreateQuotePayload, "items">> & {
  items?: CreateQuoteItemPayload[];
};
