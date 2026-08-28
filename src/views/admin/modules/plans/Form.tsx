// src/views/admin/modules/plans/Form.tsx
import React, { useState } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export interface PlanChangeData {
  planName: string;
  billingCycle: 'mensual' | 'anual';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: PlanChangeData) => void;
  selectedPlanName?: string;
}

export const Form: React.FC<FormProps> = ({ onClose, onSave, selectedPlanName = 'Plan Profesional' }) => {
  const [formData, setFormData] = useState<PlanChangeData>({
    planName: selectedPlanName,
    billingCycle: 'mensual',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-[500px] p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#2A3319] dark:text-gray-100 mt-0 mb-1">
        Gestionar Suscripción
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Estás seleccionando el <span className="font-semibold text-[#6C7D38] dark:text-emerald-400">{formData.planName}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Frecuencia de pago */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Ciclo de Facturación
          </label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, billingCycle: 'mensual' })}
              className={`py-2 px-4 rounded-xl font-semibold text-xs sm:text-sm border transition-all ${
                formData.billingCycle === 'mensual'
                  ? 'bg-[#6C7D38]/10 border-[#6C7D38] text-[#6C7D38] dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, billingCycle: 'anual' })}
              className={`py-2 px-4 rounded-xl font-semibold text-xs sm:text-sm border transition-all ${
                formData.billingCycle === 'anual'
                  ? 'bg-[#6C7D38]/10 border-[#6C7D38] text-[#6C7D38] dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Anual (20% OFF)
            </button>
          </div>
        </div>

        {/* Datos de tarjeta */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de Tarjeta
          </label>
          <Input
            type="text"
            required
            placeholder="**** **** **** 4242"
            value={formData.cardNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, cardNumber: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Vencimiento
            </label>
            <Input
              type="text"
              required
              placeholder="MM/AA"
              value={formData.cardExpiry}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, cardExpiry: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              CVC / CWW
            </label>
            <Input
              type="password"
              required
              maxLength={4}
              placeholder="123"
              value={formData.cardCvc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, cardCvc: e.target.value })
              }
            />
          </div>
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
            Confirmar Suscripción
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;