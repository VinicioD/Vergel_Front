// src/views/admin/modules/history/HistoryView.tsx
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Search, Calendar, Eye, Loader2, ShieldAlert, X } from "lucide-react";
import {
  getTransactionById,
  getTransactions,
} from "./../../services/transactionService";
import type {
  HistoricalTransaction,
  TransactionQueryParams,
  TransactionStatusType,
  TransactionSummary,
} from "./../../types/transaction";

type StatusFilterOption = {
  label: string;
  value: TransactionStatusType;
};

const STATUS_FILTERS: StatusFilterOption[] = [
  { label: "Todos", value: "all" },
  { label: "Efectuados", value: "performed" },
  { label: "Declinados", value: "declined" },
];

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRangeParams(
  rangeKey: string,
): Pick<TransactionQueryParams, "start_date" | "end_date"> {
  const now = new Date();
  const endDate = formatDateInput(now);

  if (rangeKey === "7dias") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { start_date: formatDateInput(start), end_date: endDate };
  }
  if (rangeKey === "30dias") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    return { start_date: formatDateInput(start), end_date: endDate };
  }
  if (rangeKey === "mesActual") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start_date: formatDateInput(start), end_date: endDate };
  }
  if (rangeKey === "anoActual") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start_date: formatDateInput(start), end_date: endDate };
  }
  return {};
}

function formatDateDisplay(isoDate?: string | null): string {
  if (!isoDate) return "-";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatCurrency(amount: number): string {
  return `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getItemsSummary(tx: HistoricalTransaction): string {
  if (!tx.items || tx.items.length === 0) {
    return tx.plan?.name || tx.quoteNumber || `Transacción #${tx.id}`;
  }
  return tx.items
    .map((item) => {
      const name =
        item.service?.name || item.plant?.name || item.itemType || "Ítem";
      return item.quantity > 1 ? `${name} (x${item.quantity})` : name;
    })
    .join(", ");
}

function getPaymentMethodLabel(tx: HistoricalTransaction): string {
  if (tx.status.state === "declined") return "Declinado";
  if (!tx.payments || tx.payments.length === 0) return "-";
  const methods = Array.from(
    new Set(tx.payments.map((p) => p.paymentMethod).filter(Boolean)),
  );
  return methods.length > 0 ? methods.join(", ") : "-";
}

function HistoryTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="py-4 px-4 sm:px-6">
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6">
            <div className="h-5 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6">
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-1.5" />
            <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700/60 md:hidden" />
          </td>
          <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
            <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6 text-right">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
          </td>
          <td className="py-4 px-4 sm:px-6 text-right">
            <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function HistoryView() {
  const [transactions, setTransactions] = useState<HistoricalTransaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [statusType, setStatusType] = useState<TransactionStatusType>("all");
  const [dateRange, setDateRange] = useState("30dias");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTx, setSelectedTx] = useState<HistoricalTransaction | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const dateParams = getDateRangeParams(dateRange);
        const params: TransactionQueryParams = {
          ...dateParams,
          status_type: statusType,
          sort_by: "created_at",
          sort_direction: "desc",
          per_page: 25,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const response = await getTransactions(params);
        if (!active) return;

        setTransactions(response.data ?? []);
        setSummary(response.meta?.summary ?? null);
      } catch (error) {
        if (!active) return;
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 403) {
            setErrorMessage(
              "No tienes permisos para consultar el historial de transacciones.",
            );
          } else {
            const apiMsg = (
              error.response?.data as { message?: string } | undefined
            )?.message;
            setErrorMessage(
              apiMsg || "No se pudo cargar el historial de transacciones.",
            );
          }
        } else {
          setErrorMessage("No se pudo cargar el historial de transacciones.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchTransactions();
    return () => {
      active = false;
    };
  }, [statusType, dateRange, debouncedSearch]);

  const handleOpenDetail = async (tx: HistoricalTransaction) => {
    setSelectedTx(tx);
    setIsLoadingDetail(true);
    try {
      const detail = await getTransactionById(tx.id);
      setSelectedTx(detail.data);
    } catch {
      // Conserva el registro de la lista si el detalle falla
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Historial de Transacciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Consulta los trabajos efectuados (pagados) y cotizaciones declinadas
            o canceladas
          </p>
        </div>
      </div>

      {/* Resumen por cliente / periodo */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Trabajos Efectuados ({summary.acceptedCount})
            </p>
            <p className="text-lg sm:text-xl font-bold text-[#2A3319] dark:text-emerald-400 mt-1">
              {formatCurrency(summary.totalAcceptedAmount)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Declinados / Cancelados ({summary.declinedCount})
            </p>
            <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(summary.totalDeclinedAmount)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Registros Históricos
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {summary.totalCount}
            </p>
          </div>
        </div>
      )}

      {/* Filtros y buscador */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-5 shrink-0">
        <div className="inline-flex p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusType(filter.value)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusType === filter.value
                  ? "bg-[#6C7D38] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative inline-flex items-center bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-200">
            <Calendar size={15} className="text-gray-400 mr-2 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-2 font-medium"
            >
              <option value="7dias" className="dark:bg-gray-800">
                Últimos 7 días
              </option>
              <option value="30dias" className="dark:bg-gray-800">
                Últimos 30 días
              </option>
              <option value="mesActual" className="dark:bg-gray-800">
                Este mes
              </option>
              <option value="anoActual" className="dark:bg-gray-800">
                Este año
              </option>
              <option value="todos" className="dark:bg-gray-800">
                Todo el historial
              </option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-72">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por cliente, cotización o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 shrink-0 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabla con scroll interno */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Fecha</th>
                <th className="py-4 px-4 sm:px-6">Estado</th>
                <th className="py-4 px-4 sm:px-6">Referencia / Detalle</th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Cliente
                </th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                  Método
                </th>
                <th className="py-4 px-4 sm:px-6 text-right">Monto</th>
                <th className="py-4 px-4 sm:px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {isLoading ? (
                <HistoryTableSkeleton />
              ) : transactions.length > 0 ? (
                transactions.map((item) => {
                  const isPerformed = item.status.state === "performed";
                  const clientName =
                    item.customer?.tradeName ||
                    item.customer?.legalName ||
                    `Cliente #${item.customerId}`;
                  const methodLabel = getPaymentMethodLabel(item);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => void handleOpenDetail(item)}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 sm:px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                        {formatDateDisplay(item.createdAt)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isPerformed
                              ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {item.status.label ||
                            (isPerformed ? "Efectuado" : "Declinado")}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-semibold text-gray-800 dark:text-gray-200">
                        <div>
                          <span className="font-mono text-xs text-[#6C7D38] dark:text-[#9ab054] mr-2">
                            {item.transactionReference || item.quoteNumber}
                          </span>
                          <span>{getItemsSummary(item)}</span>
                          <p className="text-[11px] font-normal text-gray-400 md:hidden mt-0.5">
                            {clientName} • {methodLabel}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell text-gray-600 dark:text-gray-300">
                        {clientName}
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-gray-500 dark:text-gray-400 capitalize">
                        {methodLabel}
                      </td>
                      <td
                        className={`py-4 px-4 sm:px-6 text-right font-bold whitespace-nowrap text-sm ${
                          isPerformed
                            ? "text-[#2A3319] dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPerformed ? "+" : "-"}
                        {formatCurrency(item.amounts.total)}
                      </td>
                      <td
                        className="py-4 px-4 sm:px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => void handleOpenDetail(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C7D38] dark:text-[#9ab054] hover:underline cursor-pointer"
                        >
                          <Eye size={15} />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-gray-400 text-xs"
                  >
                    No se encontraron transacciones históricas para los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedTx(null);
          }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-2xl my-8 text-gray-800 dark:text-gray-100">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {selectedTx.transactionReference || selectedTx.quoteNumber}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedTx.status.label} ·{" "}
                  {formatDateDisplay(selectedTx.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label="Cerrar detalle"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="animate-spin text-[#6C7D38]" size={18} />
                <span>Cargando detalle de la transacción...</span>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4 text-xs sm:text-sm">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-100 dark:border-gray-700/60">
                  <div>
                    <dt className="text-xs text-gray-400">Cliente</dt>
                    <dd className="font-semibold mt-0.5">
                      {selectedTx.customer?.legalName}
                    </dd>
                    {selectedTx.customer?.phone && (
                      <dd className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedTx.customer.phone}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Colaborador</dt>
                    <dd className="font-semibold mt-0.5">
                      {selectedTx.employee?.fullName || "No asignado"}
                    </dd>
                    {selectedTx.plan?.name && (
                      <dd className="text-xs text-gray-500 dark:text-gray-400">
                        Plan: {selectedTx.plan.name}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Subtotal / Total</dt>
                    <dd className="font-semibold mt-0.5">
                      {formatCurrency(selectedTx.amounts.total)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">
                      {selectedTx.declinedAt
                        ? "Fecha de declinación"
                        : "Pagos registrados"}
                    </dt>
                    <dd className="font-semibold mt-0.5">
                      {selectedTx.declinedAt
                        ? formatDateDisplay(selectedTx.declinedAt)
                        : selectedTx.payments.length > 0
                          ? selectedTx.payments
                              .map(
                                (p) =>
                                  `${formatCurrency(p.amountPaid)} (${p.paymentMethod})`,
                              )
                              .join(", ")
                          : "Sin pagos"}
                    </dd>
                  </div>
                </dl>

                {selectedTx.items.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Ítems de la cotización
                    </span>
                    <div className="rounded-xl border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-100 dark:divide-gray-700/60">
                      {selectedTx.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-2.5 text-xs"
                        >
                          <span>
                            {item.service?.name ||
                              item.plant?.name ||
                              item.itemType}{" "}
                            <strong className="text-gray-400">
                              ×{item.quantity}
                            </strong>
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-[#6C7D38] hover:bg-[#5b6a2f] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
