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
  isLoading?: boolean;
  skeletonRows?: number;
}

export default function Table<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 10,
  currentPage,
  onPageChange,
  totalItems,
  entityName = "registros",
  isLoading = false,
  skeletonRows = 6,
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
    <div className="flex-1 min-h-0 w-full flex flex-col gap-4 font-sans">
      {/* TARJETA DE LA TABLA CON SCROLL INTERNO */}
      <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#FAFBFC] dark:bg-gray-900 border-b border-gray-200/40 dark:border-gray-700">
              <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="animate-pulse">
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 ${col.className || ""}`}
                      >
                        <div className="h-4 w-full max-w-[160px] rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors"
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
                    className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm"
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
      {!isLoading && (
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Mostrando {startItem} - {endItem} de {effectiveTotalItems}{" "}
            {entityName}
          </span>

          {totalPages > 1 && (
            <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>

              {visiblePages.map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#5b642a] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
