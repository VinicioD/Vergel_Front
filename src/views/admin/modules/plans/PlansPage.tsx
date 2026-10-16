// src/views/admin/modules/plans/PlansPage.tsx
import React, { useState } from "react";
import { Check, X } from "lucide-react";
import Form, { type PlanChangeData } from "./Form";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  subtitle: string;
  features: string[];
  isActive?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Plan Básico",
    price: "$29",
    period: "/ mes",
    subtitle: "Para jardineros independientes",
    features: [
      "Hasta 50 clientes registrados",
      "Agenda de visitas básicas",
      "Cotizaciones limitadas (10/mes)",
      "Soporte por correo electrónico",
      "Acceso desde app móvil",
    ],
  },
  {
    id: "pro",
    name: "Plan Profesional",
    price: "$79",
    period: "/ mes",
    subtitle: "Ideal para empresas consolidadas",
    isActive: true,
    features: [
      "Clientes ilimitados",
      "Control de Agenda y GPS integrado",
      "Cotizaciones ilimitadas",
      "Módulo de Finanzas y Reportes",
      "Catálogo de plantas extendido",
      "Soporte preferente 24/7",
    ],
  },
  {
    id: "enterprise",
    name: "Plan Empresarial",
    price: "$149",
    period: "/ mes",
    subtitle: "Para múltiples colaboradores y viveros",
    features: [
      "Todo lo de Profesional",
      "Hasta 10 colaboradores activos",
      "API para integración de viveros",
      "Gestor de tarifas personalizadas",
      "Capacitación mensual 1-on-1",
      "Backup en la nube dedicado",
    ],
  },
];

export default function PlansPage() {
  const [activePlanId, setActivePlanId] = useState<string>("pro");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] =
    useState<string>("Plan Profesional");

  const handleOpenModal = (planName: string) => {
    setSelectedPlanForModal(planName);
    setIsModalOpen(true);
  };

  const handleSavePlan = (data: PlanChangeData) => {
    const foundPlan = PLANS.find((p) => p.name === data.planName);
    if (foundPlan) {
      setActivePlanId(foundPlan.id);
    }
  };

  const currentPlan = PLANS.find((p) => p.id === activePlanId) || PLANS[1];

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado Principal */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
          Planes de Suscripción
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Selecciona o cambia el plan de software que mejor se adapte a tu
          escala de operaciones
        </p>
      </div>

      {/* Banner Informativo de Suscripción Actual */}
      <div className="bg-[#E2E8D5] dark:bg-emerald-950/40 border border-[#B3C594] dark:border-emerald-800/60 rounded-xl p-3.5 sm:p-4 mb-8 flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Check size={14} strokeWidth={3} />
        </div>
        <p className="text-xs sm:text-sm font-medium text-[#2A3319] dark:text-emerald-200">
          Tu suscripción actual es el{" "}
          <span className="font-bold">{currentPlan.name}</span>. Siguiente
          facturación el 15 de Noviembre de 2024.
        </p>
      </div>

      {/* Grid de Tarjetas de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isCurrentActive = plan.id === activePlanId;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm ${
                isCurrentActive
                  ? "border-2 border-[#6C7D38] dark:border-emerald-500 shadow-md ring-1 ring-[#6C7D38]/20"
                  : "border border-gray-100 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div>
                {/* Cabecera del Card */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                  {isCurrentActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E2E8D5] dark:bg-emerald-900/60 text-[#4A5726] dark:text-emerald-300">
                      Activo
                    </span>
                  )}
                </div>

                {/* Precio */}
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>

                {/* Subtítulo */}
                <p className="text-xs text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-700/60">
                  {plan.subtitle}
                </p>

                {/* Lista de Características */}
                <ul className="py-5 flex flex-col gap-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300"
                    >
                      <Check
                        size={14}
                        className="text-[#6C7D38] dark:text-emerald-400 shrink-0 mt-0.5"
                        strokeWidth={2.5}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Acción */}
              <div className="pt-4">
                {isCurrentActive ? (
                  <button
                    type="button"
                    onClick={() => handleOpenModal(plan.name)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#4D5A27] hover:bg-[#3e481f] text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    Gestionar Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenModal(plan.name)}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#6C7D38] dark:hover:border-emerald-500 text-gray-700 dark:text-gray-200 font-medium text-xs sm:text-sm hover:text-[#6C7D38] dark:hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    Seleccionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
              onSave={handleSavePlan}
              selectedPlanName={selectedPlanForModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
