// src/components/catalog/CatalogView.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  Loader2,
  EllipsisVertical,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPlants, deletePlant } from "../../services/plantService";
import type { Plant } from "../../types/plant";
import { isAxiosError } from "axios";
import ConfirmDialog from "../ConfirmDialog";
import { resolveImageUrl } from "../../utils/imageUrl";

import { useNavigate } from "react-router-dom"; // 1. Importa el hook
export interface CatalogViewProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  showAddProductButton?: boolean;
  onAddClick?: () => void; // Para abrir tu futura vista o modal de creación
}

// Categorías de ejemplo que vienen de tu backend o filtros fijos
const CATEGORIES = ["Todos", "Interior", "Exterior", "Sombra"];

// 3 filas x 4 columnas por página en el catálogo
const ITEMS_PER_PAGE = 12;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface PlantImageProps {
  imageUrl?: string | null;
  imagePath?: string | null;
  alt: string;
  className?: string;
}

// Prueba imageUrl, luego imagePath y por último la imagen genérica
function PlantImage({ imageUrl, imagePath, alt, className }: PlantImageProps) {
  const sources = [
    resolveImageUrl(imageUrl),
    resolveImageUrl(imagePath),
  ].filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = sources[sourceIndex] ?? FALLBACK_IMAGE;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((index) => index + 1);
        } else if (src !== FALLBACK_IMAGE) {
          console.warn("No se pudo cargar la imagen de la planta:", {
            imageUrl,
            imagePath,
          });
          setSourceIndex(sources.length);
        }
      }}
    />
  );
}

