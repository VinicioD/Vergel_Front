import React from "react";

export interface KpiCardProps {
  title: string;
  value: string;
  badgeText: string;
  badgeType?: "positive" | "negative" | "warning" | "neutral";
}

export default function KpiCard({
  title,
  value,
  badgeText,
  badgeType = "positive",
}: KpiCardProps) {
  // Configuración de colores para cada tipo de badge (Light + Dark Mode)
  const badgeStyles = {
    positive:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    negative:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm transition-colors font-sans flex flex-col justify-between gap-3">
      {/* Título */}
      <span className="text-xs font-bold text-gray-400 dark:text-gray-400 tracking-wider uppercase">
        {title}
      </span>

      {/* Valor + Badge */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-[#3a3d20] dark:text-gray-100 tracking-tight">
          {value}
        </span>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${badgeStyles[badgeType]}`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}
