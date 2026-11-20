// src/services/financeService.ts
import { api } from "./api";
import type {
  FinanceDateRangeParams,
  FinanceMovementsQueryParams,
  FinanceMovementsResponse,
  FinancePlantSalesQueryParams,
  FinancePlantSalesResponse,
  FinancePurchasesQueryParams,
  FinancePurchasesResponse,
  FinanceQuotePaymentsResponse,
  FinanceQuotesQueryParams,
  FinanceQuotesResponse,
  FinanceSummaryResponse,
} from "../types/finance";

// 1. Consultar indicadores financieros (GET /finance/summary)
export const getFinanceSummary = async (
  params?: FinanceDateRangeParams,
): Promise<FinanceSummaryResponse> => {
  const response = await api.get<FinanceSummaryResponse>("/finance/summary", {
    params,
  });
  return response.data;
};

// 2. Listar cotizaciones con su estado de pago (GET /finance/quotes)
export const getFinanceQuotes = async (
  params?: FinanceQuotesQueryParams,
): Promise<FinanceQuotesResponse> => {
  const response = await api.get<FinanceQuotesResponse>("/finance/quotes", {
    params,
  });
  return response.data;
};

// 3. Ver historial de abonos de una cotización (GET /finance/quotes/{quote}/payments)
export const getFinanceQuotePayments = async (
  quoteId: number | string,
): Promise<FinanceQuotePaymentsResponse> => {
  const response = await api.get<FinanceQuotePaymentsResponse>(
    `/finance/quotes/${quoteId}/payments`,
  );
  return response.data;
};

// 4. Listar movimientos de compra, venta y gasto (GET /finance/movements)
export const getFinanceMovements = async (
  params?: FinanceMovementsQueryParams,
): Promise<FinanceMovementsResponse> => {
  const response = await api.get<FinanceMovementsResponse>(
    "/finance/movements",
    {
      params,
    },
  );
  return response.data;
};

// 5. Ver historial de ventas de una planta (GET /finance/plants/{plant}/sales)
export const getFinancePlantSales = async (
  plantId: number | string,
  params?: FinancePlantSalesQueryParams,
): Promise<FinancePlantSalesResponse> => {
  const response = await api.get<FinancePlantSalesResponse>(
    `/finance/plants/${plantId}/sales`,
    {
      params,
    },
  );
  return response.data;
};

// 6. Listar compras registradas (GET /finance/purchases)
export const getFinancePurchases = async (
  params?: FinancePurchasesQueryParams,
): Promise<FinancePurchasesResponse> => {
  const response = await api.get<FinancePurchasesResponse>(
    "/finance/purchases",
    {
      params,
    },
  );
  return response.data;
};
