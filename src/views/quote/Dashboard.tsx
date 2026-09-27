// src/views/quote/Dashboard.tsx
import KpiCard from "../../components/KpiCard";
import { FileText, Users, BookOpen } from "lucide-react";

const KPIS = [
  {
    title: "Cotizaciones del mes",
    value: "24",
    badgeText: "+6",
    badgeType: "positive" as const,
  },
  {
    title: "Monto cotizado",
    value: "$38,640.00",
    badgeText: "Este mes",
    badgeType: "neutral" as const,
  },
  {
    title: "Tasa de aprobación",
    value: "68%",
    badgeText: "+5.2%",
    badgeType: "positive" as const,
  },
  {
    title: "Pendientes",
    value: "5",
    badgeText: "Sin responder",
    badgeType: "warning" as const,
  },
];

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
