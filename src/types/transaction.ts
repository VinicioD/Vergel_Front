// src/types/transaction.ts

export type TransactionStatusType = "all" | "performed" | "declined";

export type TransactionSortField =
  | "id"
  | "quote_number"
  | "total"
  | "created_at";

export interface TransactionCustomer {
  id: number;
  legalName: string;
  tradeName?: string | null;
  taxId?: string | null;
  phone?: string | null;
  email?: string | null;
  municipality?: string | null;
  department?: string | null;
  address?: string | null;
}

export interface TransactionEmployee {
  id: number;
  fullName: string;
}

export interface TransactionPlan {
  id: number;
  name: string;
  code: string;
}

export interface TransactionAmounts {
  basePrice: number;
  discountedSubtotal: number;
  includesVat: boolean;
  total: number;
}

export interface TransactionLoyaltyPoints {
  used: number;
  earned: number;
}

export interface TransactionStatusInfo {
  raw: string;
  state: "performed" | "declined";
  label: string;
  isCancelled: boolean;
  isPaid: boolean;
  badge: string;
}

export interface TransactionItem {
  id: number;
  itemType: "service" | "plant" | string;
  quantity: number;
  unitPrice: number;
  total: number;
  service?: {
    id: number;
    name: string;
  } | null;
  plant?: {
    id: number;
    name: string;
  } | null;
}

export interface TransactionPayment {
  id: number;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
}

export interface HistoricalTransaction {
  id: number;
  quoteNumber: string;
  transactionReference: string;
  customerId: number;
  customer: TransactionCustomer;
  employeeId: number;
  employee: TransactionEmployee;
  plan?: TransactionPlan | null;
  amounts: TransactionAmounts;
  loyaltyPoints?: TransactionLoyaltyPoints | null;
  status: TransactionStatusInfo;
  items: TransactionItem[];
  payments: TransactionPayment[];
  createdAt: string;
  declinedAt?: string | null;
}

export interface TransactionSummary {
  acceptedCount: number;
  declinedCount: number;
  totalCount: number;
  totalAcceptedAmount: number;
  totalDeclinedAmount: number;
}

export interface TransactionQueryParams {
  search?: string;
  customer_id?: number;
  client_id?: number;
  status_type?: TransactionStatusType;
  start_date?: string; // Formato YYYY-MM-DD
  end_date?: string; // Formato YYYY-MM-DD
  sort_by?: TransactionSortField;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  limit?: number;
  page?: number;
}

export interface PaginatedTransactionsResponse {
  data: HistoricalTransaction[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page?: number;
    from?: number | null;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number | null;
    total?: number;
    summary?: TransactionSummary;
  };
  message?: string;
}

export interface TransactionDetailResponse {
  data: HistoricalTransaction;
}
