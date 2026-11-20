import { X, UserRound, FileText, CalendarDays, CircleDollarSign } from "lucide-react";
import type { Movement } from "../../../../types/movement";

interface FormProps {
  movement: Movement;
  onClose: () => void;
}

const formatoDinero = (valor: number) =>
  new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(valor);

const formatoFecha = (valor: string) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? valor
    : fecha.toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
};

export default function MovementForm({ movement, onClose }: FormProps) {
  const estadoClases = movement.status.isCancelled
    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Detalle del movimiento">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-700">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6C7D38]">Detalle del movimiento</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{movement.documentNumber}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-gray-400"><FileText size={15} /> Documento</div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{movement.documentType}</p>
              <p className="mt-1 text-sm text-gray-500">Tipo: {movement.typeLabel}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-gray-400"><CalendarDays size={15} /> Fecha</div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{formatoFecha(movement.date)}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${estadoClases}`}>{movement.status.label}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-gray-400"><UserRound size={15} /> Entidad</div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{movement.entity.name}</p>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              {movement.entity.taxId && <span>NIT: {movement.entity.taxId}</span>}
              {movement.entity.role && <span>Rol: {movement.entity.role}</span>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700"><span className="text-xs text-gray-400">Monto base</span><p className="mt-1 font-bold text-gray-900 dark:text-gray-100">{formatoDinero(movement.amounts.amount)}</p></div>
            <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700"><span className="text-xs text-gray-400">IVA</span><p className="mt-1 font-bold text-gray-900 dark:text-gray-100">{formatoDinero(movement.amounts.vatAmount)}</p></div>
            <div className="rounded-2xl border border-[#6C7D38]/30 bg-[#6C7D38]/5 p-4 dark:border-[#8A9F48]/40"><span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><CircleDollarSign size={14} /> Total</span><p className="mt-1 text-lg font-bold text-[#5b642a] dark:text-[#A3B468]">{formatoDinero(movement.amounts.total)}</p></div>
          </div>

          {movement.notes && <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900/50 dark:text-gray-300"><span className="mb-1 block text-xs font-bold uppercase text-gray-400">Notas</span>{movement.notes}</div>}

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-gray-400">Registrado por:</span> <strong className="text-gray-700 dark:text-gray-200">{movement.employee?.fullName || "Sistema"}</strong></div>
            <div><span className="text-gray-400">Origen:</span> <strong className="text-gray-700 dark:text-gray-200">{movement.origin ? `${movement.origin.type} #${movement.origin.id}` : "—"}</strong></div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 p-5 dark:border-gray-700">
          <button type="button" onClick={onClose} className="rounded-2xl bg-[#6C7D38] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5b6a2f]">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
