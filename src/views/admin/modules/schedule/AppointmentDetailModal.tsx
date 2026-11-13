// src/views/admin/modules/schedule/AppointmentDetailModal.tsx
import type { ReactNode } from "react";
import { CalendarDays, Clock, Edit, UserCheck, X } from "lucide-react";
import type { Appointment, AppointmentStatus } from "../../../../types/appointment";

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit?: (id: number) => void;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  annulled: "Anulada",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  annulled: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const DETAIL_ITEM_BASE =
  "p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex flex-col gap-1 min-w-0";
const DETAIL_LABEL =
  "text-[11px] font-semibold text-gray-400 uppercase tracking-wide";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className={DETAIL_ITEM_BASE}>
    <span className={DETAIL_LABEL}>{label}</span>
    <span className="font-semibold text-gray-800 dark:text-gray-200 break-words">
      {value || "—"}
    </span>
  </div>
);

export default function AppointmentDetailModal({
  appointment,
  onClose,
  onEdit,
}: AppointmentDetailModalProps) {
  const customer = appointment.customer;
  const status = appointment.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90dvh] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors flex flex-col overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-[#5b642a]/10 dark:bg-[#5b642a]/20 text-[#5b642a] dark:text-[#a3b355] rounded-2xl shrink-0">
              <UserCheck size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {customer?.legalName || "Detalle de la cita"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cita #{appointment.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                STATUS_STYLES[status] || STATUS_STYLES.pending
              }`}
            >
              {STATUS_LABELS[status] || status}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CalendarDays size={14} className="text-gray-400" />
              {formatDate(appointment.appointmentDate)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={14} className="text-gray-400" />
              {appointment.appointmentTime}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailItem label="Cliente" value={customer?.legalName} />
            <DetailItem label="Nombre Comercial" value={customer?.tradeName} />
            <DetailItem label="Teléfono" value={customer?.phone} />
            <DetailItem label="Correo" value={customer?.email} />
            <DetailItem
              label="Colaborador"
              value={appointment.employee?.fullName}
            />
            <DetailItem
              label="Servicio"
              value={appointment.service?.name || "Visita / Inspección General"}
            />
            <DetailItem label="Dirección" value={customer?.address} />
            <DetailItem label="Municipio" value={customer?.municipality} />
            <DetailItem label="Departamento" value={customer?.department} />
            <DetailItem label="Origen" value={appointment.origin} />
            <DetailItem
              label="Tipo"
              value={
                appointment.isInspection || appointment.is_inspection
                  ? "Inspección"
                  : "Visita"
              }
            />
            <DetailItem
              label="Notas"
              value={appointment.notes || "Sin notas registradas"}
            />
          </div>
        </div>

        {/* Pie */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
          >
            Cerrar
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(appointment.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
            >
              <Edit size={16} />
              Editar cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
