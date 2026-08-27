// src/components/Table.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number; // Por defecto 10
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  entityName?: string;
}

export default function Table<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 10, // Cambiado por defecto a 10
  currentPage,
  onPageChange,
  totalItems,
  entityName = "registros",
}: TableProps<T>) {
  const effectiveTotalItems = totalItems ?? data.length;
  const totalPages = Math.ceil(effectiveTotalItems / itemsPerPage);

  const isServerSide = totalItems !== undefined;
  const currentData = isServerSide
    ? data
    : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startItem =
    effectiveTotalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, effectiveTotalItems);

  // Generador inteligente de números de página (máximo 5 visibles)
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="w-full flex flex-col gap-4 font-sans">
      {/* TARJETA DE LA TABLA */}
      <div className="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 shadow-sm transition-colors">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ECE6DB] dark:bg-gray-900/90 text-[#3a3d20] dark:text-gray-200 text-xs font-bold uppercase tracking-wider border-b border-gray-200/40 dark:border-gray-700">
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`px-6 py-4 text-gray-700 dark:text-gray-200 ${
                          col.className || ""
                        }`}
                      >
                        {col.render
                          ? col.render(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey])
                            : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-400 dark:text-gray-500"
                  >
                    No hay {entityName} para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        {/* Texto Informativo */}
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Mostrando {startItem} - {endItem} de {effectiveTotalItems}{" "}
          {entityName}
        </span>

        {/* Barra de Paginación Unida (Segmented Control) */}
        {totalPages > 1 && (
          <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
            {/* Flecha Izquierda */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Números de página */}
            {visiblePages.map((page) => {
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-[#5b642a] text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Flecha Derecha */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
