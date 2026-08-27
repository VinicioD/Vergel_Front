import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Input from "./components/Input";
import { adminMenu } from "./config/menuConfig";
import SearchableSelect from "./components/SearchableSelect";
import { Search, Sun, Moon, User, Download, Plus } from "lucide-react";
import Button from "./components/Button";
import Table, { type Column } from "./components/Table";
import DailyInspections, {
  type Inspection,
} from "./components/DailyInspections";
import CalendarView, { type CalendarEvent } from "./components/CalendarView";
import KpiCard from "./components/KpiCard";

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(adminMenu[0].name);
  const [darkMode, setDarkMode] = useState(true);

  const statusOptions = [
    { label: "Todos los estados", value: "all" },
    { label: "Activo", value: "active" },
    { label: "Inactivo", value: "inactive" },
    { label: "Pendiente", value: "pending" },
  ];
  const [status, setStatus] = useState("all");

  //constantes psra el calendario
  const mockEvents: CalendarEvent[] = [
    { id: "1", date: "2024-11-01", title: "Club Campestre", time: "09:00" },
    { id: "2", date: "2024-11-04", title: "Vivero Central", time: "14:30" },
    {
      id: "3",
      date: "2024-11-11",
      title: "Inmobiliaria Bosques",
      time: "11:00",
    },
    { id: "4", date: "2024-11-24", title: "Condominio Olivos", time: "16:00" },
  ];

  const mockInspection: Inspection[] = [
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
      status: "Asignado",
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

  // EFECTO PARA APLICAR MODO OSCURO GLOBAL EN EL HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  interface Cotizacion {
    id: string;
    code: string;
    client: string;
    date: string;
    services: string;
    amount: string;
    status: "Aprobada" | "Pendiente" | "Rechazada";
  }

  const cotizacionesData: Cotizacion[] = [
    {
      id: "1",
      code: "COT-2024-001",
      client: "Inmobiliaria Bosques",
      date: "24 Oct 2024",
      services: "Diseño Paisajista y Riego",
      amount: "$3,450.00",
      status: "Aprobada",
    },
    {
      id: "2",
      code: "COT-2024-002",
      client: "Club Campestre",
      date: "22 Oct 2024",
      services: "Mantenimiento Áreas Verdes",
      amount: "$1,890.00",
      status: "Pendiente",
    },
    {
      id: "3",
      code: "COT-2024-003",
      client: "Condominio Olivos",
      date: "19 Oct 2024",
      services: "Poda de Altura e Inspección",
      amount: "$980.00",
      status: "Pendiente",
    },
    {
      id: "4",
      code: "COT-2024-004",
      client: "María José Delgado",
      date: "15 Oct 2024",
      services: "Suministro de Palmeras",
      amount: "$1,200.00",
      status: "Rechazada",
    },
    {
      id: "5",
      code: "COT-2024-005",
      client: "Vivero El Sol",
      date: "10 Oct 2024",
      services: "Sustrato Orgánico Premium",
      amount: "$540.00",
      status: "Aprobada",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);

  // Mapeo de colores para los badges de Estado
  const statusStyles = {
    Aprobada:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Pendiente:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Rechazada:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  };

  const columns: Column<Cotizacion>[] = [
    {
      header: "Nº Cotización",
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {item.code}
        </span>
      ),
    },
    {
      header: "Cliente",
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {item.client}
        </span>
      ),
    },
    {
      header: "Fecha",
      render: (item) => (
        <span className="text-gray-400 font-medium">{item.date}</span>
      ),
    },
    {
      header: "Servicios",
      accessorKey: "services",
    },
    {
      header: "Monto",
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {item.amount}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${statusStyles[item.status]}`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  //inspectiondayli
  const mockInspections: Inspection[] = [
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
      status: "Asignado",
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

  const [selectedDate, setSelectedDate] = useState("2024-11-22");
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        items={adminMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 ">
        {/* Header Superior con Botón de Tema */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{activeTab}</h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        {/* Tarjeta de Prueba para Input */}
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm transition-colors max-w-xl flex flex-col gap-4">
          <Input
            label="Buscador"
            icon={Search}
            placeholder="Buscar cliente..."
          />

          <Input
            label="Nombre Completo"
            icon={User}
            placeholder="Ej. Juan Pérez"
          />

          <SearchableSelect
            label="Estado"
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />

          {/* Botón Descargar PDF (Outline) */}
          <Button variant="outline" icon={Download}>
            Descargar PDF
          </Button>

          {/* Botón Nueva Cotización (Primary) */}
          <Button variant="primary" icon={Plus}>
            Nueva Cotización
          </Button>
        </div>
        <div className="p-6 min-h-screen">
          <Table
            data={cotizacionesData}
            columns={columns}
            itemsPerPage={10} // Muestra 10 registros por página
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            entityName="cotizaciones"
          />
        </div>
        {/*calendar + dailyinspection*/}
        <div className="p-6 bg-[#F4EFE6] dark:bg-gray-900 min-h-screen transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {/* Calendario */}
            <div className="lg:col-span-2 xl:col-span-3">
              <CalendarView
                events={mockEvents}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* Inspecciones del Día */}
            <div className="lg:col-span-1">
              <DailyInspections
                inspections={mockInspections}
                onScheduleNew={() => alert("Abrir Modal de Inspección")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-[#F4EFE6] dark:bg-gray-900">
          <KpiCard
            title="Ingresos del mes"
            value="$12,850.00"
            badgeText="+18.2%"
            badgeType="positive"
          />

          <KpiCard
            title="Egresos del mes"
            value="$4,920.00"
            badgeText="-2.4%"
            badgeType="negative"
          />
        </div>
      </main>
    </div>
  );
}
