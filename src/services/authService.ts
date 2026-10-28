import { API_BASE_URL, api } from "./api";
import type { LoginCredentials, LoginResponse } from "../types/auth";
import { normalizeRoleName } from "../config/roles";

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const loginUrl = new URL("/api/login", API_BASE_URL).toString();
  const response = await api.post<LoginResponse>(loginUrl, credentials);

  const payload = response.data?.data ?? response.data;
  const token =
    payload?.access_token ??
    payload?.token ??
    response.data?.access_token ??
    response.data?.token;
  const user = payload?.user ?? response.data?.user;

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("auth_token", token);
  }

  const roleCandidates = [
    user?.employee?.role_id,
    user?.role_id,
    user?.employee?.role,
    user?.role,
  ];
  const roleName =
    roleCandidates.map(normalizeRoleName).find((candidate) => candidate) || "";
  if (roleName) {
    localStorage.setItem("role", roleName);
  } else {
    localStorage.removeItem("role");
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.error("Error en el servidor al cerrar sesión:", error);
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.clear();

    window.location.href = "/login";
  }
};
