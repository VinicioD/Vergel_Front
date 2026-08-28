// src/views/admin/modules/rates/RatesPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Edit2, Download, Trash2 } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table, { type Column } from "../../../../components/Table";

interface Rate {
  id: string;
  service: string;
  description: string;
  unit: string;
  base: string;
  premium: string;
}

const INITIAL_RATES: Rate[] = [
  {
    id: "1",
    service: "Poda de árboles",
    description: "Poda de formación, reducción de copa y despeje",
    unit: "Por Árbol",
    base: "$45.00",
    premium: "$65.00",
  },
  {
    id: "2",
    service: "Diseño de jardín",
    description: "Plano paisajista conceptual en 3D y especies",
    unit: "Por Proyecto",
    base: "$350.00",
    premium: "$600.00",
  },
  {
    id: "3",
    service: "Fumigación",
    description: "Control integrado de plagas, ácaros y cochinillas",
    unit: "M² Terreno",
    base: "$1.20",
    premium: "$2.00",
  },
  {
    id: "4",
    service: "Mantenimiento mensual",
    description: "Poda de césped, control de malezas y abono",
    unit: "Mensual",
    base: "$120.00",
    premium: "$180.00",
  },
  {
    id: "5",
    service: "Riego automatizado",
    description: "Instalación de controladores y líneas de goteo",
    unit: "Por Estación",
    base: "$150.00",
    premium: "$250.00",
  },
  {
    id: "6",
    service: "Consultoría paisajística",
    description: "Inspección técnica de sanidad vegetal y riego",
    unit: "Por Sesión",
    base: "$80.00",
    premium: "$120.00",
  },
];

export default function RatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = INITIAL_RATES.filter(
    (item) =>
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns: Column<Rate>[] = [
    {
      header: "SERVICIO",
      accessorKey: "service",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "DESCRIPCIÓN",
      accessorKey: "description",
      className: "text-gray-500 dark:text-gray-400 text-xs min-w-[200px]",
    },
    {
      header: "UNIDAD",
      accessorKey: "unit",
      className: "text-gray-500 dark:text-gray-400 whitespace-nowrap",
    },
    {
      header: "BASE",
      accessorKey: "base",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "PREMIUM",
      accessorKey: "premium",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "ACCIONES",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => console.log("Ver tarifa", item.id)}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => console.log("Editar tarifa", item.id)}
            className="p-1.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={() => console.log("Descargar tarifa", item.id)}
            className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            title="Descargar"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => console.log("Eliminar tarifa", item.id)}
            className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Tarifas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Actualización de precios base y ofertas de servicios
          </p>
        </div>
      </div>

      {/* CONTROLES Y NAVEGACIÓN */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            icon={Search}
            placeholder="Buscar tarifa por servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate("new")}
          className="w-full sm:w-auto justify-center"
        >
          Nueva Tarifa
        </Button>
      </div>

      {/* CONTENEDOR DE TABLA RESPONSIVO */}
      <div className="w-full overflow-x-auto rounded-lg">
        <Table
          data={filteredData}
          columns={columns}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          entityName="tarifas"
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
