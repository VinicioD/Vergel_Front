import { api } from "./api";
import type {
  CountryConfigListResponse,
  CountryConfigResponse,
  CreateCountryConfigPayload,
  UpdateCountryConfigPayload,
} from "../types/countryConfig";

export const getCountryConfigs = async (): Promise<CountryConfigListResponse> => {
  const response = await api.get<CountryConfigListResponse>("/country-configs");
  return response.data;
};

export const getCountryConfigById = async (
  id: number | string,
): Promise<CountryConfigResponse> => {
  const response = await api.get<CountryConfigResponse>(`/country-configs/${id}`);
  return response.data;
};

export const createCountryConfig = async (
  payload: CreateCountryConfigPayload,
): Promise<CountryConfigResponse> => {
  const response = await api.post<CountryConfigResponse>("/country-configs", payload);
  return response.data;
};

export const updateCountryConfig = async (
  id: number | string,
  payload: UpdateCountryConfigPayload,
): Promise<CountryConfigResponse> => {
  const response = await api.put<CountryConfigResponse>(
    `/country-configs/${id}`,
    payload,
  );
  return response.data;
};

export const deleteCountryConfig = async (id: number | string): Promise<void> => {
  await api.delete(`/country-configs/${id}`);
};
