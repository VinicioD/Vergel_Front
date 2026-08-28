// src/views/admin/modules/finances/Form.tsx
import React, { useState, useEffect } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export interface FinanceTransactionData {
  id?: number;
  type: 'Ingreso' | 'Egreso';
  concept: string;
  category: string;
  amount: string;
  date: string;
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: FinanceTransactionData) => void;
  initialData?: FinanceTransactionData | null;
}

export const Form: React.FC<FormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<FinanceTransactionData>({
    type: 'Ingreso',
    concept: '',
    category: 'Mantenimiento',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        type: 'Ingreso',
        concept: '',
        category: 'Mantenimiento',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
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
        {initialData ? 'Editar Movimiento' : 'Registrar Movimiento Financiero'}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tipo de Movimiento */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Transacción
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
              + Ingreso
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
              - Egreso
            </button>
          </div>
        </div>

        {/* Concepto / Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Concepto / Descripción *
          </label>
          <Input 
            type="text" 
            required
            placeholder="Ej. Servicio de Mantenimiento Jardín San Isidro"
            value={formData.concept}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, concept: e.target.value})}
          />
        </div>

        {/* Categoría y Monto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C7D38]"
            >
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Diseño">Diseño</option>
              <option value="Fumigación">Fumigación</option>
              <option value="Consultoría">Consultoría</option>
              <option value="Insumos">Insumos/Herramientas</option>
              <option value="Planillas">Planilla / Sueldos</option>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, amount: e.target.value})}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, date: e.target.value})}
          />
        </div>

        {/* Botones de Acción */}
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
            {initialData ? 'Guardar Cambios' : 'Registrar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;