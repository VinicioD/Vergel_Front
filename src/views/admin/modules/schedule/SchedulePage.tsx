// src/views/admin/modules/inspections/InspectionsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarView, {
  type CalendarEvent,
} from "../../../../components/CalendarView";
import DailyInspections, {
  type Inspection,
} from "../../../../components/DailyInspections";

// Datos de prueba para el calendario
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    date: "2024-11-01",
    title: "Club Campestre (09:00)",
    time: "09:00",
  },
  {
    id: "2",
    date: "2024-11-04",
    title: "Vivero Central (14:30)",
    time: "14:30",
  },
  {
    id: "3",
    date: "2024-11-11",
    title: "Inmobiliaria Bosques (11:00)",
    time: "11:00",
  },
  {
    id: "4",
    date: "2024-11-24",
    title: "Condominio Olivos (16:00)",
    time: "16:00",
  },
];

// Datos de prueba para el panel lateral de inspecciones diarias
const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: "1",
    time: "09:00 - 11:30",
    client: "Inmobiliaria Bosques",
    type: "Inspección de Riego",
    location: "Av. Las Palmeras 450",
    status: "Asignado",
  },
  {
    id: "2",
    time: "14:30 - 16:00",
    client: "Hacienda San José",
    type: "Poda y Diagnóstico",
    location: "Km 12 Camino Verde",
    status: "En Proceso",
  },
  {
    id: "3",
    time: "17:00 - 18:00",
    client: "Sra. Amelia Prado",
    type: "Tratamiento Fitopatológico",
    location: "Calle Jazmines 102",
    status: "Asignado",
  },
];

export default function InspectionsPage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Agenda e Inspecciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organiza visitas técnicas, podas programadas e inspecciones
          </p>
        </div>
      </div>

      {/* GRID PRINCIPAL: CALENDARIO (IZQ) Y LISTA DIARIA (DER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendario */}
        <div className="lg:col-span-7 xl:col-span-8 w-full overflow-x-auto">
          <CalendarView
            events={MOCK_EVENTS}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Panel lateral de inspecciones */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <DailyInspections
            dateTitle="Inspecciones de Hoy"
            inspections={MOCK_INSPECTIONS}
            onScheduleNew={() => navigate("new")}
          />
        </div>
      </div>
    </div>
  );
}
