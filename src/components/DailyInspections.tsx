// src/components/DailyInspections.tsx
import { Edit, Eye, MapPin, Trash2 } from "lucide-react";
import Button from "./Button";

export interface Inspection {
  id: string;
  time: string;
  client: string;
  type: string;
  location: string;
  status: "Asignado" | "En Proceso" | "Completado";
}

interface DailyInspectionsProps {
  dateTitle?: string;
  inspections: Inspection[];
  onScheduleNew?: () => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DailyInspections({
  dateTitle = "Inspecciones de Hoy",
  inspections,
  onScheduleNew,
  onView,
  onEdit,
  onDelete,
}: DailyInspectionsProps) {
  // Variaciones de color para badges
  const statusStyles = {
    Asignado:
      "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    "En Proceso":
      "bg-blue-100/80 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    Completado: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-colors font-sans">
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Título */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 shrink-0">
          {dateTitle}
        </h2>

        {/* Lista de Inspecciones */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1">
          {inspections.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#F4EFE6]/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 flex flex-col gap-2 transition-colors shrink-0"
            >
              {/* Hora y Badge Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5b642a] dark:text-[#7c8839]">
                  {item.time}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    statusStyles[item.status] || statusStyles["Asignado"]
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Cliente y Tipo de Trabajo */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {item.client}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.type}
                </p>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <MapPin size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">{item.location}</span>
              </div>

              {/* Acciones */}
              {(onView || onEdit || onDelete) && (
                <div className="flex items-center justify-end gap-1.5 pt-2 mt-1 border-t border-gray-100 dark:border-gray-700/50">
                  {onView && (
                    <button
                      type="button"
                      title="Ver detalle"
                      onClick={() => onView(item.id)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5b642a] dark:hover:text-[#7c8839] hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      title="Editar cita"
                      onClick={() => onEdit(item.id)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      title="Eliminar cita"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {inspections.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
              No hay citas programadas para este día.
            </p>
          )}
        </div>
      </div>

      {/* Botón de Acción */}
      <Button
        variant="primary"
        onClick={onScheduleNew}
        className="w-full justify-center py-3 rounded-2xl shrink-0"
      >
        Programar Inspección
      </Button>
    </div>
  );
}
