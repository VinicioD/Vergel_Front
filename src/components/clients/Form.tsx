// src/components/clients/Form.tsx
import React, { useState, useEffect } from "react";
import Input from "../Input";
import Button from "../Button";
import SearchableSelect, { type SelectOption } from "../SearchableSelect";
import { ArrowLeft } from "lucide-react";
import type { CreateCustomerPayload } from "../../services/customerService";
import { getSubscriptionPlans } from "../../services/subscriptionPlanService";
import type { SubscriptionPlan } from "../../types/customer";
import {
  departamentoOptions,
  MUNICIPIOS_POR_DEPARTAMENTO,
} from "./catalogoUbicacion";

export interface ClientData extends CreateCustomerPayload {
  id?: number;
  status?: "active" | "inactive";
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: ClientData) => void;
  initialData?: ClientData | null;
}

const NIT_REGEX = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
const NRC_REGEX = /^\d{6}-\d{1,2}$/;
const PHONE_REGEX = /^\d{4}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACTIVIDADES_ECONOMICAS = [
  "A: Agricultura, ganadería, silvicultura y pesca",
  "B: Explotación de minas y canteras",
  "C: Industrias manufactureras",
  "D - E: Suministro de electricidad, gas, agua y gestión de desechos",
  "F: Construcción",
  "G: Comercio al por mayor y al por menor; reparación de vehículos",
  "H: Transporte y almacenamiento",
  "I: Alojamiento y servicios de comida (hoteles y restaurantes)",
  "J: Información y comunicaciones",
  "K - N: Actividades financieras, inmobiliarias, profesionales, científicas y administrativas",
  "O - S: Administración pública, enseñanza, salud, arte y otros servicios",
  "Códigos especiales: Personas naturales no contribuyentes (empleados, estudiantes, etc.)",
];

const onlyDigits = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

// NIT: 0000-000000-000-0 (14 dígitos, guiones automáticos)
const formatNit = (value: string) => {
  const d = onlyDigits(value, 14);
  return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 13), d.slice(13, 14)]
    .filter((part) => part.length > 0)
    .join("-");
};

// NRC: 000000-0 o 000000-00 (7 u 8 dígitos, guion después del 6º)
const formatNrc = (value: string) => {
  const d = onlyDigits(value, 8);
  return d.length <= 6 ? d : `${d.slice(0, 6)}-${d.slice(6)}`;
};

// Teléfono: 0000-0000 (8 dígitos)
const formatPhone = (value: string) => {
  const d = onlyDigits(value, 8);
  return d.length <= 4 ? d : `${d.slice(0, 4)}-${d.slice(4)}`;
};

const buildFormData = (data?: ClientData | null): ClientData => ({
  legal_name: data?.legal_name || "",
  trade_name: data?.trade_name || "",
  tax_id:
    data?.tax_id && onlyDigits(data.tax_id, 99).length === 14
      ? formatNit(data.tax_id)
      : data?.tax_id || "",
  nrc:
    data?.nrc && [7, 8].includes(onlyDigits(data.nrc, 99).length)
      ? formatNrc(data.nrc)
      : data?.nrc || "",
  economic_activity: data?.economic_activity || "",
  address: data?.address || "",
  department: data?.department || "",
  municipality: data?.municipality || "",
  phone:
    data?.phone && onlyDigits(data.phone, 99).length === 8
      ? formatPhone(data.phone)
      : data?.phone || "",
  email: data?.email || "",
  current_plan_id: data?.current_plan_id,
  id: data?.id,
  status: data?.status,
});

const validateClient = (data: ClientData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.legal_name.trim())
    errors.legal_name = "El nombre legal es obligatorio.";

  if (!data.phone.trim()) errors.phone = "El teléfono es obligatorio.";
  else if (!PHONE_REGEX.test(data.phone))
    errors.phone = "El teléfono debe tener el formato 0000-0000.";

  if (data.tax_id && !NIT_REGEX.test(data.tax_id))
    errors.tax_id = "El NIT debe tener el formato 0000-000000-000-0.";

  if (data.nrc && !NRC_REGEX.test(data.nrc))
    errors.nrc = "El NRC debe tener el formato 000000-0.";

  if (data.email && !EMAIL_REGEX.test(data.email))
    errors.email = "Ingresa un correo electrónico válido.";

  if (!data.department?.trim())
    errors.department = "El departamento es obligatorio.";

  if (!data.municipality?.trim())
    errors.municipality = "El municipio es obligatorio.";

  if (!data.address.trim()) errors.address = "La dirección es obligatoria.";

  if (!data.current_plan_id)
    errors.current_plan_id = "Selecciona un plan de suscripción.";

  return errors;
};

