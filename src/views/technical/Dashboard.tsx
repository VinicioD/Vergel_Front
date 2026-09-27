// src/views/technical/Dashboard.tsx
import KpiCard from "../../components/KpiCard";
import { Calendar, FileText } from "lucide-react";

const KPIS = [
  {
    title: "Visitas de hoy",
    value: "3",
    badgeText: "2 Asignadas",
    badgeType: "positive" as const,
  },
  {
    title: "Completadas (mes)",
    value: "18",
    badgeText: "+4",
    badgeType: "positive" as const,
  },
  {
    title: "Pendientes",
    value: "2",
    badgeText: "Requieren atención",
    badgeType: "warning" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Mi Día
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Resumen de tus visitas e inspecciones asignadas
          </p>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            badgeText={kpi.badgeText}
            badgeType={kpi.badgeType}
          />
        ))}
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-[#636B2F] text-white flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-gray-100">
              Ver mi agenda
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Calendario de visitas programadas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm transition-colors">
          <div className="w-11 h-11 rounded-2xl bg-[#636B2F] text-white flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-gray-100">
              Reportes
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Próximamente disponible
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
