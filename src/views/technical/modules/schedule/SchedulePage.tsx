// src/views/technical/modules/schedule/SchedulePage.tsx
// El rol técnico reutiliza la vista de agenda del admin y solo aporta sus datos.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CalendarEvent } from "../../../../components/CalendarView";
import type { Inspection } from "../../../../components/DailyInspections";
import ScheduleView from "../../../admin/modules/schedule/ScheduleView";

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    date: "2024-11-01",
    title: "Club Campestre (09:00)",
    time: "09:00",
  },
  {
    id: "2",
    date: "2024-11-11",
    title: "Inmobiliaria Bosques (11:00)",
    time: "11:00",
  },
  {
    id: "3",
    date: "2024-11-24",
    title: "Condominio Olivos (16:00)",
    time: "16:00",
  },
];

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: "1",
    time: "08:30 - 10:30",
    client: "Inmobiliaria Bosques",
    type: "Inspección de Riego",
    location: "Av. Las Palmeras 450",
    status: "Asignado",
  },
  {
    id: "2",
    time: "11:00 - 12:30",
    client: "Hacienda San José",
    type: "Poda y Diagnóstico",
    location: "Km 12 Camino Verde",
    status: "En Proceso",
  },
  {
    id: "3",
    time: "15:00 - 16:30",
    client: "Condominio Olivos",
    type: "Tratamiento Fitopatológico",
    location: "Calle Jazmines 102",
    status: "Asignado",
  },
];

export default function SchedulePage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  return (
    <ScheduleView
      events={MOCK_EVENTS}
      inspections={MOCK_INSPECTIONS}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      onScheduleNew={() => navigate("new")}
      dateTitle="Mis Inspecciones de Hoy"
      title="Mi Agenda"
      subtitle="Consulta las visitas e inspecciones que tienes asignadas"
    />
  );
}
