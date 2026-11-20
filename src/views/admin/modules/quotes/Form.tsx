import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import SearchableSelect, { type SelectOption } from "../../../../components/SearchableSelect";
import { getCustomers } from "../../../../services/customerService";
import { getSubscriptionPlans } from "../../../../services/subscriptionPlanService";
import { getPlants } from "../../../../services/plantService";
import { createQuote, getQuoteErrorMessage, updateQuote } from "../../../../services/quoteService";
import type { CustomerListItem } from "../../../../types/customer";
import type { SubscriptionPlan } from "../../../../types/customer";
import type { Plant } from "../../../../types/plant";
import type { CreateQuotePayload, CreateQuoteItemPayload, Quote } from "../../../../types/quote";

interface QuoteFormProps {
  onClose: () => void;
  onSaved: () => void;
  initialData?: Quote | null;
}

interface QuoteItemRow {
  itemType: "service" | "plant";
  serviceId: string;
  plantId: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

const onlyDigits = (value: string, maxLength = 10) =>
  value.replace(/[^0-9]/g, "").slice(0, maxLength);

const decimalNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...decimal] = cleaned.split(".");
  return decimal.length ? `${whole}.${decimal.join("").slice(0, 2)}` : whole;
};

const emptyItem = (): QuoteItemRow => ({
  itemType: "plant",
  serviceId: "",
  plantId: "",
  name: "",
  quantity: "1",
  unitPrice: "",
});

