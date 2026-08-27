import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  id: string;
  date: string; // Formato YYYY-MM-DD
  title: string;
  time: string;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function CalendarView({
  events = [],
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)); // Noviembre 2024 según mockup

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Cambiar de mes
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Cálculo de días del mes
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Ajustar para que el primer día sea Lunes (0) en vez de Domingo
  const startingOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Construcción de celdas
  const calendarDays = [];

  // Días del mes anterior (grises)
  for (let i = startingOffset - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: "",
    });
  }

  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      dateStr: formattedDate,
    });
  }

  // Días del siguiente mes para completar 35 o 42 celdas
  const remainingCells = 35 - calendarDays.length;
  for (
    let i = 1;
    i <= (remainingCells < 0 ? 42 - calendarDays.length : remainingCells);
    i++
  ) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateStr: "",
    });
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm transition-colors font-sans">
      {/* HEADER DEL CALENDARIO */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-xs font-bold text-gray-400 dark:text-gray-500 py-2 tracking-wider"
          >
            {day}
          </span>
        ))}
      </div>

      {/* CUADRÍCULA DE DÍAS */}
      <div className="grid grid-cols-7 border-t border-l border-gray-100 dark:border-gray-700/60 rounded-xl overflow-hidden">
        {calendarDays.map((item, index) => {
          const dayEvents = events.filter((e) => e.date === item.dateStr);
          const isSelected = selectedDate === item.dateStr;

          return (
            <div
              key={index}
              onClick={() =>
                item.isCurrentMonth &&
                onSelectDate &&
                onSelectDate(item.dateStr)
              }
              className={`min-h-[85px] p-2 border-r border-b border-gray-100 dark:border-gray-700/60 transition-colors flex flex-col justify-between ${
                item.isCurrentMonth
                  ? "bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
                  : "bg-gray-50/50 dark:bg-gray-900/40 text-gray-300 dark:text-gray-600 pointer-events-none"
              } ${isSelected ? "bg-[#5b642a]/10 dark:bg-[#5b642a]/20" : ""}`}
            >
              {/* Número del día */}
              <span
                className={`text-sm font-semibold inline-block ${
                  isSelected
                    ? "text-[#5b642a] dark:text-[#7c8839] font-bold"
                    : item.isCurrentMonth
                      ? "text-gray-700 dark:text-gray-200"
                      : ""
                }`}
              >
                {item.day}
              </span>

              {/* Eventos / Etiquetas flotantes */}
              <div className="flex flex-col gap-1 mt-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
