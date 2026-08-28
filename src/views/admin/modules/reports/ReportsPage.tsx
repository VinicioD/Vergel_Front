// src/views/admin/modules/reports/ReportsPage.tsx
import React, { useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react";
import DatePickerSelect from "../../../../components/DateRangePicker";

interface AnnualSummaryRow {
  month: string;
  quotesCount: number;
  totalIncome: number;
  totalPaid: number;
  newClients: number;
}

const MOCK_ANNUAL_DATA: AnnualSummaryRow[] = [
  {
    month: "Enero",
    quotesCount: 14,
    totalIncome: 12500,
    totalPaid: 12500,
    newClients: 3,
  },
  {
    month: "Febrero",
    quotesCount: 18,
    totalIncome: 16800,
    totalPaid: 14200,
    newClients: 5,
  },
  {
    month: "Marzo",
    quotesCount: 22,
    totalIncome: 21000,
    totalPaid: 19500,
    newClients: 4,
  },
  {
    month: "Abril",
    quotesCount: 19,
    totalIncome: 15400,
    totalPaid: 15400,
    newClients: 2,
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"export" | "summary" | "payments">(
    "export",
  );
  const [dateFilter, setDateFilter] = useState("this_month");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("10");

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER DE LA VISTA */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Reportes & Finanzas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generación de informes contables/fiscales, control de cobros y
            rentabilidad
          </p>
        </div>
      </div>

      {/* KPI CARDS (RESUMEN FINANCIERO GENERAL 5.9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Producción
            </span>
            <DollarSign size={18} className="text-[#5b642a]" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            $65,700.00
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">
            Cotizaciones aprobadas acumuladas
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Pagado
            </span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            $61,600.00
          </span>
          <span className="text-[11px] text-emerald-600/80 font-medium block mt-1">
            93.7% cobrado
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pendiente de Cobro
            </span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            $4,100.00
          </span>
          <span className="text-[11px] text-amber-600/80 font-medium block mt-1">
            Cuentas por cobrar activas
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Rentabilidad Estimada
            </span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            38.4%
          </span>
          <span className="text-[11px] text-blue-600/80 font-medium block mt-1">
            Margen neto operativo
          </span>
        </div>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-700 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("export")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "export"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Download size={16} />
          <span>Generador de Reportes (5.10)</span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "summary"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <PieChart size={16} />
          <span>Resumen Anual & Métricas (5.9)</span>
        </button>
      </div>

      {/* ----------------- PESTAÑA 1: GENERADOR DE REPORTES (5.10) ----------------- */}
      {activeTab === "export" && (
        <div className="flex flex-col gap-6">
          {/* BARRA DE FILTRO POR FECHAS */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#5b642a]" size={20} />
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                  Período del Reporte
                </span>
                <span className="text-[11px] text-gray-400">
                  Aplica para todas las descargas fiscales y contables
                </span>
              </div>
            </div>
            <DatePickerSelect
              value={dateFilter}
              onChange={(opt) => setDateFilter(opt.value)}
            />
          </div>

          {/* TARJETAS DE REPORTES PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reporte Mensual de Ventas */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-2xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Reporte Mensual de Ventas
                    </h3>
                    <span className="text-xs text-gray-400">
                      Métricas de Facturación e Ingresos
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Detalle de cotizaciones aprobadas, cobros liquidados, saldos
                  pendientes por cliente y facturación consolidada para
                  auditoría fiscal.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => alert("Descargando PDF de Ventas...")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all"
                >
                  <FileCode size={16} />
                  <span>PDF Contable</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Descargando Excel de Ventas...")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <FileSpreadsheet size={16} />
                  <span>Excel Data</span>
                </button>
              </div>
            </div>

            {/* Reporte Mensual de Compras */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Reporte Mensual de Compras
                    </h3>
                    <span className="text-xs text-gray-400">
                      Egresos e Insumos de Jardinería
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Resumen de gastos operativos, adquisición de fertilizantes,
                  herramientas y contratación de proveedores externos en el
                  período seleccionado.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => alert("Descargando PDF de Compras...")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all"
                >
                  <FileCode size={16} />
                  <span>PDF Contable</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Descargando Excel de Compras...")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <FileSpreadsheet size={16} />
                  <span>Excel Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PESTAÑA 2: RESUMEN ANUAL (5.9) ----------------- */}
      {activeTab === "summary" && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Resumen Anual Consolidado
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Desglose mes a mes del volumen operativo e ingresos
              </p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200"
            >
              <option value="2026">Año 2026</option>
              <option value="2025">Año 2025</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="py-3 px-4">MES</th>
                  <th className="py-3 px-4">COTIZACIONES</th>
                  <th className="py-3 px-4">INGRESO TOTAL</th>
                  <th className="py-3 px-4">TOTAL PAGADO</th>
                  <th className="py-3 px-4">NUEVOS CLIENTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
                {MOCK_ANNUAL_DATA.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100">
                      {row.month}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {row.quotesCount} cotizaciones
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-gray-100">
                      ${row.totalIncome.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${row.totalPaid.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      +{row.newClients} clientes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
