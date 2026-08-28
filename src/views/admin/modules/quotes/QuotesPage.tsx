// src/views/admin/modules/quotes/QuotesPage.tsx
import React, { useState } from "react";
import { Search, Download, Plus } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table, { type Column } from "../../../../components/Table";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import { useNavigate } from "react-router-dom";

// Interface según la imagen de diseño
interface Quote {
  id: string;
  code: string;
  client: string;
  date: string;
  services: string;
  amount: string;
  status: "Aprobada" | "Pendiente" | "Rechazada";
}

// Datos de prueba estáticos basándonos en tu diseño
const INITIAL_DATA: Quote[] = [
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

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "ALL" },
  { label: "Aprobada", value: "Aprobada" },
  { label: "Pendiente", value: "Pendiente" },
  { label: "Rechazada", value: "Rechazada" },
];

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Filtrado dinámico
  const filteredData = INITIAL_DATA.filter((quote) => {
    const matchesSearch =
      quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Configuración de las columnas de la tabla
  const columns: Column<Quote>[] = [
    {
      header: "N° COTIZACIÓN",
      accessorKey: "code",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "CLIENTE",
      accessorKey: "client",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "FECHA",
      accessorKey: "date",
      className: "text-gray-500 dark:text-gray-400 whitespace-nowrap",
    },
    {
      header: "SERVICIOS",
      accessorKey: "services",
      className: "min-w-[180px] text-gray-700 dark:text-gray-300",
    },
    {
      header: "MONTO",
      accessorKey: "amount",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "ESTADO",
      render: (item) => {
        const badgeStyles = {
          Aprobada:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
          Pendiente:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
          Rechazada:
            "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
              badgeStyles[item.status]
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 font-sans bg-transparent">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revisa, aprueba y genera presupuestos de servicios de jardinería
          </p>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS / FILTROS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Input de Búsqueda */}
          <div className="w-full sm:max-w-xs">
            <Input
              icon={Search}
              placeholder="Buscar cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Select de Estado */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <SearchableSelect
              label="Estado"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            icon={Download}
            className="w-full sm:w-auto justify-center"
          >
            Descargar PDF
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("new")}
            className="w-full sm:w-auto justify-center"
          >
            Nueva Cotización
          </Button>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="w-full overflow-x-auto rounded-lg">
        <Table
          data={filteredData}
          columns={columns}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          entityName="cotizaciones"
          itemsPerPage={5}
        />
      </div>
    </div>
  );
}
