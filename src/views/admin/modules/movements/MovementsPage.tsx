import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Eye, RefreshCw, Search } from "lucide-react";
import Input from "../../../../components/Input";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import Table, { type Column } from "../../../../components/Table";
import KpiCard from "../../../../components/KpiCard";
import MovementForm from "./Form";
import { getMovements } from "../../../../services/movementService";
import type {
  Movement,
  MovementSummary,
  MovementType,
  MovementStatus,
  MovementSortField,
} from "../../../../types/movement";

const PAGE_SIZE = 15;
const EMPTY_SUMMARY: MovementSummary = {
  totalSales: 0,
  totalPurchases: 0,
  totalExpenses: 0,
  totalIncome: 0,
  totalOutflow: 0,
  utility: 0,
  profitMarginPercentage: 0,
  totalCount: 0,
};

const TYPE_OPTIONS: SelectOption[] = [
  { label: "Todos", value: "all" },
  { label: "Ventas", value: "sale" },
  { label: "Compras", value: "purchase" },
  { label: "Gastos", value: "expense" },
  { label: "Tickets", value: "ticket" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Completados", value: "completed" },
  { label: "Cancelados", value: "cancelled" },
  { label: "Todos", value: "all" },
];

const SORT_OPTIONS: SelectOption[] = [
  { label: "Fecha descendente", value: "movement_date:desc" },
  { label: "Fecha ascendente", value: "movement_date:asc" },
  { label: "Mayor total", value: "total:desc" },
  { label: "Menor total", value: "total:asc" },
  { label: "Documento Z-A", value: "document_number:desc" },
  { label: "Documento A-Z", value: "document_number:asc" },
];

const formatoDinero = (valor: number) =>
  new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(
    valor,
  );

const formatoFecha = (valor: string) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? valor
    : fecha.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const tipoClases: Record<Movement["type"], string> = {
  sale: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  purchase: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  expense:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  ticket:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

function MovementsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando movimientos"
      aria-busy="true"
      className="h-full w-full overflow-auto rounded-3xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200/40 bg-[#ECE6DB] text-xs font-bold uppercase tracking-wider text-[#3a3d20] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
            {[
              "Documento",
              "Entidad",
              "Tipo",
              "Fecha",
              "Total",
              "Estado",
              "Acciones",
            ].map((header) => (
              <th
                key={header}
                className={`px-6 py-4 ${header === "Acciones" ? "text-center" : ""}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-2.5 w-20 rounded-md bg-gray-100 dark:bg-gray-700/70" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-2.5 w-24 rounded-md bg-gray-100 dark:bg-gray-700/70" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3.5 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4 text-center">
                <div className="mx-auto h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Cargando movimientos...</span>
    </div>
  );
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [summary, setSummary] = useState<MovementSummary>(EMPTY_SUMMARY);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("all");
  const [status, setStatus] = useState<MovementStatus>("completed");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<MovementSortField>("movement_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const respuesta = await getMovements({
          movement_type: movementType,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: debouncedSearch || undefined,
          status,
          sort_by: sortBy,
          sort_direction: sortDirection,
          per_page: PAGE_SIZE,
          page,
        });
        if (!activo) return;
        setMovements(respuesta.data || []);
        setSummary(
          respuesta.summary || respuesta.meta?.summary || EMPTY_SUMMARY,
        );
        setTotal(
          respuesta.meta?.total ??
            (respuesta.summary?.totalCount || respuesta.data?.length || 0),
        );
      } catch (error) {
        if (!activo) return;
        const data = isAxiosError(error)
          ? (error.response?.data as { message?: string } | undefined)
          : undefined;
        setErrorMessage(
          data?.message || "No se pudieron cargar los movimientos.",
        );
        setMovements([]);
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, [
    movementType,
    status,
    startDate,
    endDate,
    debouncedSearch,
    sortBy,
    sortDirection,
    page,
  ]);

  const cambiarPagina = (nuevaPagina: number) => setPage(nuevaPagina);

  const cambiarTipo = (valor: MovementType) => {
    setMovementType(valor);
    setPage(1);
  };

  const cambiarEstado = (valor: MovementStatus) => {
    setStatus(valor);
    setPage(1);
  };

  const columns: Column<Movement>[] = [
    {
      header: "Documento",
      render: (movimiento) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {movimiento.documentNumber}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {movimiento.documentType}
          </p>
        </div>
      ),
    },
    {
      header: "Entidad",
      render: (movimiento) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {movimiento.entity.name}
          </p>
          {movimiento.entity.taxId && (
            <p className="mt-0.5 text-xs text-gray-400">
              NIT: {movimiento.entity.taxId}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Tipo",
      render: (movimiento) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tipoClases[movimiento.type]}`}
        >
          {movimiento.typeLabel}
        </span>
      ),
    },
    { header: "Fecha", render: (movimiento) => formatoFecha(movimiento.date) },
    {
      header: "Total",
      render: (movimiento) => (
        <span
          className={
            movimiento.type === "sale"
              ? "font-bold text-emerald-700 dark:text-emerald-300"
              : "font-bold text-gray-800 dark:text-gray-100"
          }
        >
          {movimiento.type === "sale" ? "+" : "−"}
          {formatoDinero(movimiento.amounts.total)}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (movimiento) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${movimiento.status.isCancelled ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}
        >
          {movimiento.status.label}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-center",
      render: (movimiento) => (
        <button
          type="button"
          onClick={() => setSelectedMovement(movimiento)}
          className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-[#6C7D38] hover:text-[#6C7D38] dark:border-gray-700 dark:text-gray-300"
          title="Ver detalle"
          aria-label={`Ver ${movimiento.documentNumber}`}
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const dateInputClase =
    "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#5b642a] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="flex h-[calc(100dvh-5rem)] w-full flex-col gap-4 overflow-hidden p-4 font-sans sm:gap-5 sm:p-6 md:h-[calc(100dvh-3rem)]">
      <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-gray-200/60 pb-4 dark:border-gray-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Movimientos
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Consulta ventas, compras y gastos del libro general
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPage((actual) => actual)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          title="Actualizar"
        >
          <RefreshCw size={17} /> Actualizar
        </button>
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos"
          value={formatoDinero(summary.totalIncome)}
          badgeText={`${summary.totalSales} ventas`}
          badgeType="positive"
        />
        <KpiCard
          title="Compras"
          value={formatoDinero(summary.totalPurchases)}
          badgeText="Egresos"
          badgeType="warning"
        />
        <KpiCard
          title="Gastos"
          value={formatoDinero(summary.totalExpenses)}
          badgeText="Operativos"
          badgeType="neutral"
        />
        <KpiCard
          title="Utilidad"
          value={formatoDinero(summary.utility)}
          badgeText={`${summary.profitMarginPercentage.toFixed(2)}% margen`}
          badgeType={summary.utility >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="flex shrink-0 flex-col gap-3 rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex-1 lg:min-w-[220px]">
          <Input
            label="Buscar"
            icon={Search}
            value={search}
            onChange={(evento) => {
              setSearch(evento.target.value);
              setPage(1);
            }}
            placeholder="Cliente, proveedor, documento o NIT"
          />
        </div>

        <div className="w-full sm:w-44">
          <SearchableSelect
            label="Tipo"
            options={TYPE_OPTIONS}
            value={movementType}
            onChange={(valor) => cambiarTipo(valor as MovementType)}
            className="max-w-none"
          />
        </div>

        <div className="w-full sm:w-44">
          <SearchableSelect
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(valor) => cambiarEstado(valor as MovementStatus)}
            className="max-w-none"
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Desde
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(evento) => {
              setStartDate(evento.target.value);
              setPage(1);
            }}
            className={dateInputClase}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Hasta
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(evento) => {
              setEndDate(evento.target.value);
              setPage(1);
            }}
            className={dateInputClase}
          />
        </label>

        <div className="w-full sm:w-52">
          <SearchableSelect
            label="Ordenar"
            options={SORT_OPTIONS}
            value={`${sortBy}:${sortDirection}`}
            onChange={(valor) => {
              const [campo, direccion] = valor.split(":") as [
                MovementSortField,
                "asc" | "desc",
              ];
              setSortBy(campo);
              setSortDirection(direccion);
              setPage(1);
            }}
            className="max-w-none"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="shrink-0 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <MovementsTableSkeleton rows={6} />
        ) : (
          <Table<Movement>
            data={movements}
            columns={columns}
            currentPage={page}
            onPageChange={cambiarPagina}
            itemsPerPage={PAGE_SIZE}
            totalItems={total}
            entityName="movimientos"
          />
        )}
      </div>

      {selectedMovement && (
        <MovementForm
          movement={selectedMovement}
          onClose={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
}
