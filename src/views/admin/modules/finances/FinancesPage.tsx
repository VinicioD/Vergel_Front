// src/views/admin/modules/finances/FinancesPage.tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Form, { type FinanceTransactionData } from './Form';

export default function FinancesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTransaction = (data: FinanceTransactionData) => {
    // Aquí puedes conectar el estado o enviar la petición al backend
    console.log('Nueva transacción guardada:', data);
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f5f0] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Panel Financiero
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control de ingresos, egresos y rentabilidad en tiempo real
          </p>
        </div>

        {/* Botón Píldora Nativo */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6C7D38] hover:bg-[#5b6a2f] text-white font-medium text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* Grid de Cards Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Ingresos del Mes */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-400 uppercase">
            Ingresos del Mes
          </span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              $12,850.00
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              +15.2%
            </span>
          </div>
        </div>

        {/* Egresos del Mes */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-400 uppercase">
            Egresos del Mes
          </span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              $4,920.00
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              -2.4%
            </span>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-400 uppercase">
            Ganancia Neta
          </span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              $7,930.00
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              +32.1%
            </span>
          </div>
        </div>

        {/* Cuentas por Cobrar */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-400 uppercase">
            Cuentas por Cobrar
          </span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              $3,450.00
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              $1.2k Vencido
            </span>
          </div>
        </div>

      </div>

      {/* Sección Gráficos e Informes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico Comparativo: Ingresos vs Egresos */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            Ingresos vs Egresos
          </h2>

          <div className="flex flex-col gap-5">
            {/* Mayo */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                <span className="font-bold text-gray-800 dark:text-gray-200">Mayo</span>
                <span>Ingresos: $8.2k | Egresos: $3.1k</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden flex gap-1 p-0.5">
                <div className="bg-[#6C7D38] h-full rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                <div className="bg-[#D88A63] h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Junio */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                <span className="font-bold text-gray-800 dark:text-gray-200">Junio</span>
                <span>Ingresos: $9.5k | Egresos: $4.0k</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden flex gap-1 p-0.5">
                <div className="bg-[#6C7D38] h-full rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                <div className="bg-[#D88A63] h-full rounded-full transition-all duration-500" style={{ width: '30%' }}></div>
              </div>
            </div>

            {/* Julio */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                <span className="font-bold text-gray-800 dark:text-gray-200">Julio</span>
                <span>Ingresos: $11.0k | Egresos: $3.5k</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden flex gap-1 p-0.5">
                <div className="bg-[#6C7D38] h-full rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
                <div className="bg-[#D88A63] h-full rounded-full transition-all duration-500" style={{ width: '26%' }}></div>
              </div>
            </div>

            {/* Agosto */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                <span className="font-bold text-gray-800 dark:text-gray-200">Agosto</span>
                <span>Ingresos: $12.8k | Egresos: $4.9k</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden flex gap-1 p-0.5">
                <div className="bg-[#6C7D38] h-full rounded-full transition-all duration-500" style={{ width: '88%' }}></div>
                <div className="bg-[#D88A63] h-full rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Servicio (Dona CSS Pure) */}
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Distribución por Servicio
          </h2>

          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 my-auto py-2">
            
            {/* Dona Dinámica en SVG */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Fondo Base */}
                <path
                  className="text-gray-100 dark:text-gray-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Mantenimiento (65%) - #6C7D38 */}
                <path
                  stroke="#6C7D38"
                  strokeWidth="4"
                  strokeDasharray="65, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Diseño (20%) - #D88A63 */}
                <path
                  stroke="#D88A63"
                  strokeWidth="4"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-65"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Fumigación (10%) - #E0B880 */}
                <path
                  stroke="#E0B880"
                  strokeWidth="4"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-85"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Consultoría (5%) - #A3B18A */}
                <path
                  stroke="#A3B18A"
                  strokeWidth="4"
                  strokeDasharray="5, 100"
                  strokeDashoffset="-95"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>

            {/* Leyendas */}
            <div className="flex flex-col gap-2 text-xs w-full sm:w-auto">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C7D38] shrink-0"></span>
                <span className="font-medium">Mantenimiento (65%)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D88A63] shrink-0"></span>
                <span className="font-medium">Diseño (20%)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0B880] shrink-0"></span>
                <span className="font-medium">Fumigación (10%)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A3B18A] shrink-0"></span>
                <span className="font-medium">Consultoría (5%)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal para Registrar Movimiento */}
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