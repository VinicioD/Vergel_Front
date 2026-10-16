// src/views/admin/modules/schedule/ScheduleView.tsx
// Vista de agenda reutilizable. Cada rol aporta sus propios datos mock
// y decide el texto del encabezado, pero el layout es compartido.
import CalendarView, { type CalendarEvent } from "../../../../components/CalendarView";
import DailyInspections, {
  type Inspection,
} from "../../../../components/DailyInspections";

export interface ScheduleViewProps {
  events?: CalendarEvent[];
  inspections?: Inspection[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onScheduleNew?: () => void;
  dateTitle?: string;
  title?: string;
  subtitle?: string;
}

export default function ScheduleView({
  events = [],
  inspections = [],
  selectedDate,
  onSelectDate,
  onScheduleNew,
  dateTitle = "Inspecciones de Hoy",
  title = "Agenda e Inspecciones",
  subtitle = "Organiza visitas técnicas, podas programadas e inspecciones",
}: ScheduleViewProps) {
  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* GRID PRINCIPAL: CALENDARIO (IZQ) Y LISTA DIARIA (DER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendario */}
        <div className="lg:col-span-7 xl:col-span-8 w-full overflow-x-auto">
          <CalendarView
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </div>

        {/* Panel lateral de inspecciones */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <DailyInspections
            dateTitle={dateTitle}
            inspections={inspections}
            onScheduleNew={onScheduleNew}
          />
        </div>
      </div>
    </div>
  );
}
