// src/views/admin/modules/history/HistoryPage.tsx
import React, { useState } from "react";
import { Search, Calendar, Plus, X } from "lucide-react";
import Form, { type HistoryTransaction } from "./Form";

const INITIAL_TRANSACTIONS: HistoryTransaction[] = [
  {
    id: 1,
    date: "24 Oct 2024",
    type: "Ingreso",
    description: "Pago Cotización COT-2024-001",
    client: "Inmobiliaria Bosques",
    method: "Transferencia",
    amount: "+$3,450.00",
  },
  {
    id: 2,
    date: "23 Oct 2024",
    type: "Egreso",
    description: "Compra de Fertilizantes Nitrofoska",
    client: "Insumos Agrícolas SAC",
    method: "Tarjeta de Crédito",
    amount: "-$620.00",
  },
  {
    id: 3,
    date: "22 Oct 2024",
    type: "Ingreso",
    description: "Suscripción Plan Profesional",
    client: "Club Campestre",
    method: "Débito Automático",
    amount: "+$1,890.00",
  },
  {
    id: 4,
    date: "18 Oct 2024",
    type: "Egreso",
    description: "Repuestos Cortadora Husqvarna",
    client: "Maquinarias El Jardín",
    method: "Efectivo",
    amount: "-$145.00",
  },
  {
    id: 5,
    date: "18 Oct 2024",
    type: "Ingreso",
    description: "Asesoría Técnica Especializada",
    client: "Finca Los Jazmines",
    method: "PayPal",
    amount: "+$350.00",
  },
];

export default function HistoryPage() {
  const [transactions, setTransactions] =
    useState<HistoryTransaction[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState<
    "Todos" | "Ingresos" | "Egresos"
  >("Todos");
  const [dateRange, setDateRange] = useState("30dias");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrado de Datos
  const filteredTransactions = transactions.filter((item) => {
    // Filtro por SegmentedControl
    if (filterType === "Ingresos" && item.type !== "Ingreso") return false;
    if (filterType === "Egresos" && item.type !== "Egreso") return false;

    // Filtro por Búsqueda (Buscador)
    const matchSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.method.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const handleSaveTransaction = (data: HistoryTransaction) => {
    const isIngreso = data.type === "Ingreso";
    const formattedAmount = `${isIngreso ? "+" : "-"}$${parseFloat(data.amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    const newTx: HistoryTransaction = {
      ...data,
      id: Date.now(),
      amount: formattedAmount,
    };

    setTransactions([newTx, ...transactions]);
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Historial de Transacciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitorea y exporta el flujo de caja de tu sistema de jardinería
          </p>
        </div>

        {/* Botón Píldora Agregar */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6C7D38] hover:bg-[#5b6a2f] text-white font-medium text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Barra de Filtros: SegmentedControl + DateRangePicker + Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* 1. SegmentedControl (Todos / Ingresos / Egresos) */}
        <div className="inline-flex p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 self-start">
          <button
            type="button"
            onClick={() => setFilterType("Todos")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === "Todos"
                ? "bg-[#6C7D38] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Ingresos")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === "Ingresos"
                ? "bg-[#6C7D38] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Ingresos
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Egresos")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === "Egresos"
                ? "bg-[#6C7D38] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Egresos
          </button>
        </div>

        {/* 2. Controles de la Derecha: DateRangePicker y Buscador */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* DateRangePicker Component */}
          <div className="relative inline-flex items-center bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm text-xs text-gray-700 dark:text-gray-200">
            <Calendar size={15} className="text-gray-400 mr-2 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-2 font-medium"
            >
              <option value="7dias" className="dark:bg-gray-800">
                Últimos 7 días
              </option>
              <option value="30dias" className="dark:bg-gray-800">
                Últimos 30 días
              </option>
              <option value="mesActual" className="dark:bg-gray-800">
                Este mes
              </option>
              <option value="anoActual" className="dark:bg-gray-800">
                Este año
              </option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabla Estilizada */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Fecha</th>
                <th className="py-4 px-4 sm:px-6">Tipo</th>
                <th className="py-4 px-4 sm:px-6">Descripción</th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Socio / Cliente
                </th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                  Método
                </th>
                <th className="py-4 px-4 sm:px-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    {/* Fecha */}
                    <td className="py-4 px-4 sm:px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {item.date}
                    </td>

                    {/* Tipo Badge */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.type === "Ingreso"
                            ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-gray-800 dark:text-gray-200">
                      <div>
                        {item.description}
                        <p className="text-[11px] font-normal text-gray-400 md:hidden mt-0.5">
                          {item.client} • {item.method}
                        </p>
                      </div>
                    </td>

                    {/* Socio / Cliente */}
                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell text-gray-500 dark:text-gray-400">
                      {item.client || "-"}
                    </td>

                    {/* Método */}
                    <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-gray-500 dark:text-gray-400">
                      {item.method}
                    </td>

                    {/* Monto */}
                    <td
                      className={`py-4 px-4 sm:px-6 text-right font-bold whitespace-nowrap text-sm ${
                        item.type === "Ingreso"
                          ? "text-[#2A3319] dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-400 text-xs"
                  >
                    No se encontraron transacciones que coincidan con la
                    búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[500px]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <Form
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveTransaction}
            />
          </div>
        </div>
      )}
    </div>
  );
}
