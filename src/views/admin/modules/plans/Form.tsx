import React, { useState } from "react";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import { ArrowLeft } from "lucide-react";
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDTO,
} from "../../../../types/plan";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../../../../services/planService";

export interface PlanFormData {
  plan_code: string;
  plan_name: string;
  frequency_value: number | string;
  frequency_unit: string;
  visit_count: number | string;
  maintenance_type: string;
  discount_percentage: number | string;
  loyalty_points_multiplier: number | string;
  active: boolean;
}

interface FormProps {
  onClose?: () => void;
  onSave?: () => void;
  selectedPlan?: SubscriptionPlan | null;
}

const buildInitialData = (plan?: SubscriptionPlan | null): PlanFormData => ({
  plan_code: plan?.planCode || "",
  plan_name: plan?.planName || "",
  frequency_value: plan?.frequencyValue || 30,
  frequency_unit: plan?.frequencyUnit || "days",
  visit_count: plan?.visitCount || 1,
  maintenance_type: plan?.maintenanceType || "",
  discount_percentage: plan?.discountPercentage ?? 0,
  loyalty_points_multiplier: plan?.loyaltyPointsMultiplier ?? 1,
  active: plan?.active ?? true,
});

// Funciones auxiliares para filtrar solo números
const onlyDigits = (value: string) => value.replace(/\D/g, "");
const onlyDecimals = (value: string) => {
  // Permite números y un solo punto decimal
  const sanitized = value.replace(/[^0-9.]/g, "");
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return sanitized;
};

const validatePlan = (data: PlanFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.plan_code.trim())
    errors.plan_code = "El código del plan es obligatorio.";
  if (!data.plan_name.trim())
    errors.plan_name = "El nombre del plan es obligatorio.";

  const frequencyNum = Number(data.frequency_value);
  if (data.frequency_value === "" || isNaN(frequencyNum) || frequencyNum <= 0)
    errors.frequency_value = "El valor de frecuencia debe ser mayor a 0.";

  if (!data.frequency_unit.trim())
    errors.frequency_unit = "Selecciona una unidad de frecuencia.";

  const visitCountNum = Number(data.visit_count);
  if (data.visit_count === "" || isNaN(visitCountNum) || visitCountNum < 1)
    errors.visit_count = "La cantidad de visitas debe ser mayor a 0.";

  if (
    data.discount_percentage !== "" &&
    (Number(data.discount_percentage) < 0 ||
      Number(data.discount_percentage) > 100)
  ) {
    errors.discount_percentage = "El descuento debe estar entre 0 y 100.";
  }

  if (
    data.loyalty_points_multiplier !== "" &&
    Number(data.loyalty_points_multiplier) < 1
  ) {
    errors.loyalty_points_multiplier = "El multiplicador mínimo es 1.";
  }

  return errors;
};

