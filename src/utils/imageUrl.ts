import { API_BASE_URL } from "../services/api";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_PATH?.trim();

const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
};

export const resolveImageUrl = (raw?: string | null): string => {
  if (!raw) return "";

  const value = raw.trim();
  if (!value) return "";

  // Si ya es una URL completa, un blob o un data URI, devuélvela directamente
  if (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Si la ruta viene con 'storage/' al inicio, la limpiamos con cuidado
  const cleanPath = value.replace(/^\/+/, "").replace(/^storage\//, "");

  const apiOrigin = getApiOrigin();
  const base = (
    IMAGE_BASE_URL || (apiOrigin ? `${apiOrigin}/storage` : "/storage")
  ).replace(/\/+$/, "");

  return `${base}/${cleanPath}`;
};
