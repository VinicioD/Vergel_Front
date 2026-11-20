export type PortfolioMovementFilter = "all" | "wallet" | "loyalty";

export interface CustomerPortfolioSummary {
  customerId: number;
  customerName?: string;
  tradeName?: string;
  legalName?: string;
  wallet?: {
    cashBalance?: number;
    reservedSubscriptionBalance?: number;
    totalAvailable?: number;
  } | null;
  loyaltyPoints?: { pointsBalance?: number } | number | null;
  loyalty?: { pointsBalance?: number } | null;
  cashBalance?: number;
  reservedSubscriptionBalance?: number;
  totalAvailable?: number;
  pointsBalance?: number;
  totalPoints?: number;
}

export interface PortfolioPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PortfolioMovement {
  id: number;
  customerId: number;
  source?: "wallet" | "loyalty" | string;
  type?: "wallet" | "loyalty" | string;
  transactionType?: string;
  concept?: string;
  amount: number | null;
  points?: number | null;
  description?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
}

export interface PortfolioMovementsResponse {
  data: PortfolioMovement[];
  meta?: PortfolioPagination;
}

export interface PortfolioSummariesResponse {
  data: CustomerPortfolioSummary[];
  meta?: PortfolioPagination;
}

export interface WalletTransactionPayload {
  transaction_type:
    | "top_up"
    | "annual_fee"
    | "maintenance_deduction"
    | "adjustment"
    | "reserve_funds"
    | "spend_reserved_funds";
  amount: number;
  payment_method?: "transfer" | "cash" | "card" | "check";
  is_annual_payment?: boolean;
}

export interface LoyaltyPointsTransactionPayload {
  transaction_type:
    | "earned_purchase"
    | "redeemed"
    | "referral"
    | "promotional"
    | "special_bonus";
  points: number;
  description?: string;
  quote_id?: number;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  pointsCost: number;
  active: boolean;
  service?: {
    id: number;
    name: string;
  } | null;
}

export interface LoyaltyRedemption {
  id: number;
  customerId: number;
  reward: {
    id: number;
    name: string;
    pointsCost: number;
  };
  pointsRedeemed: number;
  status: string;
  requestedAt: string;
}

export interface DataListResponse<T> {
  data: T[];
}
