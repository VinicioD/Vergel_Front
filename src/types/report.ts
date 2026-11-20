// src/types/report.ts

export interface ReportDateRangeParams {
  from?: string; // Formato YYYY-MM-DD
  to?: string; // Formato YYYY-MM-DD
}

export interface ReportPaginationParams extends ReportDateRangeParams {
  per_page?: number;
  page?: number;
}

export interface ReportPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface ReportResponse<TItem, TSummary> {
  data: TItem[];
  meta: ReportPaginationMeta & {
    summary: TSummary;
  };
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  message?: string;
}

// 1. Reporte de ventas mensuales (GET /reports/sales)
export interface SalesReportItem {
  period: string; // Ej. "2026-11"
  quotesCount: number;
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  averageTicket: number;
}

export interface SalesReportSummary {
  totalQuotes: number;
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  averageTicket: number;
}

export interface SalesReportQueryParams extends ReportDateRangeParams {
  customer_id?: number;
}

export type SalesReportResponse = ReportResponse<
  SalesReportItem,
  SalesReportSummary
>;

// 2. Ranking de clientes por facturación (GET /reports/customers)
export interface CustomerReportItem {
  customerId: number;
  legalName: string;
  tradeName?: string | null;
  quotesCount: number;
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
  lastSaleDate?: string | null;
}

export interface CustomerReportSummary {
  customersCount: number;
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
}

export interface CustomerReportQueryParams extends ReportPaginationParams {
  customer_id?: number;
}

export type CustomerReportResponse = ReportResponse<
  CustomerReportItem,
  CustomerReportSummary
>;

// 3. Ranking de plantas vendidas (GET /reports/plants)
export interface PlantReportItem {
  plantId: number;
  plantName: string;
  categoryType?: string | null;
  unitsSold: number;
  quotesCount: number;
  totalRevenue: number;
}

export interface PlantReportSummary {
  plantsCount: number;
  totalUnitsSold: number;
  totalRevenue: number;
}

export interface PlantReportQueryParams extends ReportPaginationParams {
  plant_id?: number;
}

export type PlantReportResponse = ReportResponse<
  PlantReportItem,
  PlantReportSummary
>;

// 4. Cobros agrupados por empleado (GET /reports/collections)
export interface CollectionReportItem {
  employeeId: number;
  employeeName: string;
  paymentsCount: number;
  totalCollected: number;
  methods: Record<string, number>; // Ej. { cash: 200, transfer: 250 }
}

export interface CollectionReportSummary {
  totalPayments: number;
  totalCollected: number;
}

export interface CollectionReportQueryParams extends ReportPaginationParams {
  employee_id?: number;
}

export type CollectionReportResponse = ReportResponse<
  CollectionReportItem,
  CollectionReportSummary
>;

// 5. Estado de pago de las cotizaciones (GET /reports/quotes-status)
export type QuotePaymentStatusKey = "paid" | "partial" | "pending";

export interface QuotesStatusReportItem {
  status: QuotePaymentStatusKey | string;
  statusLabel: string;
  quotesCount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface QuotesStatusReportSummary {
  totalQuotes: number;
  totalBilled: number;
  totalPaid: number;
  totalPending: number;
}

export interface QuotesStatusReportQueryParams extends ReportDateRangeParams {
  customer_id?: number;
}

export type QuotesStatusReportResponse = ReportResponse<
  QuotesStatusReportItem,
  QuotesStatusReportSummary
>;

// 6. Compras agrupadas por proveedor (GET /reports/purchases)
export interface PurchaseReportItem {
  supplierName: string;
  supplierTaxId?: string | null;
  supplierNrc?: string | null;
  purchasesCount: number;
  totalPurchased: number;
}

export interface PurchaseReportSummary {
  suppliersCount: number;
  totalPurchases: number;
  totalAmount: number;
}

export interface PurchaseReportQueryParams extends ReportPaginationParams {
  supplier?: string;
}

export type PurchaseReportResponse = ReportResponse<
  PurchaseReportItem,
  PurchaseReportSummary
>;

// 7. Rentabilidad mensual (GET /reports/profitability)
export interface ProfitabilityReportItem {
  period: string; // Ej. "2026-11"
  sales: number;
  purchases: number;
  expenses: number;
  utility: number;
  marginPercentage: number;
}

export interface ProfitabilityReportSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalUtility: number;
  averageMarginPercentage: number;
}

export type ProfitabilityReportResponse = ReportResponse<
  ProfitabilityReportItem,
  ProfitabilityReportSummary
>;

// 8. Suscripciones agrupadas por plan (GET /reports/subscriptions)
export interface SubscriptionReportPlanInfo {
  id: number;
  code: string;
  name: string;
}

export interface SubscriptionReportItem {
  plan: SubscriptionReportPlanInfo;
  subscriptionsCount: number;
  activeCount: number;
  pendingPaymentCount: number;
  completedCount: number;
  cancelledCount: number;
  totalPaid: number;
  reservedBalance: number;
}

export interface SubscriptionReportSummary {
  totalSubscriptions: number;
  totalActive: number;
  totalPaid: number;
  totalReserved: number;
}

export interface SubscriptionReportQueryParams extends ReportPaginationParams {
  plan_id?: number;
}

export type SubscriptionReportResponse = ReportResponse<
  SubscriptionReportItem,
  SubscriptionReportSummary
>;
