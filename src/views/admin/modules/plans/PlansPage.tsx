import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  X,
  SearchIcon,
  Search,
} from "lucide-react";
import {
  getSubscriptionPlans,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanStatus,
  getSubscriptionPlanSubscribers,
} from "../../../../services/planService"; // Ajusta tu ruta de importación
import type {
  SubscriptionPlan,
  SubscriptionPlanParams,
  Subscriber,
} from "../../../..//types/plan";
import Form from "./Form";
import Input from "../../../../components/Input";
import SearchableSelect from "../../../../components/SearchableSelect";

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>(""); // '' | 'true' | 'false'
  const [frequencyUnit, setFrequencyUnit] = useState<string>(""); // '' | 'days' | 'weeks' | 'months'
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewPlan, setViewPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState<boolean>(false);

  // Opciones para el SearchableSelect de Estado
  const statusOptions = [
    { label: "Todos los estados", value: "" },
    { label: "Activos", value: "true" },
    { label: "Inactivos", value: "false" },
  ];

  // Opciones para el SearchableSelect de Frecuencia
  const frequencyOptions = [
    { label: "Todas las frecuencias", value: "" },
    { label: "Días (days)", value: "days" },
    { label: "Semanas (weeks)", value: "weeks" },
    { label: "Meses (months)", value: "months" },
  ];

  const fetchPlans = useCallback(async () => {
    try {
      const baseParams: SubscriptionPlanParams = {
        search: search || undefined,
        frequency_unit: frequencyUnit || undefined,
        limit: 100,
      };
      const fetchPlansByStatus = async (active: boolean) => {
        const firstPage = await getSubscriptionPlans({
          ...baseParams,
          active,
          page: 1,
        });
        const allPlans = [...firstPage.data];

        for (let page = 2; page <= firstPage.meta.last_page; page += 1) {
          const response = await getSubscriptionPlans({
            ...baseParams,
            active,
            page,
          });
          allPlans.push(...response.data);
        }

        return allPlans;
      };

      if (activeFilter === "") {
        const [activePlans, inactivePlans] = await Promise.all([
          fetchPlansByStatus(true),
          fetchPlansByStatus(false),
        ]);
        setPlans([...activePlans, ...inactivePlans]);
      } else {
        setPlans(await fetchPlansByStatus(activeFilter === "true"));
      }
    } catch (error) {
      console.error("Error al cargar los planes:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, frequencyUnit, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPlans();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPlans]);

  // Manejar eliminación de plan (con control de errores por si tiene suscriptores)
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este plan?"))
      return;

    try {
      await deleteSubscriptionPlan(id);
      setLoading(true);
      fetchPlans(); // Recargar lista
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "No se pudo eliminar el plan."
        : "No se pudo eliminar el plan.";
      alert(message);
    }
  };

  // Manejar cambio de estado (Activo / Inactivo)
  const handleToggleStatus = async (
    id: number,
    currentActiveState: boolean,
  ) => {
    try {
      await toggleSubscriptionPlanStatus(id, !currentActiveState);
      setLoading(true);
      fetchPlans();
    } catch (error: unknown) {
      console.error("Error al cambiar el estado del plan:", error);
      alert("Error al cambiar el estado del plan.");
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = async (plan: SubscriptionPlan) => {
    setViewPlan(plan);
    setIsViewModalOpen(true);
    setLoadingSubscribers(true);
    setSubscribers([]);
    try {
      const response = await getSubscriptionPlanSubscribers(plan.id, {
        limit: 50,
      });
      setSubscribers(response.data || []);
    } catch (error) {
      console.error("Error al cargar suscriptores:", error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  // Mostrar el formulario como una página independiente
  if (isModalOpen) {
    return (
      <Form
        selectedPlan={selectedPlan}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onSave={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
          setLoading(true);
          fetchPlans();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Planes de Suscripción
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Plan
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <Input
            type="text"
            placeholder="Buscar por código o nombre..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm transition-all"
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
            }}
            icon={SearchIcon}
          />
        </div>

        {/* Filtro por Estado */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <SearchableSelect
            options={statusOptions}
            value={activeFilter}
            onChange={(val) => {
              setLoading(true);
              setActiveFilter(val);
            }}
            placeholder="Filtrar por estado"
          />
        </div>

        {/* Filtro por Frecuencia */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <SearchableSelect
            options={frequencyOptions}
            value={frequencyUnit}
            onChange={(val) => {
              setLoading(true);
              setFrequencyUnit(val);
            }}
            placeholder="Filtrar por frecuencia"
          />
        </div>
      </div>

      {/* Grid de Tarjetas de Planes */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">
          Cargando planes...
        </div>
      ) : plans.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No se encontraron planes registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative flex flex-col overflow-hidden rounded-3xl
        bg-white dark:bg-gray-800
        border transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        ${
          plan.active
            ? "border-[#E4E8D9] dark:border-gray-700 hover:border-[#9AA879] dark:hover:border-[#788858] shadow-[0_8px_30px_rgba(42,51,25,0.06)]"
            : "border-dashed border-gray-300 dark:border-gray-700 opacity-80"
        }`}
            >
              {/* Franja decorativa superior */}
              <div
                className={`h-1.5 w-full ${
                  plan.active
                    ? "bg-gradient-to-r from-[#4D5A27] via-[#899767] to-[#D4DDC2]"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#899767]">
                      Plan de suscripción
                    </p>

                    <h2 className="break-words text-xl font-bold tracking-tight text-[#2A3319] dark:text-white">
                      {plan.planName}
                    </h2>

                    <span className="mt-2 inline-flex max-w-full break-all rounded-lg bg-[#F2F4EB] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#657246] dark:bg-gray-700 dark:text-[#D4DDC2]">
                      {plan.planCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(plan.id, plan.active)}
                    title="Cambiar estado del plan"
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                      plan.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        plan.active ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {plan.active ? "Activo" : "Inactivo"}
                  </button>
                </div>

                {/* Tipo de mantenimiento */}
                <div className="mt-5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F5EF] dark:bg-gray-700">
                    <CheckCircle size={14} className="text-[#687744]" />
                  </span>
                  <span>
                    Mantenimiento:{" "}
                    <strong className="font-semibold text-gray-700 dark:text-gray-200">
                      {plan.maintenanceType || "General"}
                    </strong>
                  </span>
                </div>

                {/* Métricas principales */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#ECEFE5] bg-[#F8F9F5] p-3.5 dark:border-gray-700 dark:bg-gray-900/50">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Visitas por ciclo
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#3D4926] dark:text-white">
                      {plan.visitCount}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      Visitas incluidas
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#ECEFE5] bg-[#F8F9F5] p-3.5 dark:border-gray-700 dark:bg-gray-900/50">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Descuento
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#3D4926] dark:text-white">
                      {plan.discountPercentage}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      Beneficio del plan
                    </p>
                  </div>
                </div>

                {/* Detalles adicionales */}
                <div className="mt-4 space-y-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Frecuencia
                    </span>
                    <span className="text-right font-semibold text-gray-800 dark:text-gray-200">
                      Cada {plan.frequencyValue} {plan.frequencyUnit}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-gray-700" />

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Suscriptores activos
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF1E4] px-2.5 py-1 text-xs font-bold text-[#4D5A27] dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#71834C]" />
                      {plan.activeSubscribersCount}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-auto flex items-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => handleOpenViewModal(plan)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4D5A27] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3D481F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#899767] focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer"
                    title="Ver detalles del plan"
                  >
                    <Eye size={16} />
                    Ver detalles
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(plan)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:border-[#9AA879] hover:bg-[#F2F4EB] hover:text-[#4D5A27] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                    title="Editar plan"
                    aria-label={`Editar ${plan.planName}`}
                  >
                    <Edit2 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
                    title="Eliminar plan"
                    aria-label={`Eliminar ${plan.planName}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Ver Detalles del Plan */}
      {isViewModalOpen && viewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalles del Plan
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {viewPlan.planName} • {viewPlan.planCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Estado
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      viewPlan.active
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {viewPlan.active ? (
                      <CheckCircle size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {viewPlan.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Tipo de Mantenimiento
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {viewPlan.maintenanceType || "General"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Frecuencia
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Cada {viewPlan.frequencyValue} {viewPlan.frequencyUnit}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Visitas por ciclo
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {viewPlan.visitCount} visita(s)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Descuento
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {viewPlan.discountPercentage}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Multiplicador de Puntos
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    x{viewPlan.loyaltyPointsMultiplier}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Suscriptores activos
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {viewPlan.activeSubscribersCount}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Suscriptores del plan
                </h3>
                {loadingSubscribers ? (
                  <div className="py-6 text-center text-gray-400 text-sm">
                    Cargando suscriptores...
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="py-6 text-center text-gray-400 text-sm">
                    No hay suscriptores registrados en este plan.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/40">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Cliente
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Teléfono
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id}>
                            <td className="px-4 py-2.5 text-gray-900 dark:text-white">
                              {subscriber.legalName || subscriber.tradeName}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                              {subscriber.phone}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                              {subscriber.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(viewPlan);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4D5A27] hover:bg-[#3e481f] text-white text-sm transition-colors"
              >
                <Edit2 size={14} />
                Editar Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
