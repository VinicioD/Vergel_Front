// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Adjunta el token Bearer automáticamente en cada petición
api.interceptors.request.use((config) => {
  // Busca 'auth_token' (usado por el equipo) o 'token'
  const token =
    localStorage.getItem("auth_token") || localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
