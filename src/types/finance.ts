// src/types/finance.ts

export type FinancePaymentStatusKey = "paid" | "partial" | "pending";

export type FinancePaymentStatusFilter = "all" | FinancePaymentStatusKey;

export type FinanceMovementType = "sale" | "purchase" | "expense";

export type FinanceMovementTypeFilter = "all" | FinanceMovementType;

export type FinanceMovementStatusFilter = "all" | "completed" | "cancelled";

export interface FinanceDateRangeParams {
  from?: string; // Formato YYYY-MM-DD
  to?: string; // Formato YYYY-MM-DD
}

export interface FinancePaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface FinancePaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface FinancePaymentStatus {
  key: FinancePaymentStatusKey | string;
  label: string;
  badge: string;
}

// 1. Indicadores financieros (GET /finance/summary)
export interface FinanceSummary {
  totalProduction: number;
  totalPaid: number;
  totalPending: number;
  partialPaymentsTotal: number;
  totalPurchases: number;
  profitability: number;
}

export interface FinanceSummaryResponse {
  data: FinanceSummary;
}

// 2. Cotizaciones con estado de pago (GET /finance/quotes)
export interface FinanceQuoteItem {
  id: number;
  quoteNumber: string;
  customerName: string;
  total: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: FinancePaymentStatus;
}

export interface FinanceQuotesQueryParams extends FinanceDateRangeParams {
  customer_id?: number;
  quote_number?: string;
  payment_status?: FinancePaymentStatusFilter;
  per_page?: number;
  page?: number;
}

export interface FinanceQuotesResponse {
  data: FinanceQuoteItem[];
  links?: FinancePaginationLinks;
  meta?: FinancePaginationMeta;
}

// 3. Historial de abonos de una cotización (GET /finance/quotes/{quote}/payments)
export interface FinancePaymentEmployee {
  id: number;
  fullName: string;
}

export interface FinanceQuotePaymentItem {
  id: number;
  quoteId: number;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  employee?: FinancePaymentEmployee | null;
  createdAt?: string;
}

export interface FinanceQuotePaymentsResponse {
  data: FinanceQuotePaymentItem[];
  meta?: {
    quote: FinanceQuoteItem;
  };
  message?: string;
}

// 4. Movimientos de compra, venta y gasto (GET /finance/movements)
export interface FinanceMovementEntity {
  name: string;
  role?: string;
}

export interface FinanceMovementAmounts {
  total: number;
  subtotal?: number;
  vat?: number;
  taxed?: number;
  exempt?: number;
  nonTaxable?: number;
}

export interface FinanceMovementItem {
  id: number;
  type: FinanceMovementType | string;
  typeLabel?: string;
  documentNumber?: string;
  entity?: FinanceMovementEntity | null;
  date: string;
  amounts: FinanceMovementAmounts;
}

export interface FinanceMovementsSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses?: number;
  utility: number;
}

export interface FinanceMovementsQueryParams extends FinanceDateRangeParams {
  movement_type?: FinanceMovementTypeFilter;
  type?: FinanceMovementTypeFilter;
  search?: string;
  status?: FinanceMovementStatusFilter;
  per_page?: number;
  page?: number;
}

export interface FinanceMovementsResponse {
  data: FinanceMovementItem[];
  summary: FinanceMovementsSummary;
  links?: FinancePaginationLinks;
  meta?: FinancePaginationMeta;
}

// 5. Historial de ventas de una planta (GET /finance/plants/{plant}/sales)
export interface FinancePlantSaleItem {
  id: number;
  quoteId: number;
  quoteNumber: string;
  customerName: string;
  saleDate: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentStatus: FinancePaymentStatus;
}

export interface FinancePlantInfo {
  id: number;
  name: string;
  price?: number;
  categoryType?: string;
  active?: boolean;
}

export interface FinancePlantSalesTotals {
  unitsSold: number;
  salesTotal: number;
  quotesCount: number;
}

export interface FinancePlantSalesQueryParams extends FinanceDateRangeParams {
  per_page?: number;
  page?: number;
}

export interface FinancePlantSalesResponse {
  data: FinancePlantSaleItem[];
  meta?: {
    plant: FinancePlantInfo;
    totals: FinancePlantSalesTotals;
  };
  links?: FinancePaginationLinks;
  message?: string;
}

// 6. Compras registradas (GET /finance/purchases)
export interface FinanceSupplierInfo {
  name: string;
  taxId?: string | null;
  nrc?: string | null;
}

export interface FinancePurchaseAmounts {
  taxed: number;
  exempt: number;
  nonTaxable: number;
  vat: number;
  subtotal: number;
  total: number;
}

export interface FinancePurchaseItem {
  id: number;
  issueDate: string;
  documentType: string;
  documentNumber: string;
  supplier: FinanceSupplierInfo;
  amounts: FinancePurchaseAmounts;
  notes?: string | null;
  employee?: FinancePaymentEmployee | null;
  createdAt?: string;
}

export interface FinancePurchasesQueryParams extends FinanceDateRangeParams {
  supplier?: string;
  supplier_tax_id?: string;
  per_page?: number;
  page?: number;
}

export interface FinancePurchasesResponse {
  data: FinancePurchaseItem[];
  links?: FinancePaginationLinks;
  meta?: FinancePaginationMeta;
}
