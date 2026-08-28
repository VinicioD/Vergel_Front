// src/views/admin/modules/audit/AuditPage.tsx
import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "../../../../components/Button";
import DateRangePicker, {
  type DateOption,
} from "../../../../components/DateRangePicker";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import Timeline, { type TimelineItem } from "../../../../components/Timeline";

const USER_OPTIONS: SelectOption[] = [
  { label: "Todos los colaboradores", value: "ALL" },
  { label: "Carlos Huerta", value: "carlos" },
  { label: "Lucía Mendoza", value: "lucia" },
  { label: "Sistema Automático", value: "system" },
  { label: "Raúl Torres", value: "raul" },
];

const INITIAL_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: "1",
    time: "10:45 AM",
    date: "Hoy",
    user: "Carlos Huerta",
    role: "Administrador",
    dotColor: "olive",
    module: "Finanzas / Cotización",
    description: (
      <>
        Aprobó la cotización{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          COT-2024-091
        </strong>{" "}
        para el cliente{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          Residencial Los Parques
        </strong>{" "}
        por un monto de{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          $1,450.00
        </strong>
        .
      </>
    ),
  },
  {
    id: "2",
    time: "09:15 AM",
    date: "Hoy",
    user: "Lucía Mendoza",
    role: "Asistente",
    dotColor: "peach",
    module: "Creación",
    description: (
      <>
        Creó una nueva cotización{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          COT-2024-094
        </strong>{" "}
        asignada a{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          Club Campestre San Isidro
        </strong>
        .
      </>
    ),
  },
  {
    id: "3",
    time: "08:30 AM",
    date: "Hoy",
    user: "Sistema Automático",
    role: "Bot",
    dotColor: "emerald",
    module: "Sincronización",
    description: (
      <>
        Sincronizó el calendario de actividades de mantenimiento con{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          4 Inspectores de Campo
        </strong>{" "}
        para la ruta del día.
      </>
    ),
  },
  {
    id: "4",
    time: "18:10 PM",
    date: "Ayer",
    user: "Raúl Torres",
    role: "Jefe de Inspectores",
    dotColor: "gray",
    module: "Inspecciones",
    description: (
      <>
        Registró reporte técnico de finalización de obra para la inspección{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          INS-2024-55
        </strong>{" "}
        en Condominio Las Hortensias.
      </>
    ),
  },

  {
    id: "1",
    time: "10:45 AM",
    date: "Hoy",
    user: "Carlos Huerta",
    role: "Administrador",
    dotColor: "olive",
    module: "Finanzas / Cotización",
    description: (
      <>
        Aprobó la cotización{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          COT-2024-091
        </strong>{" "}
        para el cliente{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          Residencial Los Parques
        </strong>{" "}
        por un monto de{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          $1,450.00
        </strong>
        .
      </>
    ),
  },
  {
    id: "2",
    time: "09:15 AM",
    date: "Hoy",
    user: "Lucía Mendoza",
    role: "Asistente",
    dotColor: "peach",
    module: "Creación",
    description: (
      <>
        Creó una nueva cotización{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          COT-2024-094
        </strong>{" "}
        asignada a{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          Club Campestre San Isidro
        </strong>
        .
      </>
    ),
  },
  {
    id: "3",
    time: "08:30 AM",
    date: "Hoy",
    user: "Sistema Automático",
    role: "Bot",
    dotColor: "emerald",
    module: "Sincronización",
    description: (
      <>
        Sincronizó el calendario de actividades de mantenimiento con{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          4 Inspectores de Campo
        </strong>{" "}
        para la ruta del día.
      </>
    ),
  },
  {
    id: "4",
    time: "18:10 PM",
    date: "Ayer",
    user: "Raúl Torres",
    role: "Jefe de Inspectores",
    dotColor: "gray",
    module: "Inspecciones",
    description: (
      <>
        Registró reporte técnico de finalización de obra para la inspección{" "}
        <strong className="font-bold text-gray-900 dark:text-gray-100">
          INS-2024-55
        </strong>{" "}
        en Condominio Las Hortensias.
      </>
    ),
  },
];

export default function AuditPage() {
  const [selectedDateFilter, setSelectedDateFilter] = useState("today");
  const [selectedUserFilter, setSelectedUserFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Registro de Movimientos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitorea las acciones, cambios e interacciones críticas del equipo
            en tiempo real
          </p>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Selector de Rango de Fechas */}
          <DateRangePicker
            value={selectedDateFilter}
            labelPrefix="Filtrar por Fecha:"
            onChange={(opt: DateOption) => setSelectedDateFilter(opt.value)}
          />

          {/* Selector de Usuario */}
          <div className="w-full sm:w-auto min-w-[220px]">
            <SearchableSelect
              label="Usuario"
              options={USER_OPTIONS}
              value={selectedUserFilter}
              onChange={(val) => setSelectedUserFilter(val)}
            />
          </div>
        </div>

        {/* Botón Actualizar */}
        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={handleRefresh}
          className={`w-full sm:w-auto justify-center ${
            isRefreshing ? "animate-spin" : ""
          }`}
        >
          Actualizar
        </Button>
      </div>

      {/* CONTENEDOR PRINCIPAL CON LA LÍNEA DE TIEMPO */}
      <div className="w-full">
        <Timeline
          title="Línea de Tiempo del Día"
          items={INITIAL_TIMELINE_ITEMS}
        />
      </div>
    </div>
  );
}
