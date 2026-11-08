// src/views/admin/modules/schedule/ScheduleView.tsx
import CalendarView, {
  type CalendarEvent,
} from "../../../../components/CalendarView";
import DailyInspections, {
  type Inspection,
} from "../../../../components/DailyInspections";
import { Loader2 } from "lucide-react";

export interface ScheduleViewProps {
  events?: CalendarEvent[];
  inspections?: Inspection[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onScheduleNew?: () => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  dateTitle?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export default function ScheduleView({
  events = [],
  inspections = [],
  selectedDate,
  onSelectDate,
  onScheduleNew,
  onView,
  onEdit,
  onDelete,
  dateTitle = "Inspecciones del Día",
  title = "Agenda e Inspecciones",
  loading = false,
}: ScheduleViewProps) {
  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-6 font-sans lg:h-[calc(100dvh-3rem)] lg:overflow-hidden">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* ESTADO DE CARGA GLOBAL */}
      {loading ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#5d682e]" size={36} />
          <p className="text-xs text-gray-500 mt-2">
            Cargando agenda de citas...
          </p>
        </div>
      ) : (
        /* GRID PRINCIPAL: CALENDARIO (IZQ) Y LISTA DIARIA (DER) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:flex-1 lg:min-h-0 lg:grid-rows-1 lg:items-stretch">
          {/* Calendario */}
          <div className="lg:col-span-7 xl:col-span-8 w-full overflow-x-auto lg:min-h-0 lg:overflow-y-auto">
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          </div>

          {/* Panel lateral de inspecciones */}
          <div className="lg:col-span-5 xl:col-span-4 w-full lg:min-h-0 lg:flex">
            <DailyInspections
              dateTitle={dateTitle}
              inspections={inspections}
              onScheduleNew={onScheduleNew}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
