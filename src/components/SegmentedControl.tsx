// src/components/DatePickerSelect.tsx
import React from "react";
import { Calendar } from "lucide-react";

interface DatePickerSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}

const defaultOptions = [
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Este mes", value: "this_month" },
  { label: "Año actual", value: "this_year" },
];

export default function DatePickerSelect({
  value,
  onChange,
  options = defaultOptions,
}: DatePickerSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <Calendar className="absolute left-3.5 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-8 py-2 text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm cursor-pointer appearance-none focus:outline-none focus:border-[#5b642a] transition-all"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="dark:bg-gray-800"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
