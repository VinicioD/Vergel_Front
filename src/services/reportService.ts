// src/services/reportService.ts
import { api } from "./api";
import type {
  CollectionReportQueryParams,
  CollectionReportResponse,
  CustomerReportQueryParams,
  CustomerReportResponse,
  PlantReportQueryParams,
  PlantReportResponse,
  ProfitabilityReportResponse,
  PurchaseReportQueryParams,
  PurchaseReportResponse,
  QuotesStatusReportQueryParams,
  QuotesStatusReportResponse,
  ReportDateRangeParams,
  SalesReportQueryParams,
  SalesReportResponse,
  SubscriptionReportQueryParams,
  SubscriptionReportResponse,
} from "../types/report";

// 1. Reporte de ventas mensuales (GET /reports/sales)
export const getSalesReport = async (
  params?: SalesReportQueryParams,
): Promise<SalesReportResponse> => {
  const response = await api.get<SalesReportResponse>("/reports/sales", {
    params,
  });
  return response.data;
};

// 2. Ranking de clientes por facturación (GET /reports/customers)
export const getCustomersReport = async (
  params?: CustomerReportQueryParams,
): Promise<CustomerReportResponse> => {
  const response = await api.get<CustomerReportResponse>("/reports/customers", {
    params,
  });
  return response.data;
};

// 3. Ranking de plantas vendidas (GET /reports/plants)
export const getPlantsReport = async (
  params?: PlantReportQueryParams,
): Promise<PlantReportResponse> => {
  const response = await api.get<PlantReportResponse>("/reports/plants", {
    params,
  });
  return response.data;
};

// 4. Cobros agrupados por empleado (GET /reports/collections)
export const getCollectionsReport = async (
  params?: CollectionReportQueryParams,
): Promise<CollectionReportResponse> => {
  const response = await api.get<CollectionReportResponse>(
    "/reports/collections",
    {
      params,
    },
  );
  return response.data;
};

// 5. Estado de pago de las cotizaciones (GET /reports/quotes-status)
export const getQuotesStatusReport = async (
  params?: QuotesStatusReportQueryParams,
): Promise<QuotesStatusReportResponse> => {
  const response = await api.get<QuotesStatusReportResponse>(
    "/reports/quotes-status",
    {
      params,
    },
  );
  return response.data;
};

// 6. Compras agrupadas por proveedor (GET /reports/purchases)
export const getPurchasesReport = async (
  params?: PurchaseReportQueryParams,
): Promise<PurchaseReportResponse> => {
  const response = await api.get<PurchaseReportResponse>("/reports/purchases", {
    params,
  });
  return response.data;
};

// 7. Rentabilidad mensual (GET /reports/profitability)
export const getProfitabilityReport = async (
  params?: ReportDateRangeParams,
): Promise<ProfitabilityReportResponse> => {
  const response = await api.get<ProfitabilityReportResponse>(
    "/reports/profitability",
    {
      params,
    },
  );
  return response.data;
};

// 8. Suscripciones agrupadas por plan (GET /reports/subscriptions)
export const getSubscriptionsReport = async (
  params?: SubscriptionReportQueryParams,
): Promise<SubscriptionReportResponse> => {
  const response = await api.get<SubscriptionReportResponse>(
    "/reports/subscriptions",
    {
      params,
    },
  );
  return response.data;
};
