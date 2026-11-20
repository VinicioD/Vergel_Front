// src/views/technical/modules/inspections/InspectionsPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import {
  Search,
  Plus,
  ClipboardCheck,
  CheckCircle2,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import { getAppointments } from "../../../../services/appointmentService";
import { createInspection } from "../../../../services/inspectionService";
import type { Appointment } from "../../../../types/appointment";
import type {
  CreateInspectionPayload,
  Inspection,
} from "../../../../types/inspection";
import Table, { type Column } from "../../../../components/Table";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import InspectionFormModal from "./InspectionFormModal";

type AppointmentStatusFilter = "ALL" | "pending" | "confirmed" | "completed";

const ITEMS_PER_PAGE = 10;

const STATUS_FILTERS: { label: string; value: AppointmentStatusFilter }[] = [
  { label: "Todas las visitas", value: "ALL" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "confirmed" },
  { label: "Completadas", value: "completed" },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmada",
    className:
      "bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
  },
  completed: {
    label: "Completada",
    className:
      "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
};

function InspectionsSkeleton() {
  return (
    <div className="w-full rounded-3xl bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 overflow-hidden shadow-sm animate-pulse">
      <div className="h-12 bg-[#ECE6DB] dark:bg-gray-900/90" />
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="px-6 py-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700/60" />
            </div>
            <div className="space-y-1.5 flex-1 max-w-xs">
              <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-700/60" />
            </div>
            <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-28 rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InspectionsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Inspection | null>(null);
  const [inspectedAppointmentIds, setInspectedAppointmentIds] = useState<
    number[]
  >([]);

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, message: string) =>
    setToast({ type, message });
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getAppointments({ all: true });
        if (!active) return;
        const activeList = (response.data ?? []).filter(
          (app) => app.status !== "annulled",
        );
        setAppointments(activeList);
      } catch (error) {
        if (!active) return;
        if (isAxiosError(error)) {
          const msg = (error.response?.data as { message?: string } | undefined)
            ?.message;
          setErrorMessage(
            msg || "No se pudieron cargar las visitas técnicas programadas.",
          );
        } else {
          setErrorMessage(
            "No se pudieron cargar las visitas técnicas programadas.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadAppointments();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return appointments.filter((app) => {
      if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
      if (!q) return true;
      const clientName = app.customer?.legalName ?? "";
      const address = app.customer?.address ?? "";
      const serviceName = app.service?.name ?? "";
      return `${app.id} ${clientName} ${address} ${serviceName}`
        .toLowerCase()
        .includes(q);
    });
  }, [appointments, statusFilter, searchTerm]);

  const handleOpenInspectFromAppointment = useCallback((app: Appointment) => {
    setPrefillData({
      id: 0,
      customerId: app.customer?.id ?? app.customerId,
      appointmentId: app.id,
      inspectionDate: app.appointmentDate,
      status: "submitted",
    });
    setIsFormOpen(true);
  }, []);

  const handleSaveInspection = async (payload: CreateInspectionPayload) => {
    try {
      await createInspection(payload);
      if (payload.appointment_id) {
        setInspectedAppointmentIds((prev) =>
          prev.includes(payload.appointment_id!)
            ? prev
            : [...prev, payload.appointment_id!],
        );
      }
      showToast("success", "Inspección de campo registrada correctamente");
      setIsFormOpen(false);
      setPrefillData(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      const msg = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ||
          "No se pudo registrar la inspección."
        : "No se pudo registrar la inspección.";
      showToast("error", msg);
      throw error;
    }
  };

  const columns: Column<Appointment>[] = useMemo(
    () => [
      {
        header: "Fecha / Hora",
        render: (app) => (
          <div className="whitespace-nowrap">
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
              {app.appointmentDate}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {app.appointmentTime}
            </p>
          </div>
        ),
      },
      {
        header: "Cliente / Ubicación",
        render: (app) => (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {app.customer?.legalName || `Cliente #${app.id}`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate max-w-xs">
                {app.customer?.address || "Sin dirección registrada"}
              </span>
            </p>
          </div>
        ),
      },
      {
        header: "Servicio Solicitado",
        className: "hidden md:table-cell",
        render: (app) => (
          <span className="text-gray-600 dark:text-gray-300">
            {app.service?.name || "Visita / Inspección General"}
          </span>
        ),
      },
      {
        header: "Estado Cita",
        render: (app) => {
          const badge = STATUS_BADGES[app.status] ?? {
            label: app.status,
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
          };
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge.className}`}
            >
              {badge.label}
            </span>
          );
        },
      },
      {
        header: "Acción",
        className: "text-right",
        render: (app) => {
          const isInspected = inspectedAppointmentIds.includes(app.id);
          return (
            <button
              type="button"
              onClick={() => handleOpenInspectFromAppointment(app)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer whitespace-nowrap ${
                isInspected
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#6C7D38] hover:bg-[#5b6a2f] text-white"
              }`}
            >
              {isInspected ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>Inspeccionada</span>
                </>
              ) : (
                <>
                  <ClipboardCheck size={14} />
                  <span>Inspeccionar</span>
                </>
              )}
            </button>
          );
        },
      },
    ],
    [inspectedAppointmentIds, handleOpenInspectFromAppointment],
  );

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Inspecciones de Campo
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Selecciona una visita agendada para levantar medidas del terreno,
            servicios sugeridos y fotografías
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPrefillData(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6C7D38] hover:bg-[#5b6a2f] text-white font-medium text-sm shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Inspección Libre</span>
        </button>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-5 shrink-0">
        <div className="inline-flex flex-wrap p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatusFilter(f.value);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === f.value
                  ? "bg-[#6C7D38] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar cliente, dirección o servicio..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 shrink-0 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Área de Tabla */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Table
          data={filteredAppointments}
          columns={columns}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          entityName="visitas técnicas"
          isLoading={isLoading}
        />
      </div>

      {/* Modal de Formulario de Inspección */}
      {isFormOpen && (
        <InspectionFormModal
          initialInspection={prefillData}
          onClose={() => {
            setIsFormOpen(false);
            setPrefillData(null);
          }}
          onSubmit={handleSaveInspection}
        />
      )}

      {/* Toast */}
      <Toast
        type={toast?.type ?? "success"}
        message={toast?.message ?? ""}
        isOpen={toast !== null}
        onClose={closeToast}
      />
    </div>
  );
}
