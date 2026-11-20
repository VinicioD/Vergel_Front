// src/views/admin/modules/audit/AuditLogView.tsx
import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Search, Calendar, Eye, Loader2, ShieldAlert, X } from "lucide-react";
import { getAuditLogById, getAuditLogs } from "./../../services/auditService";
import type {
  AuditAction,
  AuditLog,
  AuditLogQueryParams,
  AuditSnapshot,
} from "./../../types/audit";

const ACTION_FILTERS: { label: string; value: "ALL" | AuditAction }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Inserciones", value: "insert" },
  { label: "Actualizaciones", value: "update" },
  { label: "Eliminaciones", value: "delete" },
  { label: "Restauraciones", value: "restore" },
  { label: "Denegados", value: "denied" },
];

const ACTION_LABELS: Record<AuditAction, string> = {
  insert: "Creación",
  update: "Edición",
  delete: "Eliminación",
  restore: "Restauración",
  denied: "Acceso denegado",
};

const ACTION_BADGE_STYLES: Record<AuditAction, string> = {
  insert:
    "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  update: "bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
  delete: "bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
  restore:
    "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  denied:
    "bg-purple-100/80 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
};

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRangeParams(
  rangeKey: string,
): Pick<AuditLogQueryParams, "start_date" | "end_date"> {
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

function formatTimestamp(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatSnapshotValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function SnapshotCard({
  title,
  snapshot,
  emptyText,
}: {
  title: string;
  snapshot?: AuditSnapshot;
  emptyText: string;
}) {
  const entries = snapshot ? Object.entries(snapshot) : [];

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </span>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 max-h-80 overflow-y-auto shadow-2xs">
        {entries.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            {emptyText}
          </p>
        ) : (
          <dl className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="py-2 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4"
              >
                <dt className="font-mono text-[11px] font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                  {key}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 break-all sm:text-right">
                  {formatSnapshotValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          <td className="py-4 px-4 sm:px-6">
            <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6">
            <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6">
            <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-1.5" />
            <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-700/60" />
          </td>
          <td className="py-4 px-4 sm:px-6 hidden lg:table-cell">
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="py-4 px-4 sm:px-6 text-right">
            <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<"ALL" | AuditAction>("ALL");
  const [dateRange, setDateRange] = useState("30dias");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const dateParams = getDateRangeParams(dateRange);
        const params: AuditLogQueryParams = {
          ...dateParams,
          per_page: 15,
          page: currentPage,
        };

        if (actionFilter !== "ALL") {
          params.action = actionFilter;
        }

        const response = await getAuditLogs(params);
        if (!active) return;

        setLogs(response.data ?? []);
        setLastPage(response.meta?.last_page ?? 1);
      } catch (error) {
        if (!active) return;
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 403) {
            setErrorMessage(
              "No tienes permisos para consultar la bitácora de auditoría (requiere rol Administrador).",
            );
          } else {
            const apiMsg = (
              error.response?.data as { message?: string } | undefined
            )?.message;
            setErrorMessage(
              apiMsg || "No se pudieron cargar los registros de auditoría.",
            );
          }
        } else {
          setErrorMessage("No se pudieron cargar los registros de auditoría.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchLogs();
    return () => {
      active = false;
    };
  }, [actionFilter, dateRange, currentPage]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter((log) => {
      const actorName = log.actor?.fullName ?? "";
      const actorEmail = log.actor?.email ?? "";
      const actorRole = log.actor?.role ?? "";
      const recordId =
        log.affectedRecordId !== null && log.affectedRecordId !== undefined
          ? String(log.affectedRecordId)
          : "";
      const ip = log.ipAddress ?? "";

      return [
        log.affectedTable,
        recordId,
        ACTION_LABELS[log.action] ?? log.action,
        actorName,
        actorEmail,
        actorRole,
        ip,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [logs, searchTerm]);

  const handleOpenDetail = async (log: AuditLog) => {
    setSelectedLog(log);
    setIsLoadingDetail(true);
    try {
      const detailResponse = await getAuditLogById(log.id);
      setSelectedLog(detailResponse.data);
    } catch {
      // Mantiene el registro ya cargado en la tabla si falla el detalle
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Bitácora de Auditoría
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Consulta los registros de creación, edición, eliminación y accesos
            en el sistema
          </p>
        </div>
      </div>

      {/* Filtros de acción, fecha y búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-5 shrink-0">
        <div className="inline-flex flex-wrap p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
          {ACTION_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setActionFilter(filter.value);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                actionFilter === filter.value
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
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
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

          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar tabla, usuario, ID o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Mensaje de error o sin permisos */}
      {errorMessage && (
        <div className="mb-4 shrink-0 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Contenedor de Tabla con scroll interno */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Fecha / Hora</th>
                <th className="py-4 px-4 sm:px-6">Acción</th>
                <th className="py-4 px-4 sm:px-6">Tabla / Registro</th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Responsable
                </th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                  IP Origen
                </th>
                <th className="py-4 px-4 sm:px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {isLoading ? (
                <TableSkeletonRows />
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatTimestamp(item.createdAt)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          ACTION_BADGE_STYLES[item.action] ??
                          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {ACTION_LABELS[item.action] ?? item.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-semibold text-gray-800 dark:text-gray-200">
                      <div>
                        <span className="font-mono text-xs sm:text-sm">
                          {item.affectedTable}
                        </span>
                        {item.affectedRecordId !== null &&
                          item.affectedRecordId !== undefined && (
                            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                              #{item.affectedRecordId}
                            </span>
                          )}
                        <p className="text-[11px] font-normal text-gray-400 md:hidden mt-0.5">
                          {item.actor?.fullName || "Sistema"} ·{" "}
                          {item.ipAddress || "Sin IP"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell text-gray-600 dark:text-gray-300">
                      <div>
                        <p className="font-medium">
                          {item.actor?.fullName || "Sistema"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {item.actor?.role || item.actor?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {item.ipAddress || "-"}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => void handleOpenDetail(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C7D38] dark:text-[#9ab054] hover:underline cursor-pointer"
                      >
                        <Eye size={15} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-400 text-xs"
                  >
                    No se encontraron registros de auditoría para los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && lastPage > 1 && (
          <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-gray-50/70 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Página {currentPage} de {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={currentPage >= lastPage}
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Bitácora */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-2xl text-gray-800 dark:text-gray-100">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Detalle de Bitácora #{selectedLog.id}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatTimestamp(selectedLog.createdAt)} ·{" "}
                  <span className="font-mono">{selectedLog.affectedTable}</span>
                  {selectedLog.affectedRecordId !== null &&
                  selectedLog.affectedRecordId !== undefined
                    ? ` #${selectedLog.affectedRecordId}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label="Cerrar detalle"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="animate-spin text-[#6C7D38]" size={18} />
                <span>Cargando detalle completo...</span>
              </div>
            ) : (
              <div className="mt-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 text-xs sm:text-sm pr-1">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-200/80 dark:border-gray-700/60">
                  <div>
                    <dt className="text-xs text-gray-400">Responsable</dt>
                    <dd className="font-semibold mt-0.5">
                      {selectedLog.actor?.fullName || "Sistema"}
                    </dd>
                    {selectedLog.actor?.email && (
                      <dd className="text-xs text-gray-500 dark:text-gray-400 break-all">
                        {selectedLog.actor.email}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Rol / IP</dt>
                    <dd className="font-semibold mt-0.5">
                      {selectedLog.actor?.role || "Sin rol"}
                    </dd>
                    <dd className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                      {selectedLog.ipAddress || "Sin IP"}
                    </dd>
                  </div>
                </dl>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <SnapshotCard
                    title="Datos Anteriores (oldData)"
                    snapshot={selectedLog.oldData}
                    emptyText="Sin datos anteriores"
                  />
                  <SnapshotCard
                    title="Datos Nuevos (newData)"
                    snapshot={selectedLog.newData}
                    emptyText="Sin datos nuevos"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-[#6C7D38] hover:bg-[#5b6a2f] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
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
