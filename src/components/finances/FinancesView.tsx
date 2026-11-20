// src/components/finances/FinancesView.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Table as TableIcon,
} from "lucide-react";
import {
  getFinanceMovements,
  getFinancePurchases,
  getFinanceQuotes,
  getFinanceSummary,
} from "../../services/financeService";
import type {
  FinanceMovementItem,
  FinancePaymentStatusFilter,
  FinancePurchaseItem,
  FinanceQuoteItem,
  FinanceSummary,
} from "../../types/finance";
import Table, { type Column } from "../Table";

export interface FinancesViewProps {
  title?: string;
  subtitle?: string;
}

type CarouselSlide = "charts" | "tables";

const ITEMS_PER_PAGE = 10;

const PAYMENT_STATUS_FILTERS: {
  label: string;
  value: FinancePaymentStatusFilter;
}[] = [
  { label: "Todas", value: "all" },
  { label: "Pagadas", value: "paid" },
  { label: "Parciales", value: "partial" },
  { label: "Pendientes", value: "pending" },
];

const PAYMENT_BADGE_STYLES: Record<string, string> = {
  paid: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  partial:
    "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  pending:
    "bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
};

const formatCurrency = (value?: number) => {
  const safe = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(safe);
};

export default function FinancesView({
  title = "Panel Financiero",
  subtitle = "Control de ingresos, egresos, cobros y compras en tiempo real",
}: FinancesViewProps) {
  // Slide del carrusel: "charts" (gráficas + movimientos) | "tables" (cotizaciones + compras)
  const [activeSlide, setActiveSlide] = useState<CarouselSlide>("charts");

  // Filtros globales de fecha
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Datos principales
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [movements, setMovements] = useState<FinanceMovementItem[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Pestaña de tabla dentro del slide "tables"
  const [tableTab, setTableTab] = useState<"quotes" | "purchases">("quotes");

  // Estado tabla de cotizaciones
  const [quotes, setQuotes] = useState<FinanceQuoteItem[]>([]);
  const [quotesTotal, setQuotesTotal] = useState(0);
  const [quotesPage, setQuotesPage] = useState(1);
  const [quoteStatusFilter, setQuoteStatusFilter] =
    useState<FinancePaymentStatusFilter>("all");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Estado tabla de compras
  const [purchases, setPurchases] = useState<FinancePurchaseItem[]>([]);
  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  // 1. Cargar resumen y movimientos recientes
  const loadSummaryAndMovements = useCallback(async () => {
    setIsLoadingSummary(true);
    setErrorMessage("");
    try {
      const dateParams = {
        from: fromDate || undefined,
        to: toDate || undefined,
      };
      const [summaryRes, movementsRes] = await Promise.all([
        getFinanceSummary(dateParams),
        getFinanceMovements({ ...dateParams, per_page: 6 }),
      ]);
      setSummary(summaryRes.data ?? null);
      setMovements(movementsRes.data ?? []);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorMessage(
            "No tienes permisos para consultar los indicadores financieros.",
          );
        } else {
          const msg = (error.response?.data as { message?: string } | undefined)
            ?.message;
          setErrorMessage(
            msg || "No se pudo cargar la información financiera.",
          );
        }
      } else {
        setErrorMessage("No se pudo cargar la información financiera.");
      }
    } finally {
      setIsLoadingSummary(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void loadSummaryAndMovements();
  }, [loadSummaryAndMovements]);

  // 2. Cargar cotizaciones paginadas
  useEffect(() => {
    if (activeSlide !== "tables" || tableTab !== "quotes") return;
    let active = true;

    const loadQuotes = async () => {
      setIsLoadingQuotes(true);
      try {
        const res = await getFinanceQuotes({
          from: fromDate || undefined,
          to: toDate || undefined,
          payment_status:
            quoteStatusFilter === "all" ? undefined : quoteStatusFilter,
          quote_number: quoteSearch.trim() || undefined,
          per_page: ITEMS_PER_PAGE,
          page: quotesPage,
        });
        if (!active) return;
        setQuotes(res.data ?? []);
        setQuotesTotal(res.meta?.total ?? (res.data ?? []).length);
      } catch (error) {
        if (!active) return;
        console.error("Error al cargar cotizaciones financieras:", error);
      } finally {
        if (active) setIsLoadingQuotes(false);
      }
    };

    void loadQuotes();
    return () => {
      active = false;
    };
  }, [
    activeSlide,
    tableTab,
    fromDate,
    toDate,
    quoteStatusFilter,
    quoteSearch,
    quotesPage,
  ]);

  // 3. Cargar compras paginadas
  useEffect(() => {
    if (activeSlide !== "tables" || tableTab !== "purchases") return;
    let active = true;

    const loadPurchases = async () => {
      setIsLoadingPurchases(true);
      try {
        const res = await getFinancePurchases({
          from: fromDate || undefined,
          to: toDate || undefined,
          supplier: supplierSearch.trim() || undefined,
          per_page: ITEMS_PER_PAGE,
          page: purchasesPage,
        });
        if (!active) return;
        setPurchases(res.data ?? []);
        setPurchasesTotal(res.meta?.total ?? (res.data ?? []).length);
      } catch (error) {
        if (!active) return;
        console.error("Error al cargar compras financieras:", error);
      } finally {
        if (active) setIsLoadingPurchases(false);
      }
    };

    void loadPurchases();
    return () => {
      active = false;
    };
  }, [activeSlide, tableTab, fromDate, toDate, supplierSearch, purchasesPage]);

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setQuoteStatusFilter("all");
    setQuoteSearch("");
    setSupplierSearch("");
    setQuotesPage(1);
    setPurchasesPage(1);
  };

  const quoteColumns: Column<FinanceQuoteItem>[] = useMemo(
    () => [
      {
        header: "N° Cotización",
        render: (q) => (
          <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {q.quoteNumber}
          </span>
        ),
      },
      {
        header: "Cliente",
        render: (q) => (
          <span className="text-gray-700 dark:text-gray-200">
            {q.customerName}
          </span>
        ),
      },
      {
        header: "Total",
        render: (q) => (
          <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {formatCurrency(q.total)}
          </span>
        ),
      },
      {
        header: "Cobrado",
        render: (q) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            {formatCurrency(q.paidAmount)}
          </span>
        ),
      },
      {
        header: "Pendiente",
        render: (q) => (
          <span className="font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            {formatCurrency(q.pendingAmount)}
          </span>
        ),
      },
      {
        header: "Estado Cobro",
        className: "text-right",
        render: (q) => {
          const style =
            PAYMENT_BADGE_STYLES[q.paymentStatus.key] ??
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${style}`}
            >
              {q.paymentStatus.label}
            </span>
          );
        },
      },
    ],
    [],
  );

  const purchaseColumns: Column<FinancePurchaseItem>[] = useMemo(
    () => [
      {
        header: "Fecha",
        render: (p) => (
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {p.issueDate}
          </span>
        ),
      },
      {
        header: "Documento",
        render: (p) => (
          <div className="whitespace-nowrap">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">
              {p.documentNumber}
            </p>
            <p className="text-[11px] text-gray-400">{p.documentType}</p>
          </div>
        ),
      },
      {
        header: "Proveedor",
        render: (p) => (
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {p.supplier?.name || "—"}
            </p>
            {p.supplier?.taxId && (
              <p className="text-[11px] text-gray-400">
                NIT: {p.supplier.taxId}
              </p>
            )}
          </div>
        ),
      },
      {
        header: "IVA",
        className: "hidden md:table-cell",
        render: (p) => (
          <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {formatCurrency(p.amounts?.vat)}
          </span>
        ),
      },
      {
        header: "Total",
        className: "text-right",
        render: (p) => (
          <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {formatCurrency(p.amounts?.total)}
          </span>
        ),
      },
    ],
    [],
  );

  const totalIngresos = summary?.totalPaid ?? summary?.totalProduction ?? 0;
  const totalEgresos = summary?.totalPurchases ?? 0;
  const gananciaNeta = summary?.profitability ?? 0;
  const cuentasPorCobrar = summary?.totalPending ?? 0;

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado Principal + Filtros de Fecha + Controles de Carrusel */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rango de fechas */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="text-[#6C7D38]" />
              <span className="font-medium">Desde:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setQuotesPage(1);
                  setPurchasesPage(1);
                }}
                className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none text-xs"
              />
            </div>

            <span className="text-gray-300 dark:text-gray-600">|</span>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Hasta:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setQuotesPage(1);
                  setPurchasesPage(1);
                }}
                className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none text-xs"
              />
            </div>

            {(fromDate || toDate || quoteSearch || supplierSearch) && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Limpiar filtros"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-[11px] font-semibold text-gray-600 dark:text-gray-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Selector de Slide del Carrusel */}
          <div className="inline-flex items-center p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveSlide("charts")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSlide === "charts"
                  ? "bg-[#6C7D38] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 size={14} />
              <span>Gráficas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSlide("tables")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSlide === "tables"
                  ? "bg-[#6C7D38] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <TableIcon size={14} />
              <span>Tablas</span>
            </button>

            <div className="flex items-center gap-0.5 pl-1 ml-1 border-l border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() =>
                  setActiveSlide((s) => (s === "tables" ? "charts" : "tables"))
                }
                title="Slide anterior"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSlide((s) => (s === "charts" ? "tables" : "charts"))
                }
                title="Siguiente slide"
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 shrink-0 flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid de Cards Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 shrink-0">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Total Cobrado
          </span>
          <div className="flex items-baseline justify-between mt-2 gap-2">
            {isLoadingSummary ? (
              <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(totalIngresos)}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 whitespace-nowrap">
              Prod: {formatCurrency(summary?.totalProduction)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Total Compras
          </span>
          <div className="flex items-baseline justify-between mt-2 gap-2">
            {isLoadingSummary ? (
              <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(totalEgresos)}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              Egresos
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Rentabilidad
          </span>
          <div className="flex items-baseline justify-between mt-2 gap-2">
            {isLoadingSummary ? (
              <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(gananciaNeta)}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Utilidad
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Saldo Pendiente
          </span>
          <div className="flex items-baseline justify-between mt-2 gap-2">
            {isLoadingSummary ? (
              <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(cuentasPorCobrar)}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 whitespace-nowrap">
              Abonos: {formatCurrency(summary?.partialPaymentsTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* CARRUSEL HORIZONTAL (Slide 1: Gráficas | Slide 2: Tablas) */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div
          className="h-full w-full flex transition-transform duration-500 ease-out"
          style={{
            transform:
              activeSlide === "charts" ? "translateX(0%)" : "translateX(-100%)",
          }}
        >
          {/* SLIDE 1: GRÁFICAS Y MOVIMIENTOS RECIENTES */}
          <div className="w-full h-full shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-center">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Balance Financiero
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                Comparativa según el período filtrado
              </p>

              {(() => {
                const maxRef = Math.max(
                  summary?.totalProduction ?? 0,
                  totalIngresos,
                  totalEgresos,
                  cuentasPorCobrar,
                  1,
                );
                const rows = [
                  {
                    label: "Producción Total",
                    value: summary?.totalProduction ?? 0,
                    barClass: "bg-[#6C7D38]",
                  },
                  {
                    label: "Total Cobrado",
                    value: totalIngresos,
                    barClass: "bg-emerald-600",
                  },
                  {
                    label: "Compras Registradas",
                    value: totalEgresos,
                    barClass: "bg-[#D88A63]",
                  },
                  {
                    label: "Pendiente por Cobrar",
                    value: cuentasPorCobrar,
                    barClass: "bg-amber-500",
                  },
                ];

                return (
                  <div className="flex flex-col gap-4">
                    {rows.map((row) => {
                      const pct = Math.min(
                        100,
                        Math.round((row.value / maxRef) * 100),
                      );
                      return (
                        <div key={row.label}>
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {row.label}
                            </span>
                            <span>{formatCurrency(row.value)}</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden p-0.5">
                            <div
                              className={`${row.barClass} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between min-h-0">
              <div className="flex-1 min-h-0 flex flex-col">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 shrink-0">
                  Movimientos Recientes
                </h2>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                  {isLoadingSummary ? (
                    <div className="space-y-3 animate-pulse">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-11 rounded-xl bg-gray-100 dark:bg-gray-700/60"
                        />
                      ))}
                    </div>
                  ) : movements.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
                      {movements.slice(0, 6).map((mov) => (
                        <div
                          key={mov.id}
                          className="py-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 dark:text-gray-200 truncate">
                              {mov.entity?.name ||
                                mov.documentNumber ||
                                `Movimiento #${mov.id}`}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {mov.typeLabel || mov.type} · {mov.date}
                            </p>
                          </div>
                          <span
                            className={`font-bold whitespace-nowrap ${
                              mov.type === "sale"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {mov.type === "sale" ? "+" : "-"}
                            {formatCurrency(mov.amounts?.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">
                      No hay movimientos financieros en este rango.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: TABLAS (COTIZACIONES Y COMPRAS) CON SCROLL INTERNO */}
          <div className="w-full h-full shrink-0 flex flex-col gap-3 min-h-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shrink-0">
              {/* Pestañas de Tabla */}
              <div className="inline-flex p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
                <button
                  type="button"
                  onClick={() => setTableTab("quotes")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    tableTab === "quotes"
                      ? "bg-[#6C7D38] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <FileText size={14} />
                  <span>Estado de Cotizaciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTableTab("purchases")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    tableTab === "purchases"
                      ? "bg-[#6C7D38] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>Compras Registradas</span>
                </button>
              </div>

              {/* Filtros específicos de cada tabla */}
              {tableTab === "quotes" ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="inline-flex flex-wrap p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
                    {PAYMENT_STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => {
                          setQuoteStatusFilter(f.value);
                          setQuotesPage(1);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          quoteStatusFilter === f.value
                            ? "bg-[#6C7D38] text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Buscar N° cotización..."
                      value={quoteSearch}
                      onChange={(e) => {
                        setQuoteSearch(e.target.value);
                        setQuotesPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full sm:w-72">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre de proveedor..."
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setPurchasesPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Contenedor con scroll interno en la tabla */}
            <div className="flex-1 min-h-0 flex flex-col">
              {tableTab === "quotes" ? (
                <Table
                  data={quotes}
                  columns={quoteColumns}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={quotesPage}
                  onPageChange={setQuotesPage}
                  totalItems={quotesTotal}
                  entityName="cotizaciones"
                  isLoading={isLoadingQuotes}
                />
              ) : (
                <Table
                  data={purchases}
                  columns={purchaseColumns}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={purchasesPage}
                  onPageChange={setPurchasesPage}
                  totalItems={purchasesTotal}
                  entityName="compras"
                  isLoading={isLoadingPurchases}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de punto del carrusel */}
      <div className="pt-2.5 shrink-0 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSlide("charts")}
          aria-label="Ir a slide de gráficas"
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activeSlide === "charts"
              ? "w-7 bg-[#6C7D38]"
              : "w-2 bg-gray-300 dark:bg-gray-600"
          }`}
        />
        <button
          type="button"
          onClick={() => setActiveSlide("tables")}
          aria-label="Ir a slide de tablas"
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activeSlide === "tables"
              ? "w-7 bg-[#6C7D38]"
              : "w-2 bg-gray-300 dark:bg-gray-600"
          }`}
        />
      </div>
    </div>
  );
}
