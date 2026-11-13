export interface SupplierRecord {
  id: number | string;
  name?: string | null;
  legal_name?: string | null;
  legalName?: string | null;
  trade_name?: string | null;
  tradeName?: string | null;
  email?: string | null;
  phone?: string | null;
  tax_id?: string | null;
  taxId?: string | null;
  nrc?: string | null;
  economic_activity?: string | null;
  economicActivity?: string | null;
  contact_name?: string | null;
  contactName?: string | null;
  contact_person?: string | null;
  contactPerson?: string | null;
  address?: string | null;
  status?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
}

export interface SupplierQueryParams {
  search?: string;
  status?: "active" | "inactive";
  economic_activity?: string;
  phone?: string;
  desde?: string;
  hasta?: string;
  sort_by?: "id" | "name" | "trade_name" | "status" | "created_at";
  sort_direction?: "asc" | "desc";
  limit?: number;
  page?: number;
}

export interface PaginatedSuppliersResponse {
  data: SupplierRecord[];
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
    per_page?: number;
    to?: number | null;
    total?: number;
  };
}

export interface SupplierDetailResponse {
  data: SupplierRecord;
}