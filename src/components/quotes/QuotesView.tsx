// src/components/quotes/QuotesView.tsx
// Vista reutilizable de cotizaciones. Los datos provienen del API; la navegación
// a "nueva cotización" la resuelve el rol que monta esta vista.
import { useEffect, useState } from "react";
import { Search, Download, Plus, RefreshCw, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import QuotesPdfDocument from "../../pdf/QuotesPdfDocument";
import Button from "../Button";
import Input from "../Input";
import Table, { type Column } from "../Table";
import SearchableSelect, { type SelectOption } from "../SearchableSelect";
import { getQuotes, getQuoteErrorMessage } from "../../services/quoteService";
import type { Quote as ApiQuote, QuoteStatus } from "../../types/quote";

export type QuoteStatusView = "Aprobada" | "Pendiente";

export interface Quote {
  id: number;
  code: string;
  client: string;
  date: string;
  services: string;
  amount: string;
  status: QuoteStatusView;
}

export interface QuotesViewProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onNewQuote?: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "ALL" },
  { label: "Pendiente", value: "pending" },
  { label: "Pagada", value: "paid" },
];

const STATUS_BADGES: Record<QuoteStatusView, string> = {
  Aprobada:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Pendiente:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toViewQuote = (quote: ApiQuote): Quote => {
  const services = quote.items
    .map((item) => item.name)
    .filter((name): name is string => Boolean(name))
    .join(", ");

  return {
    id: quote.id,
    code: quote.code || `COT-${quote.id}`,
    client: quote.customerName || "Sin cliente",
    date: formatDate(quote.createdAt),
    services: services || "Sin ítems",
    amount: formatCurrency(quote.total),
    status: quote.status === "paid" ? "Aprobada" : "Pendiente",
  };
};

function QuotesTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando cotizaciones"
      aria-busy="true"
      className="w-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200/40 bg-[#ECE6DB] text-xs font-bold uppercase tracking-wider text-[#3a3d20] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
              {["N° COTIZACIÓN", "CLIENTE", "FECHA", "SERVICIOS", "MONTO", "ESTADO"].map(
                (header) => (
                  <th key={header} className="px-6 py-4">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-5">
                    <div
                      className={`h-3 rounded-md bg-gray-200 dark:bg-gray-700 ${
                        cellIndex === 3
                          ? "w-40"
                          : cellIndex === 5
                            ? "h-6 w-20 rounded-full"
                            : "w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const downloadQuotesPdf = async (quotes: Quote[], title: string) => {
  const pdfBlob = await pdf(
    <QuotesPdfDocument
      title={title}
      quotes={quotes.map((quote) => ({
        code: quote.code,
        client: quote.client,
        date: quote.date,
        services: quote.services,
        amount: quote.amount,
        status: quote.status,
      }))}
    />,
  ).toBlob();

  const url = URL.createObjectURL(pdfBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `cotizaciones-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export default function QuotesView({
  title = "Gestión de Cotizaciones",
  subtitle = "Revisa, aprueba y genera presupuestos de servicios de jardinería",
  searchPlaceholder = "Buscar cliente o servicio...",
  onNewQuote,
}: QuotesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadQuotes = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getQuotes({
          page: currentPage,
          per_page: 10,
          search: searchTerm.trim() || undefined,
          status:
            statusFilter === "pending" || statusFilter === "paid"
              ? (statusFilter as QuoteStatus)
              : undefined,
        });

        if (active) {
          setQuotes(response.data.map(toViewQuote));
          setTotalItems(response.meta.total);
        }
      } catch (error) {
        if (active) {
          setQuotes([]);
          setTotalItems(0);
          setErrorMessage(
            getQuoteErrorMessage(error, "No se pudieron cargar las cotizaciones."),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(loadQuotes, searchTerm ? 350 : 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [currentPage, reloadKey, searchTerm, statusFilter]);

  const columns: Column<Quote>[] = [
    {
      header: "N° COTIZACIÓN",
      accessorKey: "code",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "CLIENTE",
      accessorKey: "client",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "FECHA",
      accessorKey: "date",
      className: "text-gray-500 dark:text-gray-400 whitespace-nowrap",
    },
    {
      header: "SERVICIOS",
      accessorKey: "services",
      className: "min-w-[180px] text-gray-700 dark:text-gray-300",
    },
    {
      header: "MONTO",
      accessorKey: "amount",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "ESTADO",
      render: (item) => (
        <span
          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[item.status]}`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setErrorMessage("");

    try {
      await downloadQuotesPdf(quotes, title);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      setErrorMessage("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 font-sans bg-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="w-full sm:max-w-xs">
            <Input
              icon={Search}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="w-full sm:w-auto min-w-[200px]">
            <SearchableSelect
              label="Estado"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            icon={downloadingPdf ? Loader2 : Download}
            className="w-full sm:w-auto justify-center"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading}
          >
            {downloadingPdf ? "Generando PDF..." : "Descargar PDF"}
          </Button>

          {onNewQuote && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={onNewQuote}
              className="w-full sm:w-auto justify-center"
            >
              Nueva Cotización
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            <RefreshCw size={15} /> Reintentar
          </button>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-lg">
        {loading ? (
          <QuotesTableSkeleton />
        ) : (
          <Table
            data={quotes}
            columns={columns}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            entityName="cotizaciones"
            itemsPerPage={10}
            totalItems={totalItems}
          />
        )}
      </div>

      <div id="printable-section" className="hidden">
        <Table
          data={quotes}
          columns={columns}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          entityName="cotizaciones"
          itemsPerPage={10}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
