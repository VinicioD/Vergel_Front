// src/components/Timeline.tsx
import React from "react";

export interface TimelineItem {
  id: string;
  time: string;
  date: string;
  user: string;
  role: string;
  description: React.ReactNode | string; // Permite texto con negritas dinámicas
  module: string;
  dotColor?: "olive" | "peach" | "gray" | "emerald";
}

interface TimelineProps {
  title?: string;
  items: TimelineItem[];
}

export default function Timeline({
  title = "Línea de Tiempo del Día",
  items,
}: TimelineProps) {
  // Configuración de colores para los puntos indicadores
  const dotStyles = {
    olive: "bg-[#5b642a]",
    peach: "bg-amber-600 dark:bg-amber-500",
    gray: "bg-gray-500 dark:bg-gray-400",
    emerald: "bg-emerald-600 dark:bg-emerald-400",
  };

  // Configuración de colores para los badges de los módulos
  const badgeStyles = {
    olive:
      "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    peach:
      "bg-rose-100/80 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    emerald:
      "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm transition-colors font-sans">
      {/* Título de la Bitácora */}
      {title && (
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
          {title}
        </h2>
      )}

      {/* Lista de Eventos */}
      <div className="flex flex-col">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const dotColor = item.dotColor || "olive";

          return (
            <div key={item.id} className="flex items-start gap-4 group">
              {/* Columna 1: Hora y Fecha */}
              <div className="w-20 shrink-0 text-right pt-0.5">
                <span className="block text-xs font-bold text-gray-900 dark:text-gray-100">
                  {item.time}
                </span>
                <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                  {item.date}
                </span>
              </div>

              {/* Columna 2: Línea vertical + Punto conector */}
              <div className="relative flex flex-col items-center self-stretch">
                <span
                  className={`w-3 h-3 rounded-full mt-1.5 shrink-0 transition-colors ${dotStyles[dotColor]}`}
                />
                {!isLast && (
                  <span className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                )}
              </div>

              {/* Columna 3: Contenido de la Bitácora */}
              <div className={`flex-1 ${!isLast ? "pb-6" : "pb-0"} pt-0.5`}>
                {/* Autor y Rol */}
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {item.user}{" "}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    ({item.role})
                  </span>
                </h3>

                {/* Acción realizada */}
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {item.description}
                </div>

                {/* Badge del Módulo Afectado */}
                <div className="mt-2.5">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${badgeStyles[dotColor]}`}
                  >
                    {item.module}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
