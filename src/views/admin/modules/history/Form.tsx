// src/views/admin/modules/history/Form.tsx
import React, { useState, useEffect } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export interface HistoryTransaction {
  id?: number;
  date: string;
  type: 'Ingreso' | 'Egreso';
  description: string;
  client: string;
  method: string;
  amount: string;
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: HistoryTransaction) => void;
  initialData?: HistoryTransaction | null;
}

export const Form: React.FC<FormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<HistoryTransaction>({
    date: new Date().toISOString().split('T')[0],
    type: 'Ingreso',
    description: '',
    client: '',
    method: 'Transferencia',
    amount: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-[500px] p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#2A3319] dark:text-gray-100 mt-0 mb-6">
        {initialData ? 'Editar Transacción' : 'Nueva Transacción'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'Ingreso' })}
              className={`py-2 px-4 rounded-xl font-semibold text-xs sm:text-sm border transition-all ${
                formData.type === 'Ingreso'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'Egreso' })}
              className={`py-2 px-4 rounded-xl font-semibold text-xs sm:text-sm border transition-all ${
                formData.type === 'Egreso'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Egreso
            </button>
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción *
          </label>
          <Input
            type="text"
            required
            placeholder="Ej. Pago Cotización COT-2024-001"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Cliente / Socio */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Socio / Cliente
          </label>
          <Input
            type="text"
            placeholder="Ej. Inmobiliaria Bosques"
            value={formData.client}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, client: e.target.value })
            }
          />
        </div>

        {/* Método de Pago y Monto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Método
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C7D38]"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Débito Automático">Débito Automático</option>
              <option value="Efectivo">Efectivo</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha
          </label>
          <Input
            type="date"
            required
            value={formData.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          {onClose && (
            <Button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#CCC', color: '#333' }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            style={{ backgroundColor: '#6C7D38', color: '#FFF' }}
            className="w-full sm:w-auto"
          >
            {initialData ? 'Guardar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;