export default function CatalogView({
  title = "Catálogo de Plantas",
  subtitle = "Administra e inspecciona todas las especies de tu inventario",
  searchPlaceholder = "Buscar planta...",
  showAddProductButton = true,
  onAddClick,
}: CatalogViewProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [detailPlant, setDetailPlant] = useState<Plant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const navigate = useNavigate();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }
    // Ruta relativa al catálogo actual: /admin/catalog/nueva, /quote/catalog/nueva
    navigate("nueva");
  };

  const handleEditClick = (plant: Plant) => {
    setOpenMenuId(null);
    // Ruta relativa al catálogo actual: /admin/catalog/{id}/editar
    navigate(`${plant.id}/editar`);
  };

  const handleDetailClick = (plant: Plant) => {
    setOpenMenuId(null);
    setDetailPlant(plant);
  };

  const handleDeleteClick = (plant: Plant) => {
    setOpenMenuId(null);
    setPlantToDelete(plant);
  };

  const confirmDelete = async () => {
    if (!plantToDelete) return;

    setDeletingId(plantToDelete.id);
    try {
      await deletePlant(plantToDelete.id);
      setPlantToDelete(null);
      // Si era el último de la página, retrocede; si no, recarga para rellenar
      if (plants.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        fetchCatalogPlants();
      }
    } catch (error) {
      console.error("Error al eliminar la planta:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert("No tienes permisos suficientes para eliminar plantas.");
      } else {
        alert("No se pudo eliminar la planta. Intenta nuevamente.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Función para consumir el servicio real de plantas
  const fetchCatalogPlants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPlants({
        search: searchTerm.trim() || undefined,
        category_type:
          selectedCategory !== "Todos" ? selectedCategory : undefined,
        per_page: ITEMS_PER_PAGE,
        page: currentPage,
      });
      setPlants(response.data);
      setTotalItems(response.meta?.total ?? response.data.length);
      setLastPage(Math.max(1, response.meta?.last_page ?? 1));

      // Si la página actual quedó fuera de rango, retrocede a la última válida
      if (
        response.meta?.last_page &&
        currentPage > response.meta.last_page &&
        response.meta.last_page > 0
      ) {
        setCurrentPage(response.meta.last_page);
      }
    } catch (error) {
      console.error("Error al cargar el catálogo de plantas:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert("No tienes permisos suficientes para ver el catálogo.");
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, currentPage]);

  // Se ejecuta cada vez que cambia el buscador, la categoría o la página
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCatalogPlants();
    }, 300); // Debounce para evitar llamadas excesivas al escribir

    return () => clearTimeout(delayDebounceFn);
  }, [fetchCatalogPlants]);

  // Cierra el menú de acciones al hacer click fuera de él
  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const totalPages = Math.max(1, lastPage);
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>

        {showAddProductButton && (
          <button
            onClick={handleAddClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5d682e] hover:bg-[#4d5626] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Nueva Planta</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda Responsive */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5d682e]"
          />
        </div>

        {/* Categorías deslizables */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter
            size={16}
            className="text-gray-400 shrink-0 hidden sm:block"
          />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#5d682e] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido / Grid Adaptable de Plantas con Estado de Carga */}
      {loading ? (
        <div className="w-full py-24 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#5d682e]" size={36} />
          <p className="text-xs text-gray-500 mt-2">Cargando catálogo...</p>
        </div>
      ) : plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Imagen del Backend */}
                <div className="w-full h-48 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                  <PlantImage
                    key={`${plant.id}-${plant.imageUrl}-${plant.imagePath}`}
                    imageUrl={plant.imageUrl}
                    imagePath={plant.imagePath}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider shadow-sm">
                    {plant.categoryType || "General"}
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Estado:{" "}
                    <span
                      className={`font-semibold ${plant.active ? "text-green-600" : "text-red-500"}`}
                    >
                      {plant.active ? "Disponible" : "No disponible"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Pie de la tarjeta */}
              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 mt-2">
                <span className="text-base sm:text-lg font-bold text-[#5d682e] dark:text-[#a0b05b]">
                  ${Number(plant.price).toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDetailClick(plant)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#5d682e] text-[#5d682e] dark:text-[#a0b05b] hover:bg-[#5d682e] hover:text-white dark:hover:bg-[#a0b05b] dark:hover:text-gray-900 font-medium transition-all cursor-pointer"
                  >
                    Ver Detalles
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === plant.id ? null : plant.id,
                        );
                      }}
                      disabled={deletingId === plant.id}
                      title="Más opciones"
                      aria-label="Más opciones"
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === plant.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <EllipsisVertical size={16} />
                      )}
                    </button>

                    {openMenuId === plant.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 bottom-full mb-2 z-20 w-36 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => handleEditClick(plant)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(plant)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado Vacío / Sin Resultados */
        <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
            No se encontraron plantas en el catálogo
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Intenta cambiar los términos de búsqueda o los filtros
            seleccionados.
          </p>
        </div>
      )}

      {/* Pie de paginación (siempre visible en el catálogo) */}
      {!loading && totalItems > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Mostrando {startItem} - {endItem} de {totalItems} plantas
          </span>

          <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {getVisiblePages().map((page) => {
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#5b642a] text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles de la planta */}
      {detailPlant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetailPlant(null);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-900">
              <PlantImage
                key={`${detailPlant.id}-${detailPlant.imageUrl}-${detailPlant.imagePath}`}
                imageUrl={detailPlant.imageUrl}
                imagePath={detailPlant.imagePath}
                alt={detailPlant.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setDetailPlant(null)}
                title="Cerrar"
                aria-label="Cerrar detalles"
                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-600 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur-md dark:bg-gray-800/90 dark:text-gray-200">
                {detailPlant.categoryType || "General"}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {detailPlant.name}
                </h2>
                <span
                  className={`shrink-0 text-base font-bold ${
                    detailPlant.active
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  ${Number(detailPlant.price).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Estado
                  </p>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {detailPlant.active ? "Disponible" : "No disponible"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Categoría
                  </p>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {detailPlant.categoryType || "General"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Creada
                  </p>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {formatDate(detailPlant.createdAt)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Actualizada
                  </p>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                    {formatDate(detailPlant.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailPlant(null)}
                  className="rounded-xl bg-[#5d682e] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#4d5626] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={plantToDelete !== null}
        title="Eliminar planta"
        message={`¿Seguro que deseas eliminar la planta "${plantToDelete?.name ?? ""}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setPlantToDelete(null)}
      />
    </div>
  );
}