export const Form: React.FC<FormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<ClientData>(() =>
    buildFormData(initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSubscriptionPlans()
      .then((data) => {
        if (active) setPlans(data);
      })
      .catch((error) => {
        console.error("Error al cargar los planes de suscripción:", error);
      })
      .finally(() => {
        if (active) setPlansLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const planOptions: SelectOption[] = plans.map((plan) => ({
    label: plan.planName || `Plan ${plan.id}`,
    value: String(plan.id),
  }));

  const actividadEconomicaOptions: SelectOption[] =
    ACTIVIDADES_ECONOMICAS.map((actividad) => ({
      label: actividad,
      value: actividad,
    }));
  const actividadActual = formData.economic_activity?.trim();
  if (actividadActual && !ACTIVIDADES_ECONOMICAS.includes(actividadActual)) {
    actividadEconomicaOptions.unshift({
      label: actividadActual,
      value: actividadActual,
      description: "Actividad registrada anteriormente",
    });
  }

  const municipios =
    MUNICIPIOS_POR_DEPARTAMENTO[formData.department || ""] ?? [];
  const municipioOptions: SelectOption[] = municipios.map((municipio) => ({
    label: municipio,
    value: municipio,
  }));
  const municipioActual = formData.municipality?.trim();
  if (municipioActual && !municipios.includes(municipioActual)) {
    municipioOptions.unshift({
      label: municipioActual,
      value: municipioActual,
      description: "Municipio registrado anteriormente",
    });
  }

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateClient(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (onSave) onSave(formData);
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
            {initialData ? "Editar Cliente" : "Agregar Nuevo Cliente"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {initialData
              ? "Actualiza la información del cliente registrado."
              : "Ingresa los datos requeridos para registrar el cliente."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Nombre Legal y Nombre Comercial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Legal / Razón Social *
              </label>
              <Input
                type="text"
                required
                placeholder="Cliente Ejemplo S.A. de C.V."
                value={formData.legal_name}
                error={errors.legal_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, legal_name: e.target.value });
                  clearError("legal_name");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Comercial
              </label>
              <Input
                type="text"
                placeholder="Cliente Ejemplo"
                value={formData.trade_name || ""}
                error={errors.trade_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, trade_name: e.target.value });
                  clearError("trade_name");
                }}
              />
            </div>
          </div>

          {/* NIT y NRC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                NIT / Documento Identificación
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={17}
                placeholder="0614-260290-101-1"
                value={formData.tax_id || ""}
                error={errors.tax_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, tax_id: formatNit(e.target.value) });
                  clearError("tax_id");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                NRC
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="123456-7"
                value={formData.nrc || ""}
                error={errors.nrc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, nrc: formatNrc(e.target.value) });
                  clearError("nrc");
                }}
              />
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono *
              </label>
              <Input
                type="text"
                required
                inputMode="numeric"
                maxLength={9}
                placeholder="7000-0000"
                value={formData.phone}
                error={errors.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, phone: formatPhone(e.target.value) });
                  clearError("phone");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="cliente@example.com"
                value={formData.email || ""}
                error={errors.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearError("email");
                }}
              />
            </div>
          </div>

          {/* Actividad Económica */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Actividad Económica
            </label>
            <SearchableSelect
              options={actividadEconomicaOptions}
              value={formData.economic_activity || ""}
              onChange={(value) => {
                setFormData({ ...formData, economic_activity: value });
              }}
              placeholder="Selecciona una actividad económica"
              className="max-w-none"
            />
          </div>

          {/* Departamento y Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Departamento *
              </label>
              <SearchableSelect
                options={departamentoOptions}
                value={formData.department || ""}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    department: value,
                    municipality: "",
                  });
                  clearError("department");
                  clearError("municipality");
                }}
                placeholder="Selecciona un departamento"
                className="max-w-none"
              />
              {errors.department && (
                <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {errors.department}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Municipio *
              </label>
              <SearchableSelect
                options={municipioOptions}
                value={formData.municipality || ""}
                onChange={(value) => {
                  setFormData({ ...formData, municipality: value });
                  clearError("municipality");
                }}
                placeholder={
                  formData.department
                    ? "Selecciona un municipio"
                    : "Selecciona primero un departamento"
                }
                className="max-w-none"
              />
              {errors.municipality && (
                <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {errors.municipality}
                </span>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Dirección *
            </label>
            <Input
              type="text"
              required
              placeholder="Colonia Centro, San Salvador"
              value={formData.address}
              error={errors.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, address: e.target.value });
                clearError("address");
              }}
            />
          </div>

          {/* Plan de Suscripción */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Plan de Suscripción *
            </label>
            <SearchableSelect
              options={planOptions}
              value={
                formData.current_plan_id
                  ? String(formData.current_plan_id)
                  : ""
              }
              onChange={(value) => {
                setFormData({ ...formData, current_plan_id: Number(value) });
                clearError("current_plan_id");
              }}
              placeholder={
                plansLoading ? "Cargando planes..." : "Selecciona un plan"
              }
            />
            {errors.current_plan_id && (
              <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                {errors.current_plan_id}
              </span>
            )}
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
              style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
              className="w-full sm:w-auto"
            >
              {initialData ? "Guardar Cambios" : "Guardar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
