// src/services/authService.ts
import { api } from "./api";
import type { LoginCredentials, LoginResponse } from "../types/auth";

// 1. Iniciar sesión
export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  // Especificamos la URL completa del endpoint de login para evitar problemas de ruta con el v1
  const response = await api.post<LoginResponse>(
    "https://vergel-api-evy7.onrender.com/api/login",
    credentials,
  );

  // Guarda el token generado por Laravel Sanctum en localStorage bajo ambas claves
  if (response.data?.data?.access_token) {
    const token = response.data.data.access_token;
    localStorage.setItem("token", token);
  }

  return response.data;
};

// 2. Cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    // Intentamos avisar al backend que destruya el token
    await api.post("/logout");
  } catch (error) {
    console.error("Error en el servidor al cerrar sesión:", error);
  } finally {
    // Limpieza obligatoria local ocurra lo que ocurra con el backend
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Forzar redirección y recarga para limpiar estados de React
    window.location.href = "/login";
  }
};
