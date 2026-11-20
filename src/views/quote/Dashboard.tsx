// src/views/quote/Dashboard.tsx
import { useEffect, useState } from "react";
import KpiCard from "../../components/KpiCard";
import { FileText, Users, BookOpen, CircleAlert, RefreshCw } from "lucide-react";
import { getQuoteDashboardStats, type QuoteDashboardStats } from "../../services/dashboardService";

const EMPTY_STATS: QuoteDashboardStats = {
  monthlyQuotes: 0,
  monthlyAmount: 0,
  approvalRate: 0,
  pending: 0,
};

const currencyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

const SHORTCUTS = [
  {
    title: "Cotizaciones",
    description: "Genera y da seguimiento a tus presupuestos",
    icon: FileText,
  },
  {
    title: "Clientes",
    description: "Directorio de clientes residenciales y corporativos",
    icon: Users,
  },
  {
    title: "Catálogo",
    description: "Consulta precios y stock de productos",
    icon: BookOpen,
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<QuoteDashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStats = async () => {
    setIsLoading(true);
    try {
      setStats(await getQuoteDashboardStats());
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getQuoteDashboardStats()
      .then((response) => { setStats(response); setErrorMessage(""); })
      .catch((error: unknown) => { setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar las estadísticas."); })
      .finally(() => setIsLoading(false));
  }, []);

  const kpis = [
    { title: "Cotizaciones del mes", value: isLoading ? "—" : String(stats.monthlyQuotes), badgeText: "Este mes", badgeType: "neutral" as const },
    { title: "Monto cotizado", value: isLoading ? "—" : currencyFormatter.format(stats.monthlyAmount), badgeText: "Este mes", badgeType: "neutral" as const },
    { title: "Tasa de aprobación", value: isLoading ? "—" : `${stats.approvalRate}%`, badgeText: "Cotizaciones pagadas", badgeType: "positive" as const },
    { title: "Pendientes", value: isLoading ? "—" : String(stats.pending), badgeText: "Sin responder", badgeType: "warning" as const },
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
            Resumen de tus cotizaciones y clientes
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          title="Actualizar estadísticas"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:self-auto"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* MENSAJE DE ERROR */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <CircleAlert size={16} /><span>{errorMessage}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHORTCUTS.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <div
              key={shortcut.title}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#636B2F] text-white flex items-center justify-center shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex flex-col min-w-0">
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
