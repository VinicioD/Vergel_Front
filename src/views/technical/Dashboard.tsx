// src/views/technical/Dashboard.tsx
import { useEffect, useState } from "react";
import KpiCard from "../../components/KpiCard";
import { Calendar, FileText, CircleAlert, RefreshCw } from "lucide-react";
import { getTechnicalDashboardStats, type TechnicalDashboardStats } from "../../services/dashboardService";

const EMPTY_STATS: TechnicalDashboardStats = { todayVisits: 0, completedMonth: 0, pendingVisits: 0 };

export default function Dashboard() {
  const [stats, setStats] = useState<TechnicalDashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStats = async () => {
    setIsLoading(true);
    try { setStats(await getTechnicalDashboardStats()); setErrorMessage(""); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    void getTechnicalDashboardStats()
      .then((response) => { setStats(response); setErrorMessage(""); })
      .catch((error: unknown) => { setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas."); })
      .finally(() => setIsLoading(false));
  }, []);

  const kpis = [
    { title: "Visitas de hoy", value: isLoading ? "—" : String(stats.todayVisits), badgeText: "Asignadas", badgeType: "positive" as const },
    { title: "Completadas (mes)", value: isLoading ? "—" : String(stats.completedMonth), badgeText: "Este mes", badgeType: "positive" as const },
    { title: "Pendientes", value: isLoading ? "—" : String(stats.pendingVisits), badgeText: "Requieren atención", badgeType: "warning" as const },
  ];

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
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          title="Actualizar estadísticas"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:self-auto"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* MENSAJE DE ERROR */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <CircleAlert size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TARJETAS DE INDICADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
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
