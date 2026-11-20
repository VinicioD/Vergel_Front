export type QuoteStatus = "pending" | "paid";

export type QuoteItemType = "service" | "plant";

export type QuoteSortField =
  | "id"
  | "quote_number"
  | "status"
  | "total"
  | "created_at";

export type SortDirection = "asc" | "desc";

export interface QuoteRefEntity {
  id: number;
  name?: string;
  legalName?: string;
  tradeName?: string;
  fullName?: string;
  planCode?: string;
  planName?: string;
}

export interface QuoteItem {
  id?: number;
  itemType: QuoteItemType;
  serviceId?: number | null;
  plantId?: number | null;
  service?: QuoteRefEntity | null;
  plant?: QuoteRefEntity | null;
  name?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  customerId: number | null;
  customerName: string;
  customer?: QuoteRefEntity | null;
  appliedPlanId: number | null;
  appliedPlanName: string;
  appliedPlan?: QuoteRefEntity | null;
  employeeId: number | null;
  employeeName: string;
  employee?: QuoteRefEntity | null;
  includesVat: boolean;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  basePrice: number;
  discountedSubtotal: number;
  total: number;
  status: QuoteStatus;
  itemsCount: number;
  items: QuoteItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface QuoteQueryParams {
  page?: number;
  limit?: number;
  per_page?: number;
  search?: string;
  status?: QuoteStatus;
  customer_id?: number;
  employee_id?: number;
  applied_plan_id?: number;
  desde?: string;
  hasta?: string;
  sort_by?: QuoteSortField;
  sort_direction?: SortDirection;
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
  item_type: QuoteItemType;
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
