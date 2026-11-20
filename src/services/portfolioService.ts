import { api } from "./api";
import type {
  CustomerPortfolioSummary,
  DataListResponse,
  LoyaltyPointsTransactionPayload,
  LoyaltyRedemption,
  LoyaltyReward,
  PortfolioMovementFilter,
  PortfolioMovementsResponse,
  PortfolioSummariesResponse,
  WalletTransactionPayload,
} from "../types/portfolio";

export const getPortfolioSummaries = async (
  limit = 100,
): Promise<PortfolioSummariesResponse> => {
  const response = await api.get<PortfolioSummariesResponse>(
    "/customers/portfolio",
    { params: { limit } },
  );
  return response.data;
};

export const getPortfolioMovements = async (params: {
  type?: PortfolioMovementFilter;
  page?: number;
  limit?: number;
} = {}): Promise<PortfolioMovementsResponse> => {
  const response = await api.get<PortfolioMovementsResponse>(
    "/customers/portfolio/movements",
    { params: { type: "all", page: 1, limit: 15, ...params } },
  );
  return response.data;
};

export const getCustomerPortfolioMovements = async (
  customerId: number,
  params: { type?: PortfolioMovementFilter; page?: number; limit?: number } = {},
): Promise<PortfolioMovementsResponse> => {
  const response = await api.get<PortfolioMovementsResponse>(
    `/customers/${customerId}/portfolio/movements`,
    { params: { type: "all", page: 1, limit: 15, ...params } },
  );
  return response.data;
};

export const createWalletTransaction = async (
  customerId: number,
  payload: WalletTransactionPayload,
) => {
  const response = await api.post(
    `/customers/${customerId}/wallet/transactions`,
    payload,
  );
  return response.data;
};

export const createLoyaltyPointsTransaction = async (
  customerId: number,
  payload: LoyaltyPointsTransactionPayload,
) => {
  const response = await api.post(
    `/customers/${customerId}/loyalty-points/transactions`,
    payload,
  );
  return response.data;
};

export const getLoyaltyRewards = async (
  available = true,
): Promise<DataListResponse<LoyaltyReward>> => {
  const response = await api.get<DataListResponse<LoyaltyReward>>(
    "/loyalty-rewards",
    { params: { available: available ? 1 : 0 } },
  );
  return response.data;
};

export const getCustomerLoyaltyRedemptions = async (
  customerId: number,
): Promise<DataListResponse<LoyaltyRedemption>> => {
  const response = await api.get<DataListResponse<LoyaltyRedemption>>(
    `/customers/${customerId}/loyalty-redemptions`,
  );
  return response.data;
};

export type { CustomerPortfolioSummary };