export default function QuoteForm({ onClose, onSaved, initialData }: QuoteFormProps) {
  const [customerId, setCustomerId] = useState(() => String(initialData?.customerId ?? ""));
  const [planId, setPlanId] = useState(() => String(initialData?.appliedPlanId ?? ""));
  const [includesVat, setIncludesVat] = useState(() => initialData?.includesVat ?? false);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(() => String(initialData?.loyaltyPointsUsed ?? 0));
  const [status, setStatus] = useState<"pending" | "paid">(() => initialData?.status ?? "pending");
  const [items, setItems] = useState<QuoteItemRow[]>(() => initialData?.items.length
    ? initialData.items.map((item) => ({
        itemType: item.itemType === "plant" ? "plant" : "service",
        serviceId: item.serviceId == null ? "" : String(item.serviceId),
        plantId: item.plantId == null ? "" : String(item.plantId),
        name: item.name ?? "",
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      }))
    : [emptyItem()]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    Promise.all([
      getCustomers({ limit: 100, status: "active" }),
      getSubscriptionPlans(),
      getPlants({ limit: 100, active: true }),
    ])
      .then(([customerResponse, planResponse, plantResponse]) => {
        if (!active) return;
        setCustomers(customerResponse.data);
        setPlans(Array.isArray(planResponse) ? planResponse : []);
        setPlants(plantResponse.data);
      })
      .catch((error) => {
        console.error("Error al cargar datos de la cotización:", error);
        if (active) {
          setErrorMessage("No se pudieron cargar clientes, planes o plantas.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const customerOptions: SelectOption[] = customers.map((customer) => ({
    label: customer.tradeName || customer.legalName,
    value: String(customer.id),
  }));
  if (initialData?.customerId && !customerOptions.some((option) => option.value === String(initialData.customerId))) {
    customerOptions.push({ label: initialData.customerName || `Cliente ${initialData.customerId}`, value: String(initialData.customerId) });
  }

  const planOptions: SelectOption[] = plans.map((plan) => ({
    label: plan.planName || plan.planCode || `Plan ${plan.id}`,
    value: String(plan.id),
  }));
  if (initialData?.appliedPlanId && !planOptions.some((option) => option.value === String(initialData.appliedPlanId))) {
    planOptions.push({ label: initialData.planName || `Plan ${initialData.appliedPlanId}`, value: String(initialData.appliedPlanId) });
  }

  const plantOptions: SelectOption[] = plants.map((plant) => ({
    label: `${plant.name} — $${Number(plant.price).toFixed(2)}`,
    value: String(plant.id),
  }));

  items.forEach((item) => {
    if (item.itemType === "plant" && item.plantId && !plantOptions.some((option) => option.value === item.plantId)) {
      plantOptions.push({
        label: `${item.name || `Planta ${item.plantId}`} — $${Number(item.unitPrice).toFixed(2)}`,
        value: item.plantId,
      });
    }
  });

  const updateItem = (index: number, patch: Partial<QuoteItemRow>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const validate = () => {
    const validation: Record<string, string> = {};
    if (!customerId) validation.customerId = "Selecciona un cliente.";
    if (!planId) validation.planId = "Selecciona un plan de suscripción.";

    items.forEach((item, index) => {
      if (item.itemType === "plant" && !item.plantId) {
        validation[`plant_${index}`] = "Selecciona una planta.";
      }
      if (item.itemType === "service" && !item.serviceId) {
        validation[`service_${index}`] = "No se reconoce el servicio de esta cotización.";
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        validation[`quantity_${index}`] = "La cantidad debe ser mayor a cero.";
      }
      if (!item.unitPrice || Number(item.unitPrice) < 0) {
        validation[`price_${index}`] = "Ingresa un precio válido.";
      }
    });

    setErrors(validation);
    return Object.keys(validation).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setErrorMessage("");

    const payloadItems: CreateQuoteItemPayload[] = items.map((item) => {
      const payload: CreateQuoteItemPayload = {
        item_type: item.itemType,
        quantity: Number(item.quantity),
        unit_price: Number(item.unitPrice),
      };

      if (item.itemType === "plant") {
        payload.plant_id = Number(item.plantId);
      } else {
        payload.service_id = Number(item.serviceId);
      }
      return payload;
    });

    const payload: CreateQuotePayload = {
      customer_id: Number(customerId),
      applied_plan_id: Number(planId),
      includes_vat: includesVat,
      loyalty_points_used: Number(loyaltyPointsUsed || 0),
      status,
      items: payloadItems,
    };

    try {
      if (initialData) {
        await updateQuote(initialData.id, payload);
      } else {
        await createQuote(payload);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        console.error("Respuesta de validación del backend:", (error as { response?: { data?: unknown } }).response?.data);
      }
      setErrorMessage(
        getQuoteErrorMessage(error, initialData ? "No se pudo actualizar la cotización." : "No se pudo registrar la cotización."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Volver al listado"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {initialData ? `Editar Cotización ${initialData.code}` : "Agregar Nueva Cotización"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Puedes actualizar los datos y conservar los servicios existentes. Los nuevos ítems deben ser plantas registradas.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col">
            {errorMessage && (
              <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-gray-500">
                <Loader2 className="mr-2 animate-spin" size={22} /> Cargando datos...
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cliente <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={customerOptions}
                      value={customerId}
                      onChange={setCustomerId}
                      placeholder="Selecciona un cliente"
                      className="max-w-none"
                    />
                    {errors.customerId && <p className="mt-1 text-xs text-rose-500">{errors.customerId}</p>}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Plan aplicado <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={planOptions}
                      value={planId}
                      onChange={setPlanId}
                      placeholder="Selecciona un plan"
                      className="max-w-none"
                    />
                    {errors.planId && <p className="mt-1 text-xs text-rose-500">{errors.planId}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Puntos usados</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      value={loyaltyPointsUsed}
                      onChange={(event) => setLoyaltyPointsUsed(onlyDigits(event.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <SearchableSelect
                      options={[{ label: "Pendiente", value: "pending" }, { label: "Pagada", value: "paid" }]}
                      value={status}
                      onChange={(value) => setStatus(value as "pending" | "paid")}
                      className="max-w-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={includesVat}
                      onChange={(event) => setIncludesVat(event.target.checked)}
                      className="h-4 w-4 accent-[#6C7D38]"
                    />
                    Los precios ya incluyen IVA
                  </label>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Ítems de la cotización</h3>
                    <Button
                      type="button"
                      variant="outline"
                      icon={Plus}
                      onClick={() => setItems((current) => [...current, emptyItem()])}
                      className="px-3 py-2"
                    >
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-[1fr_110px_140px_44px]">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{item.itemType === "plant" ? "Planta *" : "Servicio existente"}</label>
                          {item.itemType === "plant" ? (
                            <SearchableSelect
                              options={plantOptions}
                              value={item.plantId}
                              onChange={(value) => updateItem(index, { plantId: value, name: plants.find((plant) => String(plant.id) === value)?.name ?? item.name, unitPrice: plants.find((plant) => String(plant.id) === value)?.price.toString() || item.unitPrice })}
                              placeholder="Selecciona una planta"
                              className="max-w-none"
                            />
                          ) : (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                              {item.name || `Servicio #${item.serviceId}`}
                            </div>
                          )}
                          {errors[`plant_${index}`] && <p className="mt-1 text-xs text-rose-500">{errors[`plant_${index}`]}</p>}
                          {errors[`service_${index}`] && <p className="mt-1 text-xs text-rose-500">{errors[`service_${index}`]}</p>}
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Cantidad *</label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            maxLength={10}
                            value={item.quantity}
                            onChange={(event) => updateItem(index, { quantity: decimalNumber(event.target.value) })}
                            error={errors[`quantity_${index}`]}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Precio unitario *</label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            maxLength={12}
                            value={item.unitPrice}
                            onChange={(event) => updateItem(index, { unitPrice: decimalNumber(event.target.value) })}
                            placeholder="0.00"
                            error={errors[`price_${index}`]}
                          />
                        </div>

                        <button
                          type="button"
                          aria-label="Eliminar ítem"
                          disabled={items.length === 1}
                          onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{ backgroundColor: "#CCC", color: "#333" }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || saving}
              style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
              className="w-full sm:w-auto"
            >
              {saving ? "Guardando..." : initialData ? "Guardar Cambios" : "Guardar Cotización"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