export const Form: React.FC<FormProps> = ({
  onClose,
  onSave,
  selectedPlan,
}) => {
  const [formData, setFormData] = useState<PlanFormData>(() =>
    buildInitialData(selectedPlan),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePlan(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const frequencyVal = parseInt(String(formData.frequency_value), 10) || 1;
      const visitVal = parseInt(String(formData.visit_count), 10) || 1;
      const discountVal =
        formData.discount_percentage !== ""
          ? parseFloat(String(formData.discount_percentage))
          : 0;
      const loyaltyVal =
        formData.loyalty_points_multiplier !== ""
          ? parseFloat(String(formData.loyalty_points_multiplier))
          : 1;

      const payload: CreateSubscriptionPlanDTO = {
        plan_code: formData.plan_code.trim(),
        plan_name: formData.plan_name.trim(),
        frequency_value: frequencyVal,
        frequency_unit: formData.frequency_unit,
        visit_count: visitVal,
        maintenance_type: formData.maintenance_type?.trim()
          ? formData.maintenance_type.trim()
          : undefined,
        discount_percentage: discountVal,
        loyalty_points_multiplier: loyaltyVal,
        active: Boolean(formData.active),
      };

      if (selectedPlan) {
        await updateSubscriptionPlan(selectedPlan.id, payload);
      } else {
        await createSubscriptionPlan(payload);
      }

      if (onSave) onSave();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error al guardar el plan:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const formattedErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          const val = apiErrors[key];
          formattedErrors[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setErrors(formattedErrors);
      } else {
        alert(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Ocurrió un error interno en el servidor al guardar el plan.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Volver al listado"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {selectedPlan
              ? "Editar Plan de Suscripción"
              : "Nuevo Plan de Suscripción"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedPlan
              ? "Actualiza los parámetros y reglas del plan."
              : "Registra un nuevo plan de suscripción en el catálogo."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Código del Plan y Nombre del Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Código del Plan *
              </label>
              <Input
                type="text"
                required
                placeholder="PLAN-BASIC"
                value={formData.plan_code}
                error={errors.plan_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, plan_code: e.target.value });
                  clearError("plan_code");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Plan *
              </label>
              <Input
                type="text"
                required
                placeholder="Mantenimiento Mensual Básico"
                value={formData.plan_name}
                error={errors.plan_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, plan_name: e.target.value });
                  clearError("plan_name");
                }}
              />
            </div>
          </div>

          {/* Frecuencia (Valor y Unidad) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor de Frecuencia *
              </label>
              <Input
                type="text"
                inputMode="numeric"
                required
                placeholder="30"
                value={formData.frequency_value}
                error={errors.frequency_value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = onlyDigits(e.target.value);
                  setFormData({ ...formData, frequency_value: val });
                  clearError("frequency_value");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Unidad de Frecuencia *
              </label>
              <select
                value={formData.frequency_unit}
                onChange={(e) => {
                  setFormData({ ...formData, frequency_unit: e.target.value });
                  clearError("frequency_unit");
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#6C7D38]"
              >
                <option value="days">Días (days)</option>
                <option value="weeks">Semanas (weeks)</option>
                <option value="months">Meses (months)</option>
              </select>
              {errors.frequency_unit && (
                <span className="text-xs text-red-500 mt-0.5">
                  {errors.frequency_unit}
                </span>
              )}
            </div>
          </div>

          {/* Cantidad de Visitas y Tipo de Mantenimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Cantidad de Visitas *
              </label>
              <Input
                type="text"
                inputMode="numeric"
                required
                placeholder="1"
                value={formData.visit_count}
                error={errors.visit_count}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = onlyDigits(e.target.value);
                  setFormData({ ...formData, visit_count: val });
                  clearError("visit_count");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Mantenimiento
              </label>
              <Input
                type="text"
                placeholder="Jardinería"
                value={formData.maintenance_type}
                error={errors.maintenance_type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({
                    ...formData,
                    maintenance_type: e.target.value,
                  });
                  clearError("maintenance_type");
                }}
              />
            </div>
          </div>

          {/* Descuento y Puntos de Lealtad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Porcentaje de Descuento (%)
              </label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="5"
                value={formData.discount_percentage}
                error={errors.discount_percentage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = onlyDecimals(e.target.value);
                  setFormData({ ...formData, discount_percentage: val });
                  clearError("discount_percentage");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Multiplicador Puntos de Lealtad
              </label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="1"
                value={formData.loyalty_points_multiplier}
                error={errors.loyalty_points_multiplier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = onlyDecimals(e.target.value);
                  setFormData({ ...formData, loyalty_points_multiplier: val });
                  clearError("loyalty_points_multiplier");
                }}
              />
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="active-plan"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4 text-[#6C7D38] border-gray-300 rounded focus:ring-[#6C7D38]"
            />
            <label
              htmlFor="active-plan"
              className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Plan Activo disponible para suscripciones
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: "#CCC", color: "#333" }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
              className="w-full sm:w-auto"
            >
              {loading
                ? "Guardando..."
                : selectedPlan
                  ? "Guardar Cambios"
                  : "Crear Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
