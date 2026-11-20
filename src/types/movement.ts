export type MovementType = "all" | "sale" | "purchase" | "expense" | "ticket";
export type MovementStatus = "completed" | "cancelled" | "all";
export type MovementSortField = "id" | "movement_date" | "total" | "amount" | "created_at" | "document_number";
export type MovementSortDirection = "asc" | "desc";

export interface MovementEntity {
  name: string;
  taxId?: string | null;
  role?: string;
}

export interface MovementAmounts {
  amount: number;
  vatAmount: number;
  total: number;
}

export interface MovementStatusInfo {
  raw: string;
  label: string;
  isCancelled: boolean;
  badge: string;
}

export interface MovementEmployee {
  id: number;
  fullName: string;
}

export interface MovementOrigin {
  type: string;
  id: number;
}

export interface Movement {
  id: number;
  type: "sale" | "purchase" | "expense" | "ticket";
  typeLabel: string;
  documentType: string;
  documentNumber: string;
  entity: MovementEntity;
  date: string;
  amounts: MovementAmounts;
  status: MovementStatusInfo;
  notes?: string | null;
  employee?: MovementEmployee | null;
  origin?: MovementOrigin | null;
  createdAt: string;
}

export interface MovementSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalIncome: number;
  totalOutflow: number;
  utility: number;
  profitMarginPercentage: number;
  totalCount: number;
}

export interface MovementQueryParams {
  movement_type?: MovementType;
  type?: MovementType;
  start_date?: string;
  end_date?: string;
  search?: string;
  entity_name?: string;
  status?: MovementStatus;
  sort_by?: MovementSortField;
  sort_direction?: MovementSortDirection;
  per_page?: number;
  limit?: number;
  page?: number;
}

export interface PaginatedMovementsResponse {
  data: Movement[];
  summary?: MovementSummary;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    summary?: MovementSummary;
  };
  message?: string;
}
