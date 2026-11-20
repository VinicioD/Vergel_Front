// src/views/admin/modules/rates/RatesPage.tsx
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Search, Plus, Eye, Edit2, Trash2, X, Loader2 } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table, { type Column } from "../../../../components/Table";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import {
  createCountryConfig,
  deleteCountryConfig,
  getCountryConfigById,
  getCountryConfigs,
  updateCountryConfig,
} from "../../../../services/countryConfigService";
import type {
  CreateCountryConfigPayload,
  UpdateCountryConfigPayload,
} from "../../../../types/countryConfig";
import SearchableSelect from "../../../../components/SearchableSelect";

interface RateRow {
  id: number;
  country: string;
  currency: string;
  taxPercentage: number;
  cardFeePercentage: number;
  createdAt: string;
}

interface RateForm {
  country: string;
  currency: string;
  taxPercentage: string;
  cardFeePercentage: string;
}

const emptyForm = (): RateForm => ({
  country: "",
  currency: "",
  taxPercentage: "",
  cardFeePercentage: "",
});

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    const firstValidationError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;
    return (
      firstValidationError ||
      data?.message ||
      "No se pudo completar la operación."
    );
  }
  return "No se pudo completar la operación.";
};

const formatPercentage = (value: number) =>
  `${Number.isFinite(value) ? value : 0}%`;

const RatesTableSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando tarifas"
    aria-busy="true"
    className="h-full w-full overflow-auto rounded-3xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <table className="w-full min-w-[850px] border-collapse text-left">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-gray-200/40 bg-[#ECE6DB] text-xs font-bold uppercase tracking-wider text-[#3a3d20] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
          <th className="px-6 py-4">País</th>
          <th className="px-6 py-4">Moneda</th>
          <th className="px-6 py-4">IVA / Impuesto</th>
          <th className="px-6 py-4">Comisión tarjeta</th>
          <th className="px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {Array.from({ length: 6 }).map((_, index) => (
          <tr key={index} className="animate-pulse">
            {Array.from({ length: 5 }).map((__, column) => (
              <td key={column} className="px-6 py-5">
                <div
                  className="h-3.5 rounded-md bg-gray-200 dark:bg-gray-700"
                  style={{ width: `${55 + ((column * 17) % 45)}%` }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CURRENCIES = [
  { code: "USD", name: "Dólar estadounidense" },
  { code: "MXN", name: "Peso mexicano" },
  { code: "GTQ", name: "Quetzal guatemalteco" },
  { code: "HNL", name: "Lempira hondureño" },
  { code: "NIO", name: "Córdoba nicaragüense" },
  { code: "CRC", name: "Colón costarricense" },
  { code: "PAB", name: "Balboa panameño" },
  { code: "ARS", name: "Peso argentino" },
  { code: "BRL", name: "Real brasileño" },
  { code: "COP", name: "Peso colombiano" },
  { code: "CLP", name: "Peso chileno" },
  { code: "PEN", name: "Sol peruano" },
  { code: "DOP", name: "Peso dominicano" },
  { code: "CAD", name: "Dólar canadiense" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Libra esterlina" },
  { code: "JPY", name: "Yen japonés" },
  { code: "CNY", name: "Yuan chino" },
  { code: "INR", name: "Rupia india" },
  { code: "CHF", name: "Franco suizo" },
  { code: "AUD", name: "Dólar australiano" },
  { code: "NZD", name: "Dólar neozelandés" },
  { code: "KRW", name: "Won surcoreano" },
  { code: "SAR", name: "Riyal saudí" },
  { code: "AED", name: "Dirham emiratí" },
];

export default function RatesPage() {
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RateRow | null>(null);
  const [formData, setFormData] = useState<RateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailRate, setDetailRate] = useState<RateRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteRate, setDeleteRate] = useState<RateRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getCountryConfigs();
      setRates(
        response.data.map((item) => ({
          id: item.id,
          country: item.country,
          currency: item.currency,
          taxPercentage: item.taxPercentage,
          cardFeePercentage: item.cardFeePercentage ?? 0,
          createdAt: item.createdAt,
        })),
      );
    } catch (error) {
      setRates([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();
  }, [fetchRates, reloadKey]);

  const filteredData = rates.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      !query ||
      item.country.toLowerCase().includes(query) ||
      item.currency.toLowerCase().includes(query)
    );
  });

  const openCreate = () => {
    setEditingRate(null);
    setFormData(emptyForm());
    setFormOpen(true);
  };

  const openEdit = async (rate: RateRow) => {
    setLoadingDetail(true);
    try {
      const response = await getCountryConfigById(rate.id);
      const detail = response.data;
      setEditingRate({
        id: detail.id,
        country: detail.country,
        currency: detail.currency,
        taxPercentage: detail.taxPercentage,
        cardFeePercentage: detail.cardFeePercentage ?? 0,
        createdAt: detail.createdAt,
      });
      setFormData({
        country: detail.country,
        currency: detail.currency,
        taxPercentage: String(detail.taxPercentage),
        cardFeePercentage: String(detail.cardFeePercentage ?? 0),
      });
      setFormOpen(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingDetail(false);
    }
  };

  const openDetails = async (rate: RateRow) => {
    setLoadingDetail(true);
    try {
      const response = await getCountryConfigById(rate.id);
      setDetailRate({
        id: response.data.id,
        country: response.data.country,
        currency: response.data.currency,
        taxPercentage: response.data.taxPercentage,
        cardFeePercentage: response.data.cardFeePercentage ?? 0,
        createdAt: response.data.createdAt,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const country = formData.country.trim();
    const currency = formData.currency.trim().toUpperCase();
    const taxPercentage = Number(formData.taxPercentage);
    const cardFeePercentage = Number(formData.cardFeePercentage || 0);

    if (!currency) {
      setErrorMessage("Selecciona una moneda antes de guardar la tarifa.");
      setSaving(false);
      return;
    }

    try {
      if (editingRate) {
        const payload: UpdateCountryConfigPayload = {
          country,
          currency,
          tax_percentage: taxPercentage,
          card_fee_percentage: cardFeePercentage,
        };
        await updateCountryConfig(editingRate.id, payload);
        setToast({
          type: "success",
          message: "Tarifa actualizada correctamente.",
        });
      } else {
        const payload: CreateCountryConfigPayload = {
          country,
          currency,
          tax_percentage: taxPercentage,
          card_fee_percentage: cardFeePercentage,
        };
        await createCountryConfig(payload);
        setToast({
          type: "success",
          message: "Tarifa registrada correctamente.",
        });
      }
      setFormOpen(false);
      setEditingRate(null);
      setCurrentPage(1);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRate) return;
    setDeleteLoading(true);
    setErrorMessage("");
    try {
      await deleteCountryConfig(deleteRate.id);
      setDeleteRate(null);
      setToast({ type: "success", message: "Tarifa eliminada correctamente." });
      setCurrentPage(1);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<RateRow>[] = [
    {
      header: "PAÍS",
      accessorKey: "country",
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "MONEDA",
      accessorKey: "currency",
      className: "font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap",
    },
    {
      header: "IVA / IMPUESTO",
      render: (item) => formatPercentage(item.taxPercentage),
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "COMISIÓN TARJETA",
      render: (item) => formatPercentage(item.cardFeePercentage),
      className: "font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap",
    },
    {
      header: "ACCIONES",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => void openDetails(item)}
            disabled={loadingDetail}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => void openEdit(item)}
            disabled={loadingDetail}
            className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteRate(item)}
            className="rounded-lg p-1.5 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-[calc(100dvh-5rem)] md:h-[calc(100dvh-3rem)] min-w-0 flex flex-col gap-4 p-3 sm:gap-5 sm:p-4 lg:p-6 font-sans overflow-hidden">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight break-words">
            Gestión de Tarifas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configuración de moneda, impuestos y comisiones por país
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm break-words text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <Input
            icon={Search}
            placeholder="Buscar por país o moneda..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={openCreate}
          className="w-full sm:w-auto justify-center shrink-0"
        >
          Nueva tarifa
        </Button>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-auto rounded-lg">
        {loading ? (
          <RatesTableSkeleton />
        ) : (
          <Table
            data={filteredData}
            columns={columns}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            entityName="tarifas"
            itemsPerPage={10}
          />
        )}
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setFormOpen(false);
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="my-0 max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-gray-100 bg-white p-4 shadow-xl sm:my-4 sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingRate ? "Editar tarifa" : "Nueva tarifa"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configuración tributaria y monetaria del país
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <Input
                  label="País"
                  value={formData.country}
                  onChange={(event) => {
                    const country = event.target.value.replace(
                      /[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ.'()\-\s]/g,
                      "",
                    );
                    setFormData((current) => ({ ...current, country }));
                  }}
                  placeholder="Ej. El Salvador"
                  required
                />
              </div>
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-700 dark:text-gray-300">
                  Moneda
                </label>
                <SearchableSelect
                  value={formData.currency}
                  onChange={(currency) =>
                    setFormData((current) => ({ ...current, currency }))
                  }
                  placeholder="Selecciona una moneda"
                  className="w-full min-w-0"
                  options={CURRENCIES.map((currency) => ({
                    value: currency.code,
                    label: `${currency.code} - ${currency.name}`,
                    description: currency.code,
                  }))}
                />
              </div>
              <div className="min-w-0">
                <Input
                  label="IVA / Impuesto (%)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxPercentage}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      taxPercentage: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="min-w-0">
                <Input
                  label="Comisión tarjeta (%)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cardFeePercentage}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      cardFeePercentage: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Guardando...
                  </>
                ) : (
                  "Guardar tarifa"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {detailRate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailRate(null);
          }}
        >
          <div className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-t-3xl border border-gray-100 bg-white p-4 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Detalle de tarifa
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {detailRate.country}
                </p>
              </div>
              <button
                onClick={() => setDetailRate(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400">Moneda</span>
                <p className="mt-1 font-bold text-gray-800 dark:text-gray-200">
                  {detailRate.currency}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50">
                <span className="text-xs text-gray-400">IVA / Impuesto</span>
                <p className="mt-1 font-bold text-gray-800 dark:text-gray-200">
                  {formatPercentage(detailRate.taxPercentage)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50 sm:col-span-2">
                <span className="text-xs text-gray-400">
                  Comisión por tarjeta
                </span>
                <p className="mt-1 font-bold text-gray-800 dark:text-gray-200">
                  {formatPercentage(detailRate.cardFeePercentage)}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setDetailRate(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteRate !== null}
        title="Eliminar tarifa"
        message={`¿Deseas eliminar la configuración de ${deleteRate?.country ?? "este país"}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleteLoading) setDeleteRate(null);
        }}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isOpen
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
