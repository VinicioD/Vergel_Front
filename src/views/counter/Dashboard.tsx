// src/views/counter/Dashboard.tsx
import KpiCard from "../../components/KpiCard";
import { History, TrendingUp, AlertCircle } from "lucide-react";

const KPIS = [
  {
    title: "Ingresos del mes",
    value: "$12,850.00",
    badgeText: "+15.2%",
    badgeType: "positive" as const,
  },
  {
    title: "Egresos del mes",
    value: "$4,920.00",
    badgeText: "-2.4%",
    badgeType: "negative" as const,
  },
  {
    title: "Cuentas por cobrar",
    value: "$3,450.00",
    badgeText: "$1.2k vencido",
    badgeType: "warning" as const,
  },
  {
    title: "Cotizaciones emitidas",
    value: "73",
    badgeText: "En lo que va del año",
    badgeType: "positive" as const,
  },
];

const SHORTCUTS = [
  {
    title: "Finanzas",
    description: "Ingresos, egresos y rentabilidad en tiempo real",
    icon: TrendingUp,
  },
  {
    title: "Reportes",
    description: "Informes contables/fiscales y resumen anual",
    icon: AlertCircle,
  },
  {
    title: "Historial",
    description: "Ingresos y egresos registrados en el sistema",
    icon: History,
  },
];

export default function Dashboard() {
  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Resumen de Contabilidad
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Controla los cobros, los egresos y la rentabilidad del negocio
          </p>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
