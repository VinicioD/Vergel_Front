// src/components/DateRangePicker.tsx
import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export interface DateOption {
  label: string;
  value: string;
}

interface DateRangePickerProps {
  value?: string;
  onChange?: (option: DateOption) => void;
  options?: DateOption[];
  labelPrefix?: string; // <-- Prop opcional agregada
}

const defaultOptions: DateOption[] = [
  { label: "Hoy, 24 Oct 2024", value: "today" },
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "last_month" },
  { label: "Año actual", value: "this_year" },
];

export default function DateRangePicker({
  value = "today",
  onChange,
  options = defaultOptions,
  labelPrefix, // <-- Recibimos la prop
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DateOption>(
    () => options.find((opt) => opt.value === value) || options[0],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DateOption) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="relative inline-block font-sans" ref={containerRef}>
      {/* BOTÓN PRINCIPAL */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-2xl shadow-sm text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 focus:outline-none"
      >
        <Calendar
          size={15}
          className="text-gray-500 dark:text-gray-400 shrink-0"
        />
        {/* Mostramos el prefijo si existe */}
        <span>
          {labelPrefix && (
            <span className="text-gray-400 font-normal">{labelPrefix} </span>
          )}
          {selected.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN DE OPCIONES */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg py-1.5 z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => {
            const isSelected = option.value === selected.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-[#5b642a]/10 dark:bg-[#5b642a]/20 text-[#5b642a] dark:text-[#7c8839] font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5b642a] dark:bg-[#7c8839]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
