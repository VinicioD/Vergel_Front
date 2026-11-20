import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Eye, RefreshCw, Search } from "lucide-react";
import Table, { type Column } from "../../../../components/Table";
import KpiCard from "../../../../components/KpiCard";
import MovementForm from "./Form";
import { getMovements } from "../../../../services/movementService";
import type { Movement, MovementSummary, MovementType, MovementStatus, MovementSortField } from "../../../../types/movement";

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

const formatoDinero = (valor: number) =>
  new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(valor);

const formatoFecha = (valor: string) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? valor
    : fecha.toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
};

const tipoClases: Record<Movement["type"], string> = {
  sale: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  purchase: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  expense: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  ticket: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

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
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
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
        setSummary(respuesta.summary || respuesta.meta?.summary || EMPTY_SUMMARY);
        setTotal(respuesta.meta?.total ?? (respuesta.summary?.totalCount || respuesta.data?.length || 0));
      } catch (error) {
        if (!activo) return;
        const data = isAxiosError(error) ? error.response?.data as { message?: string } | undefined : undefined;
        setErrorMessage(data?.message || "No se pudieron cargar los movimientos.");
        setMovements([]);
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargar();
    return () => { activo = false; };
  }, [movementType, status, startDate, endDate, debouncedSearch, sortBy, sortDirection, page]);

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
          <p className="font-bold text-gray-900 dark:text-gray-100">{movimiento.documentNumber}</p>
          <p className="mt-0.5 text-xs text-gray-400">{movimiento.documentType}</p>
        </div>
      ),
    },
    {
      header: "Entidad",
      render: (movimiento) => (
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{movimiento.entity.name}</p>
          {movimiento.entity.taxId && <p className="mt-0.5 text-xs text-gray-400">NIT: {movimiento.entity.taxId}</p>}
        </div>
      ),
    },
    {
      header: "Tipo",
      render: (movimiento) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tipoClases[movimiento.type]}`}>{movimiento.typeLabel}</span>,
    },
    { header: "Fecha", render: (movimiento) => formatoFecha(movimiento.date) },
    {
      header: "Total",
      render: (movimiento) => (
        <span className={movimiento.type === "sale" ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-bold text-gray-800 dark:text-gray-100"}>
          {movimiento.type === "sale" ? "+" : "−"}{formatoDinero(movimiento.amounts.total)}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (movimiento) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${movimiento.status.isCancelled ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>
          {movimiento.status.label}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-center",
      render: (movimiento) => (
        <button type="button" onClick={() => setSelectedMovement(movimiento)} className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-[#6C7D38] hover:text-[#6C7D38] dark:border-gray-700 dark:text-gray-300" title="Ver detalle" aria-label={`Ver ${movimiento.documentNumber}`}>
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const inputClase = "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#5b642a] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="flex w-full flex-col gap-4 p-4 font-sans sm:gap-6 sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200/60 pb-4 dark:border-gray-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Movimientos</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Consulta ventas, compras y gastos del libro general</p>
        </div>
        <button type="button" onClick={() => setPage((actual) => actual)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" title="Actualizar">
          <RefreshCw size={17} /> Actualizar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Ingresos" value={formatoDinero(summary.totalIncome)} badgeText={`${summary.totalSales} ventas`} badgeType="positive" />
        <KpiCard title="Compras" value={formatoDinero(summary.totalPurchases)} badgeText="Egresos" badgeType="warning" />
        <KpiCard title="Gastos" value={formatoDinero(summary.totalExpenses)} badgeText="Operativos" badgeType="neutral" />
        <KpiCard title="Utilidad" value={formatoDinero(summary.utility)} badgeText={`${summary.profitMarginPercentage.toFixed(2)}% margen`} badgeType={summary.utility >= 0 ? "positive" : "negative"} />
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="relative flex-1 lg:min-w-[220px]"><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Buscar</span><Search size={16} className="absolute bottom-3 left-3 text-gray-400" /><input value={search} onChange={(evento) => { setSearch(evento.target.value); setPage(1); }} placeholder="Cliente, proveedor, documento o NIT" className={`${inputClase} pl-9`} /></label>
        <label><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo</span><select value={movementType} onChange={(evento) => cambiarTipo(evento.target.value as MovementType)} className={inputClase}><option value="all">Todos</option><option value="sale">Ventas</option><option value="purchase">Compras</option><option value="expense">Gastos</option><option value="ticket">Tickets</option></select></label>
        <label><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Estado</span><select value={status} onChange={(evento) => cambiarEstado(evento.target.value as MovementStatus)} className={inputClase}><option value="completed">Completados</option><option value="cancelled">Cancelados</option><option value="all">Todos</option></select></label>
        <label><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Desde</span><input type="date" value={startDate} onChange={(evento) => { setStartDate(evento.target.value); setPage(1); }} className={inputClase} /></label>
        <label><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Hasta</span><input type="date" value={endDate} min={startDate || undefined} onChange={(evento) => { setEndDate(evento.target.value); setPage(1); }} className={inputClase} /></label>
        <label><span className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Ordenar</span><select value={`${sortBy}:${sortDirection}`} onChange={(evento) => { const [campo, direccion] = evento.target.value.split(":") as [MovementSortField, "asc" | "desc"]; setSortBy(campo); setSortDirection(direccion); setPage(1); }} className={inputClase}><option value="movement_date:desc">Fecha descendente</option><option value="movement_date:asc">Fecha ascendente</option><option value="total:desc">Mayor total</option><option value="total:asc">Menor total</option><option value="document_number:desc">Documento Z-A</option><option value="document_number:asc">Documento A-Z</option></select></label>
      </div>

      {errorMessage && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{errorMessage}</div>}

      {loading ? (
        <div className="grid min-h-48 place-items-center rounded-3xl border border-gray-200/60 bg-white text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800"><span className="inline-flex items-center gap-2"><RefreshCw className="animate-spin" size={18} /> Cargando movimientos...</span></div>
      ) : (
        <Table<Movement> data={movements} columns={columns} currentPage={page} onPageChange={cambiarPagina} itemsPerPage={PAGE_SIZE} totalItems={total} entityName="movimientos" />
      )}

      {selectedMovement && <MovementForm movement={selectedMovement} onClose={() => setSelectedMovement(null)} />}
    </div>
  );
}
