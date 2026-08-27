// src/components/DailyInspections.tsx
import React from "react";
import { MapPin, Plus } from "lucide-react";
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
}

export default function DailyInspections({
  dateTitle = "Inspecciones de Hoy",
  inspections,
  onScheduleNew,
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
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6 transition-colors font-sans">
      <div className="flex flex-col gap-4">
        {/* Título */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {dateTitle}
        </h2>

        {/* Lista de Inspecciones */}
        <div className="flex flex-col gap-3">
          {inspections.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#F4EFE6]/60 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 flex flex-col gap-2 transition-colors"
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
            </div>
          ))}
        </div>
      </div>

      {/* Botón de Acción */}
      <Button
        variant="primary"
        onClick={onScheduleNew}
        className="w-full justify-center py-3 rounded-2xl"
      >
        Programar Inspección
      </Button>
    </div>
  );
}
