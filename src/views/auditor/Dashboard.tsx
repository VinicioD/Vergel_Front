// src/views/auditor/Dashboard.tsx
import { useEffect, useState } from "react";
import KpiCard from "../../components/KpiCard";
import { History, ArrowRightLeft, CircleAlert, RefreshCw } from "lucide-react";
import { getAuditorDashboardStats, type AuditorDashboardStats } from "../../services/dashboardService";

const EMPTY_STATS: AuditorDashboardStats = { monthlyMovements: 0, auditedIncome: 0, pendingReview: 0, discrepancies: 0 };
const currencyFormatter = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });
const SHORTCUTS = [
  { title: "Historial", description: "Ingresos y egresos registrados en el sistema", icon: History },
  { title: "Movimientos", description: "Trazabilidad de las acciones por usuario", icon: ArrowRightLeft },
];

export default function Dashboard() {
  const [stats, setStats] = useState<AuditorDashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStats = async () => {
    setIsLoading(true);
    try { setStats(await getAuditorDashboardStats()); setErrorMessage(""); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    void getAuditorDashboardStats()
      .then((response) => { setStats(response); setErrorMessage(""); })
      .catch((error: unknown) => { setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas."); })
      .finally(() => setIsLoading(false));
  }, []);

  const kpis = [
    { title: "Movimientos del mes", value: isLoading ? "—" : String(stats.monthlyMovements), badgeText: "Bitácoras", badgeType: "positive" as const },
    { title: "Ingresos auditados", value: isLoading ? "—" : currencyFormatter.format(stats.auditedIncome), badgeText: "Este mes", badgeType: "positive" as const },
    { title: "Por revisar", value: isLoading ? "—" : String(stats.pendingReview), badgeText: "Accesos denegados", badgeType: "warning" as const },
    { title: "Discrepancias", value: isLoading ? "—" : String(stats.discrepancies), badgeText: "Sin resolver", badgeType: "negative" as const },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Resumen de Auditoría
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revisa los movimientos registrados y detecta discrepancias
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {SHORTCUTS.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <div
              key={shortcut.title}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#636B2F] text-white flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {shortcut.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {shortcut.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
