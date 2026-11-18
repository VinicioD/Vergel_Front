export interface CountryConfig {
  id: number;
  country: string;
  currency: string;
  taxPercentage: number;
  cardFeePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CountryConfigListResponse {
  data: CountryConfig[];
}

export interface CountryConfigResponse {
  data: CountryConfig;
}

export interface CreateCountryConfigPayload {
  country: string;
  currency: string;
  tax_percentage: number;
  card_fee_percentage?: number;
}

export interface UpdateCountryConfigPayload {
  country?: string;
  currency?: string;
  tax_percentage?: number;
  card_fee_percentage?: number;
}
