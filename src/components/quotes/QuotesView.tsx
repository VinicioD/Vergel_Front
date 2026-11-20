// src/components/quotes/QuotesView.tsx
// Vista reutilizable de cotizaciones. Los datos provienen del API; la navegación
// a "nueva cotización" la resuelve el rol que monta esta vista.
import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Plus,
  RefreshCw,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import QuotesPdfDocument from "../../pdf/QuotesPdfDocument";
import { triggerPdfDownload } from "../../pdf/downloadPdf";
import Button from "../Button";
import Input from "../Input";
import Table, { type Column } from "../Table";
import SearchableSelect, { type SelectOption } from "../SearchableSelect";
import {
  deleteQuote,
  getQuoteById,
  getQuotes,
  getQuoteErrorMessage,
} from "../../services/quoteService";
import ConfirmDialog from "../ConfirmDialog";
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
  details: ApiQuote;
}

export interface QuotesViewProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onNewQuote?: () => void;
  onEditQuote?: (quote: ApiQuote) => void;
  onChangeStatus?: (
    quoteId: number | string,
    status: QuoteStatus,
  ) => void | Promise<void>;
  onDeleteQuote?: (quoteId: number | string) => void | Promise<void>;
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
  const itemNames = quote.items
    .map(
      (item) =>
        item.name ||
        item.plant?.name ||
        item.service?.name ||
        (item.itemType === "plant" ? "Planta" : "Servicio"),
    )
    .filter(Boolean);

  const servicesLabel =
    itemNames.length > 0
      ? itemNames.join(", ")
      : quote.itemsCount > 0
        ? `${quote.itemsCount} ${quote.itemsCount === 1 ? "ítem" : "ítems"}`
        : "Sin ítems";

  return {
    id: quote.id,
    code: quote.quoteNumber || `COT-${quote.id}`,
    client: quote.customerName || "Sin cliente",
    date: formatDate(quote.createdAt),
    services: servicesLabel,
    amount: formatCurrency(quote.total),
    status: quote.status === "paid" ? "Aprobada" : "Pendiente",
    details: quote,
  };
};

function QuotesTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando cotizaciones"
      aria-busy="true"
      className="h-full w-full overflow-auto rounded-3xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200/40 bg-[#ECE6DB] text-xs font-bold uppercase tracking-wider text-[#3a3d20] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
            {[
              "N° COTIZACIÓN",
              "CLIENTE",
              "FECHA",
              "SERVICIOS",
              "MONTO",
              "ESTADO",
              "ACCIONES",
            ].map((header) => (
              <th key={header} className="px-6 py-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
                <td key={cellIndex} className="px-6 py-5">
                  <div
                    className={`h-3 rounded-md bg-gray-200 dark:bg-gray-700 ${
                      cellIndex === 3
                        ? "w-40"
                        : cellIndex === 5
                          ? "h-6 w-20 rounded-full"
                          : cellIndex === 6
                            ? "w-20"
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

  triggerPdfDownload(
    pdfBlob,
    `cotizaciones-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
};

export default function QuotesView({
  title = "Gestión de Cotizaciones",
  subtitle = "Revisa, aprueba y genera presupuestos de servicios de jardinería",
  searchPlaceholder = "Buscar cliente o servicio...",
  onNewQuote,
  onEditQuote,
  onChangeStatus,
  onDeleteQuote,
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
  const [selectedQuote, setSelectedQuote] = useState<ApiQuote | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadQuotes = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getQuotes({
          page: currentPage,
          per_page: 10,
          limit: 10,
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
            getQuoteErrorMessage(
              error,
              "No se pudieron cargar las cotizaciones.",
            ),
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

  const handleOpenDetail = async (quote: Quote) => {
    setSelectedQuote(quote.details);
    setLoadingDetail(true);
    try {
      const { data } = await getQuoteById(quote.id);
      setSelectedQuote(data);
    } catch {
      // Si falla la carga detallada, conserva los datos del listado
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = async (quote: ApiQuote) => {
    if (!onChangeStatus) return;
    const nextStatus: QuoteStatus =
      quote.status === "paid" ? "pending" : "paid";
    setUpdatingStatus(true);
    try {
      await onChangeStatus(quote.id, nextStatus);
      setSelectedQuote((current) =>
        current && current.id === quote.id
          ? { ...current, status: nextStatus }
          : current,
      );
      setReloadKey((key) => key + 1);
    } finally {
      setUpdatingStatus(false);
    }
  };

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
    {
      header: "ACCIONES",
      className: "whitespace-nowrap",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Ver cotización"
            aria-label={`Ver cotización ${item.code}`}
            onClick={() => void handleOpenDetail(item)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#5b642a] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-[#a3b355]"
          >
            <Eye size={17} />
          </button>
          {onEditQuote && (
            <button
              type="button"
              title="Editar cotización"
              aria-label={`Editar cotización ${item.code}`}
              onClick={() => void handleEditQuote(item)}
              disabled={loadingEditId !== null}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#5b642a] disabled:cursor-wait disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-[#a3b355]"
            >
              {loadingEditId === item.id ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Edit2 size={17} />
              )}
            </button>
          )}
          <button
            type="button"
            title="Eliminar cotización"
            aria-label={`Eliminar cotización ${item.code}`}
            onClick={() => setQuoteToDelete(item)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (onDeleteQuote) {
        await onDeleteQuote(quoteToDelete.id);
      } else {
        await deleteQuote(quoteToDelete.id);
        setSuccessMessage(`La cotización ${quoteToDelete.code} fue eliminada.`);
      }
      setQuoteToDelete(null);
      if (quotes.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (error) {
      setErrorMessage(
        getQuoteErrorMessage(error, "No se pudo eliminar la cotización."),
      );
      setQuoteToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditQuote = async (quote: Quote) => {
    if (!onEditQuote) return;
    setLoadingEditId(quote.id);
    setErrorMessage("");
    try {
      const response = await getQuoteById(quote.id);
      onEditQuote(response.data);
    } catch (error) {
      setErrorMessage(
        getQuoteErrorMessage(
          error,
          "No se pudieron cargar los datos de la cotización.",
        ),
      );
    } finally {
      setLoadingEditId(null);
    }
  };

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

  const discountAmount = selectedQuote
    ? Math.max(0, selectedQuote.basePrice - selectedQuote.discountedSubtotal)
    : 0;
  const vatAmount = selectedQuote
    ? Math.max(0, selectedQuote.total - selectedQuote.discountedSubtotal)
    : 0;

  return (
    <div className="w-full h-[calc(100dvh-5rem)] md:h-[calc(100dvh-3rem)] flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 font-sans bg-transparent overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shrink-0">
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
          className="shrink-0 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
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

      {successMessage && (
        <div
          role="status"
          className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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

      {selectedQuote && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedQuote(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:p-7"
          >
            <header className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="quote-details-title"
                  className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  Cotización{" "}
                  {selectedQuote.quoteNumber || `COT-${selectedQuote.id}`}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {loadingDetail
                    ? "Cargando detalle completo..."
                    : "Detalle de la cotización"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setSelectedQuote(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <X size={19} />
              </button>
            </header>

            <dl className="grid grid-cols-1 gap-4 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-gray-900/50 sm:grid-cols-2">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Cliente</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                  {selectedQuote.customerName || "Sin cliente"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Plan</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                  {selectedQuote.appliedPlanName ||
                    selectedQuote.appliedPlan?.planName ||
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(selectedQuote.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Estado</dt>
                <dd className="mt-1 flex items-center gap-3 font-semibold text-gray-900 dark:text-gray-100">
                  <span>
                    {selectedQuote.status === "paid" ? "Pagada" : "Pendiente"}
                  </span>
                  {onChangeStatus && (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => void handleToggleStatus(selectedQuote)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-[#5b642a] transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-[#a3b355] dark:hover:bg-gray-700"
                    >
                      {updatingStatus
                        ? "Actualizando..."
                        : selectedQuote.status === "paid"
                          ? "Marcar pendiente"
                          : "Marcar pagada"}
                    </button>
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900 dark:text-gray-100">
              Ítems
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Cant.</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {selectedQuote.items.map((item, index) => (
                    <tr key={item.id ?? `${item.name ?? "item"}-${index}`}>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {item.name ||
                          item.plant?.name ||
                          item.service?.name ||
                          (item.itemType === "plant" ? "Planta" : "Servicio")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                  {selectedQuote.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-5 text-center text-gray-500"
                      >
                        Sin ítems registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-5 w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-300">
                <dt>Subtotal base</dt>
                <dd>{formatCurrency(selectedQuote.basePrice)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-300">
                <dt>Subtotal con plan</dt>
                <dd>{formatCurrency(selectedQuote.discountedSubtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-300">
                <dt>Descuento</dt>
                <dd>{formatCurrency(discountAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-300">
                <dt>IVA</dt>
                <dd>{formatCurrency(vatAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                <dt>Total</dt>
                <dd>{formatCurrency(selectedQuote.total)}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={quoteToDelete !== null}
        title="Eliminar cotización"
        message={`¿Seguro que deseas eliminar la cotización ${quoteToDelete?.code ?? "seleccionada"}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={() => void handleDeleteQuote()}
        onCancel={() => {
          if (!deleting) setQuoteToDelete(null);
        }}
      />
    </div>
  );
}
