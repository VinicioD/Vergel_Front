// src/components/reports/ReportsView.tsx
import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { isAxiosError } from "axios";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  getCollectionsReport,
  getCustomersReport,
  getPlantsReport,
  getProfitabilityReport,
  getPurchasesReport,
  getQuotesStatusReport,
  getSalesReport,
  getSubscriptionsReport,
} from "../../services/reportService";
import type {
  CollectionReportItem,
  CustomerReportItem,
  PlantReportItem,
  ProfitabilityReportItem,
  PurchaseReportItem,
  QuotesStatusReportItem,
  SalesReportItem,
  SubscriptionReportItem,
} from "../../types/report";
import {
  ReportPdfDocument,
  type ReportPdfRow,
  type ReportPdfSummaryItem,
} from "../../pdf/ReportPdfDocument";
import Table, { type Column } from "../Table";

export interface ReportsViewProps {
  title?: string;
  subtitle?: string;
}

type ReportKey =
  | "sales"
  | "customers"
  | "plants"
  | "collections"
  | "quotes-status"
  | "purchases"
  | "profitability"
  | "subscriptions";

type ReportRow = Record<string, unknown> & { id: string | number };

type AnnualReportRow = ProfitabilityReportItem & { id: string };

const REPORT_OPTIONS: { key: ReportKey; label: string }[] = [
  { key: "sales", label: "Ventas Mensuales" },
  { key: "customers", label: "Ranking Clientes" },
  { key: "plants", label: "Ranking Plantas" },
  { key: "collections", label: "Cobros por Empleado" },
  { key: "quotes-status", label: "Estado Cotizaciones" },
  { key: "purchases", label: "Compras Proveedor" },
  { key: "profitability", label: "Rentabilidad" },
  { key: "subscriptions", label: "Suscripciones" },
];

const formatCurrency = (value?: number) => {
  const safe = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(safe);
};

const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportCsvFile = (
  baseFilename: string,
  headers: string[],
  rows: ReportPdfRow[],
  summaryItems: ReportPdfSummaryItem[],
) => {
  const escapeCell = (val: string) => {
    const safe = String(val ?? "").replace(/"/g, '""');
    return `"${safe}"`;
  };

  const lines: string[] = [];

  if (summaryItems.length > 0) {
    lines.push("RESUMEN");
    summaryItems.forEach((item) => {
      lines.push(`${escapeCell(item.label)},${escapeCell(item.value)}`);
    });
    lines.push("");
  }

  lines.push(headers.map(escapeCell).join(","));
  rows.forEach((row) => {
    lines.push(row.cells.map(escapeCell).join(","));
  });

  const csvWithBom = `\uFEFF${lines.join("\n")}`;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  triggerFileDownload(blob, `${baseFilename}.csv`);
};

function getRowCellText(
  row: Record<string, unknown>,
  col: Column<Record<string, unknown>>,
): string {
  if (col.accessorKey) {
    const raw = row[col.accessorKey];
    return raw === null || raw === undefined ? "—" : String(raw);
  }
  if (col.render) {
    const rendered = col.render(row);
    if (typeof rendered === "string" || typeof rendered === "number") {
      return String(rendered);
    }
  }
  return "—";
}

export default function ReportsView({
  title = "Reportes & Finanzas",
  subtitle = "Informes analíticos de ventas, cobros, compras, rentabilidad y suscripciones",
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"explorer" | "profitability">(
    "explorer",
  );
  const [selectedReport, setSelectedReport] = useState<ReportKey>("sales");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [kpiSales, setKpiSales] = useState(0);
  const [kpiPaid, setKpiPaid] = useState(0);
  const [kpiPending, setKpiPending] = useState(0);
  const [kpiMargin, setKpiMargin] = useState(0);
  const [isLoadingKpis, setIsLoadingKpis] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [summaryEntries, setSummaryEntries] = useState<[string, unknown][]>([]);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [annualRows, setAnnualRows] = useState<AnnualReportRow[]>([]);
  const [isLoadingAnnual, setIsLoadingAnnual] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const loadKpis = async () => {
      setIsLoadingKpis(true);
      setErrorMessage("");
      try {
        const dateParams = {
          from: fromDate || undefined,
          to: toDate || undefined,
        };
        const [salesRes, profRes] = await Promise.all([
          getSalesReport(dateParams),
          getProfitabilityReport(dateParams),
        ]);

        setKpiSales(salesRes.meta?.summary?.totalSales ?? 0);
        setKpiPaid(salesRes.meta?.summary?.totalPaid ?? 0);
        setKpiPending(salesRes.meta?.summary?.totalPending ?? 0);
        setKpiMargin(profRes.meta?.summary?.averageMarginPercentage ?? 0);
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 403) {
            setErrorMessage(
              "No tienes permisos para consultar los reportes analíticos.",
            );
          } else {
            const msg = (
              error.response?.data as { message?: string } | undefined
            )?.message;
            setErrorMessage(msg || "No se pudieron cargar los indicadores.");
          }
        } else {
          setErrorMessage("No se pudieron cargar los indicadores.");
        }
      } finally {
        setIsLoadingKpis(false);
      }
    };

    void loadKpis();
  }, [fromDate, toDate]);

  useEffect(() => {
    if (activeTab !== "explorer") return;
    let active = true;

    const loadActiveReport = async () => {
      setIsLoadingReport(true);
      setErrorMessage("");
      const baseParams = {
        from: fromDate || undefined,
        to: toDate || undefined,
        page: currentPage,
        per_page: 10,
      };

      try {
        let mappedRows: ReportRow[] = [];
        let summaryObj: Record<string, unknown> | undefined;
        let paginationTotal: number | undefined;

        switch (selectedReport) {
          case "sales": {
            const res = await getSalesReport({
              from: baseParams.from,
              to: baseParams.to,
            });
            mappedRows = (res.data ?? []).map((item: SalesReportItem, idx) => ({
              ...item,
              id: item.period || `sales-${idx}`,
            }));
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            break;
          }
          case "customers": {
            const res = await getCustomersReport(baseParams);
            mappedRows = (res.data ?? []).map((item: CustomerReportItem) => ({
              ...item,
              id: item.customerId,
            }));
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            paginationTotal = res.meta?.total;
            break;
          }
          case "plants": {
            const res = await getPlantsReport(baseParams);
            mappedRows = (res.data ?? []).map((item: PlantReportItem) => ({
              ...item,
              id: item.plantId,
            }));
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            paginationTotal = res.meta?.total;
            break;
          }
          case "collections": {
            const res = await getCollectionsReport(baseParams);
            mappedRows = (res.data ?? []).map(
              (item: CollectionReportItem, idx) => ({
                ...item,
                id: item.employeeId ?? `col-${idx}`,
                methodsSummary: item.methods
                  ? Object.entries(item.methods)
                      .map(([k, v]) => `${k}: ${formatCurrency(v)}`)
                      .join(" · ")
                  : "—",
              }),
            );
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            paginationTotal = res.meta?.total;
            break;
          }
          case "quotes-status": {
            const res = await getQuotesStatusReport({
              from: baseParams.from,
              to: baseParams.to,
            });
            mappedRows = (res.data ?? []).map(
              (item: QuotesStatusReportItem, idx) => ({
                ...item,
                id: item.status || `qs-${idx}`,
              }),
            );
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            break;
          }
          case "purchases": {
            const res = await getPurchasesReport(baseParams);
            mappedRows = (res.data ?? []).map(
              (item: PurchaseReportItem, idx) => ({
                ...item,
                id: item.supplierTaxId || item.supplierName || `pur-${idx}`,
              }),
            );
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            paginationTotal = res.meta?.total;
            break;
          }
          case "profitability": {
            const res = await getProfitabilityReport({
              from: baseParams.from,
              to: baseParams.to,
            });
            mappedRows = (res.data ?? []).map(
              (item: ProfitabilityReportItem, idx) => ({
                ...item,
                id: item.period || `prof-${idx}`,
              }),
            );
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            break;
          }
          case "subscriptions": {
            const res = await getSubscriptionsReport(baseParams);
            mappedRows = (res.data ?? []).map(
              (item: SubscriptionReportItem, idx) => ({
                ...item,
                id: item.plan?.id ?? `sub-${idx}`,
                planName: item.plan?.name || "—",
                planCode: item.plan?.code || "",
              }),
            );
            summaryObj = res.meta?.summary as unknown as Record<
              string,
              unknown
            >;
            paginationTotal = res.meta?.total;
            break;
          }
        }

        if (!active) return;
        setRows(mappedRows);
        setSummaryEntries(summaryObj ? Object.entries(summaryObj) : []);
        setTotalItems(paginationTotal);
      } catch (error) {
        if (!active) return;
        if (isAxiosError(error) && error.response?.status === 403) {
          setErrorMessage("No tienes permisos para ver este reporte.");
        }
      } finally {
        if (active) setIsLoadingReport(false);
      }
    };

    void loadActiveReport();
    return () => {
      active = false;
    };
  }, [activeTab, selectedReport, fromDate, toDate, currentPage]);

  useEffect(() => {
    if (activeTab !== "profitability") return;
    let active = true;

    const loadAnnual = async () => {
      setIsLoadingAnnual(true);
      try {
        const res = await getProfitabilityReport({
          from: `${selectedYear}-01-01`,
          to: `${selectedYear}-12-31`,
        });
        if (!active) return;
        const mapped = (res.data ?? []).map((item, idx) => ({
          ...item,
          id: item.period || `${selectedYear}-${idx}`,
        }));
        setAnnualRows(mapped);
      } catch (error) {
        if (!active) return;
        console.error("Error al cargar rentabilidad anual:", error);
      } finally {
        if (active) setIsLoadingAnnual(false);
      }
    };

    void loadAnnual();
    return () => {
      active = false;
    };
  }, [activeTab, selectedYear]);

  const explorerColumns: Column<ReportRow>[] = useMemo(() => {
    switch (selectedReport) {
      case "sales":
        return [
          { header: "Período", accessorKey: "period" },
          { header: "Cotizaciones", accessorKey: "quotesCount" },
          {
            header: "Ventas",
            render: (r) => formatCurrency(Number(r.totalSales ?? 0)),
          },
          {
            header: "Cobrado",
            render: (r) => formatCurrency(Number(r.totalPaid ?? 0)),
          },
          {
            header: "Pendiente",
            render: (r) => formatCurrency(Number(r.totalPending ?? 0)),
          },
          {
            header: "Ticket Prom.",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.averageTicket ?? 0)),
          },
        ];
      case "customers":
        return [
          { header: "Cliente", accessorKey: "legalName" },
          { header: "Cotizaciones", accessorKey: "quotesCount" },
          {
            header: "Facturado",
            render: (r) => formatCurrency(Number(r.totalBilled ?? 0)),
          },
          {
            header: "Pagado",
            render: (r) => formatCurrency(Number(r.totalPaid ?? 0)),
          },
          {
            header: "Pendiente",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.totalPending ?? 0)),
          },
        ];
      case "plants":
        return [
          { header: "Planta", accessorKey: "plantName" },
          { header: "Categoría", accessorKey: "categoryType" },
          { header: "Unidades", accessorKey: "unitsSold" },
          { header: "Cotizaciones", accessorKey: "quotesCount" },
          {
            header: "Ingreso Total",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.totalRevenue ?? 0)),
          },
        ];
      case "collections":
        return [
          { header: "Empleado", accessorKey: "employeeName" },
          { header: "Cobros", accessorKey: "paymentsCount" },
          { header: "Métodos", accessorKey: "methodsSummary" },
          {
            header: "Total Cobrado",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.totalCollected ?? 0)),
          },
        ];
      case "quotes-status":
        return [
          { header: "Estado", accessorKey: "statusLabel" },
          { header: "Cotizaciones", accessorKey: "quotesCount" },
          {
            header: "Total",
            render: (r) => formatCurrency(Number(r.totalAmount ?? 0)),
          },
          {
            header: "Pagado",
            render: (r) => formatCurrency(Number(r.paidAmount ?? 0)),
          },
          {
            header: "Pendiente",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.pendingAmount ?? 0)),
          },
        ];
      case "purchases":
        return [
          { header: "Proveedor", accessorKey: "supplierName" },
          { header: "NIT", accessorKey: "supplierTaxId" },
          { header: "NRC", accessorKey: "supplierNrc" },
          { header: "Compras", accessorKey: "purchasesCount" },
          {
            header: "Total Comprado",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.totalPurchased ?? 0)),
          },
        ];
      case "profitability":
        return [
          { header: "Período", accessorKey: "period" },
          {
            header: "Ventas",
            render: (r) => formatCurrency(Number(r.sales ?? 0)),
          },
          {
            header: "Compras",
            render: (r) => formatCurrency(Number(r.purchases ?? 0)),
          },
          {
            header: "Gastos",
            render: (r) => formatCurrency(Number(r.expenses ?? 0)),
          },
          {
            header: "Utilidad",
            render: (r) => formatCurrency(Number(r.utility ?? 0)),
          },
          {
            header: "Margen %",
            className: "text-right",
            render: (r) => `${Number(r.marginPercentage ?? 0).toFixed(2)}%`,
          },
        ];
      case "subscriptions":
        return [
          { header: "Plan", accessorKey: "planName" },
          { header: "Código", accessorKey: "planCode" },
          { header: "Total", accessorKey: "subscriptionsCount" },
          { header: "Activas", accessorKey: "activeCount" },
          {
            header: "Pagado",
            render: (r) => formatCurrency(Number(r.totalPaid ?? 0)),
          },
          {
            header: "Reservado",
            className: "text-right",
            render: (r) => formatCurrency(Number(r.reservedBalance ?? 0)),
          },
        ];
    }
  }, [selectedReport]);

  const annualColumns: Column<AnnualReportRow>[] = useMemo(
    () => [
      {
        header: "Período",
        render: (row) => <span className="font-bold">{row.period}</span>,
      },
      {
        header: "Ventas",
        render: (row) => formatCurrency(row.sales),
      },
      {
        header: "Compras",
        render: (row) => formatCurrency(row.purchases),
      },
      {
        header: "Gastos",
        render: (row) => formatCurrency(row.expenses),
      },
      {
        header: "Utilidad Neta",
        render: (row) => (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(row.utility)}
          </span>
        ),
      },
      {
        header: "Margen",
        className: "text-right",
        render: (row) => `${row.marginPercentage.toFixed(2)}%`,
      },
    ],
    [],
  );

  const buildExportPayload = () => {
    const dateRangeLabel =
      activeTab === "profitability"
        ? `Año ${selectedYear}`
        : fromDate || toDate
          ? `${fromDate || "Inicio"} al ${toDate || "Actualidad"}`
          : "Todo el historial";

    if (activeTab === "profitability") {
      const headers = annualColumns.map((c) => c.header);
      const pdfRows: ReportPdfRow[] = annualRows.map((row) => ({
        cells: [
          row.period,
          formatCurrency(row.sales),
          formatCurrency(row.purchases),
          formatCurrency(row.expenses),
          formatCurrency(row.utility),
          `${row.marginPercentage.toFixed(2)}%`,
        ],
      }));
      return {
        reportTitle: `Rentabilidad Anual (${selectedYear})`,
        baseFilename: `reporte-rentabilidad-${selectedYear}`,
        dateRangeLabel,
        headers,
        pdfRows,
        summaryItems: [] as ReportPdfSummaryItem[],
      };
    }

    const activeOption = REPORT_OPTIONS.find((o) => o.key === selectedReport);
    const headers = explorerColumns.map((c) => c.header);
    const pdfRows: ReportPdfRow[] = rows.map((row) => ({
      cells: explorerColumns.map((col) =>
        getRowCellText(row, col as Column<Record<string, unknown>>),
      ),
    }));
    const summaryItems: ReportPdfSummaryItem[] = summaryEntries.map(
      ([key, val]) => ({
        label: key,
        value: typeof val === "number" ? val.toLocaleString() : String(val),
      }),
    );

    return {
      reportTitle: activeOption?.label ?? "Reporte",
      baseFilename: `reporte-${selectedReport}`,
      dateRangeLabel,
      headers,
      pdfRows,
      summaryItems,
    };
  };

  const handleExportExcel = () => {
    const { baseFilename, headers, pdfRows, summaryItems } =
      buildExportPayload();
    exportCsvFile(baseFilename, headers, pdfRows, summaryItems);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const {
        reportTitle,
        baseFilename,
        dateRangeLabel,
        headers,
        pdfRows,
        summaryItems,
      } = buildExportPayload();

      const blob = await pdf(
        <ReportPdfDocument
          reportTitle={reportTitle}
          dateRangeLabel={dateRangeLabel}
          headers={headers}
          rows={pdfRows}
          summaryItems={summaryItems}
          orientation="landscape"
        />,
      ).toBlob();

      triggerFileDownload(blob, `${baseFilename}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const paidPercent =
    kpiSales > 0 ? `${((kpiPaid / kpiSales) * 100).toFixed(1)}% cobrado` : "0%";

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Filtro de rango de fechas */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm self-start lg:self-auto text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Desde:
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none"
          />
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Hasta:
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold outline-none"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 shrink-0 flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 shrink-0">
        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Ventas
            </span>
            <DollarSign size={16} className="text-[#5b642a]" />
          </div>
          {isLoadingKpis ? (
            <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
              {formatCurrency(kpiSales)}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Cobrado
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          {isLoadingKpis ? (
            <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(kpiPaid)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600/80">
                {paidPercent}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pendiente de Cobro
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          {isLoadingKpis ? (
            <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(kpiPending)}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Margen Promedio
            </span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          {isLoadingKpis ? (
            <div className="h-7 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {kpiMargin.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Pestañas, selector y botones de exportación */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
        <div className="inline-flex p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab("explorer");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "explorer"
                ? "bg-[#6C7D38] text-white shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={14} />
            <span>Explorador de Reportes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("profitability");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "profitability"
                ? "bg-[#6C7D38] text-white shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            <span>Rentabilidad Anual</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "explorer" ? (
            <select
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value as ReportKey);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-[#6C7D38]"
            >
              {REPORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-[#6C7D38]"
            >
              <option value="2026">Año 2026</option>
              <option value="2025">Año 2025</option>
            </select>
          )}

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExportingPdf ? "PDF..." : "PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Resumen de meta.summary cuando está en Explorador */}
      {activeTab === "explorer" && summaryEntries.length > 0 && (
        <div className="mb-3 shrink-0 flex flex-wrap gap-2">
          {summaryEntries.map(([key, val]) => (
            <div
              key={key}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 text-xs flex items-center gap-1.5"
            >
              <span className="text-gray-400 font-medium">{key}:</span>
              <span className="font-bold text-gray-800 dark:text-gray-100">
                {typeof val === "number" ? val.toLocaleString() : String(val)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Área de Tabla con scroll interno */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === "explorer" ? (
          <Table
            data={rows}
            columns={explorerColumns}
            itemsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            entityName="registros"
            isLoading={isLoadingReport}
          />
        ) : (
          <Table
            data={annualRows}
            columns={annualColumns}
            itemsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            entityName="períodos"
            isLoading={isLoadingAnnual}
          />
        )}
      </div>
    </div>
  );
}
