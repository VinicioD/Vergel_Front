import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  Building2,
  Pencil,
  Plus,
  Power,
  Trash2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  Store,
  X,
} from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import SearchableSelect from "../../../../components/SearchableSelect";
import type { SelectOption } from "../../../../components/SearchableSelect";
import Table from "../../../../components/Table";
import type { Column } from "../../../../components/Table";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
  updateSupplierStatus,
} from "../../../../services/supplierService";
import type {
  SupplierPayload,
  SupplierQueryParams,
  SupplierRecord,
  SupplierStatus,
} from "../../../../types/supplier";

interface SupplierRow {
  id: number | string;
  name: string;
  tradeName: string;
  contact: string;
  contactPhone: string;
  phone: string;
  email: string;
  taxId: string;
  nrc: string;
  economicActivity: string;
  address: string;
  status: string;
  createdAt: string;
  notes: string;
}

const PAGE_SIZE = 15;
const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#5b642a] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
const ECONOMIC_ACTIVITIES = [
  "Agricultura, ganadería, silvicultura y pesca",
  "Explotación de minas y canteras",
  "Industrias manufactureras",
  "Suministro de electricidad, gas, vapor y aire acondicionado",
  "Suministro de agua, alcantarillado y gestión de residuos",
  "Construcción",
  "Comercio al por mayor y al por menor; reparación de vehículos",
  "Transporte y almacenamiento",
  "Alojamiento y servicios de comida",
  "Información y comunicaciones",
  "Actividades financieras y de seguros",
  "Actividades inmobiliarias",
  "Actividades profesionales, científicas y técnicas",
  "Actividades de servicios administrativos y de apoyo",
  "Administración pública y defensa; planes de seguridad social",
  "Enseñanza",
  "Actividades de atención de la salud humana y asistencia social",
  "Actividades artísticas, de entretenimiento y recreativas",
  "Otras actividades de servicios",
  "Actividades de los hogares como empleadores",
  "Actividades de organizaciones y órganos extraterritoriales",
];
const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
];
const SORT_FILTER_OPTIONS: SelectOption[] = [
  { label: "Ordenar: ID", value: "id" },
  { label: "Ordenar: nombre", value: "name" },
  { label: "Ordenar: nombre comercial", value: "trade_name" },
  { label: "Ordenar: estado", value: "status" },
  { label: "Ordenar: fecha de registro", value: "created_at" },
];
const DETAIL_ITEM_CLASS =
  "flex min-w-0 flex-col gap-1 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50";

const field = (...values: (string | null | undefined)[]) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() ||
  "";

const formatDigitsWithHyphens = (value: string, groups: number[]) => {
  const maxDigits = groups.reduce((total, size) => total + size, 0);
  let digits = value.replace(/\D/g, "").slice(0, maxDigits);
  let formatted = "";

  for (const size of groups) {
    if (!digits) break;
    const group = digits.slice(0, size);
    digits = digits.slice(size);
    formatted += `${formatted ? "-" : ""}${group}`;
  }

  return formatted;
};

const formatTaxId = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return formatDigitsWithHyphens(
    digits,
    digits.length > 9 ? [4, 6, 3, 1] : [8, 1],
  );
};

const formatNrc = (value: string) => formatDigitsWithHyphens(value, [6, 2]);
const formatPhone = (value: string) => formatDigitsWithHyphens(value, [4, 4]);

const mapSupplier = (supplier: SupplierRecord): SupplierRow => ({
  id: supplier.id,
  name:
    field(
      supplier.name,
      supplier.legal_name,
      supplier.legalName,
      supplier.trade_name,
      supplier.tradeName,
    ) || "Proveedor sin nombre",
  tradeName: field(supplier.trade_name, supplier.tradeName),
  contact: field(
    supplier.contact_name,
    supplier.contactName,
    supplier.contact_person,
    supplier.contactPerson,
  ),
  contactPhone: field(supplier.contact_phone, supplier.contactPhone),
  phone: field(supplier.phone),
  email: field(supplier.email),
  taxId: field(supplier.tax_id, supplier.taxId),
  nrc: field(supplier.nrc),
  economicActivity: field(
    supplier.economic_activity,
    supplier.economicActivity,
  ),
  address: field(supplier.address),
  status: field(supplier.status) || "unknown",
  createdAt: field(supplier.created_at, supplier.createdAt),
  notes: field(supplier.notes),
});

const emptySupplierForm = (): SupplierPayload => ({
  name: "",
  trade_name: "",
  tax_id: "",
  nrc: "",
  economic_activity: "",
  phone: "",
  email: "",
  address: "",
  contact_name: "",
  contact_phone: "",
  status: "active",
  notes: "",
});

const formatDate = (date: string) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const statusLabel = (status: string) => {
  if (status.toLowerCase() === "active") return "Activo";
  if (status.toLowerCase() === "inactive") return "Inactivo";
  return status;
};

const statusClass = (status: string) =>
  status.toLowerCase() === "active"
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : status.toLowerCase() === "inactive"
      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || "No se pudo completar la consulta de proveedores.";
  }
  return "No se pudo completar la operación de proveedores.";
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className={DETAIL_ITEM_CLASS}>
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="break-words font-semibold text-gray-800 dark:text-gray-200">
      {value || "—"}
    </span>
  </div>
);

const SupplierTableSkeleton = () => (
  <div
    role="status"
    aria-label="Cargando proveedores"
    aria-busy="true"
    className="w-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200/40 bg-[#ECE6DB] text-xs font-bold uppercase tracking-wider text-[#3a3d20] dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
            <th className="px-6 py-4">Proveedor</th>
            <th className="px-6 py-4">Contacto</th>
            <th className="px-6 py-4">Actividad económica</th>
            <th className="px-6 py-4">Identificación</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-32 rounded-md bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-20 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-3 w-40 rounded-md bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 rounded-md bg-gray-100 dark:bg-gray-700/60" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              </td>
              <td className="px-6 py-4">
                <div className="mx-auto flex w-36 justify-center gap-2">
                  {Array.from({ length: 4 }).map((__, actionIndex) => (
                    <div
                      key={actionIndex}
                      className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700"
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <span className="sr-only">Cargando proveedores...</span>
  </div>
);

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [economicActivity, setEconomicActivity] = useState("");
  const [sortBy, setSortBy] = useState<SupplierQueryParams["sort_by"]>("id");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<SupplierPayload>(emptySupplierForm);
  const [saving, setSaving] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loadSuppliers = async () => {
        setLoading(true);
        setErrorMessage("");
        const trimmedSearch = search.trim();
        const params: SupplierQueryParams = {
          search: trimmedSearch || undefined,
          status: status ? (status as "active" | "inactive") : undefined,
          economic_activity: economicActivity.trim() || undefined,
          phone: trimmedSearch || undefined,
          sort_by: sortBy,
          sort_direction: "desc",
          limit: PAGE_SIZE,
          page,
        };

        try {
          const response = await getSuppliers(params);
          setSuppliers(response.data.map(mapSupplier));
          setTotal(response.meta?.total ?? response.data.length);
          setLastPage(response.meta?.last_page ?? 1);
          if (
            response.meta?.current_page &&
            response.meta.current_page !== page
          ) {
            setPage(response.meta.current_page);
          }
        } catch (error) {
          setSuppliers([]);
          setTotal(0);
          setLastPage(1);
          setErrorMessage(getErrorMessage(error));
        } finally {
          setLoading(false);
        }
      };

      void loadSuppliers();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, status, economicActivity, sortBy, page, reloadKey]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setEconomicActivity("");
    setSortBy("id");
    setPage(1);
  };

  const openDetails = async (supplier: SupplierRow) => {
    setLoadingDetail(true);
    try {
      const response = await getSupplierById(supplier.id);
      setSelectedSupplier(mapSupplier(response.data));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingDetail(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptySupplierForm());
    setFormOpen(true);
  };

  const openEditForm = async (supplier: SupplierRow) => {
    setLoadingDetail(true);
    try {
      const response = await getSupplierById(supplier.id);
      const detail = mapSupplier(response.data);
      setEditingId(detail.id);
      setFormData({
        name: detail.name === "Proveedor sin nombre" ? "" : detail.name,
        trade_name: detail.tradeName,
        tax_id: detail.taxId,
        nrc: detail.nrc,
        economic_activity: detail.economicActivity,
        phone: detail.phone,
        email: detail.email,
        address: detail.address,
        contact_name: detail.contact,
        contact_phone: detail.contactPhone,
        status: detail.status === "inactive" ? "inactive" : "active",
        notes: detail.notes,
      });
      setSelectedSupplier(null);
      setFormOpen(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshSuppliers = () => setReloadKey((key) => key + 1);

  const handleSaveSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    try {
      if (editingId === null) {
        await createSupplier(formData);
        setToast({
          type: "success",
          message: "Proveedor registrado correctamente.",
        });
      } else {
        await updateSupplier(editingId, formData);
        setToast({
          type: "success",
          message: "Proveedor actualizado correctamente.",
        });
      }
      setFormOpen(false);
      setPage(1);
      refreshSuppliers();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    setDeleteLoading(true);
    try {
      await deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
      setToast({
        type: "success",
        message: "Proveedor eliminado correctamente.",
      });
      if (suppliers.length === 1 && page > 1)
        setPage((currentPage) => currentPage - 1);
      else refreshSuppliers();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (supplier: SupplierRow) => {
    const nextStatus: SupplierStatus =
      supplier.status === "active" ? "inactive" : "active";
    try {
      await updateSupplierStatus(supplier.id, nextStatus);
      setToast({
        type: "success",
        message: `Proveedor ${nextStatus === "active" ? "activado" : "desactivado"} correctamente.`,
      });
      refreshSuppliers();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const updateFormField = (fieldName: keyof SupplierPayload, value: string) => {
    setFormData((current) => ({ ...current, [fieldName]: value }));
  };

  const columns: Column<SupplierRow>[] = [
    {
      header: "Proveedor",
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5b642a]/20 bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]">
            <Store size={17} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {supplier.name}
            </p>
            <p className="text-xs text-gray-400">
              {supplier.tradeName || `ID #${supplier.id}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Contacto",
      render: (supplier) => (
        <div className="flex min-w-[150px] flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
          {supplier.contact && <span>{supplier.contact}</span>}
          <span className="flex items-center gap-1.5">
            <Phone size={13} />
            {supplier.phone || "Sin teléfono"}
          </span>
          {supplier.email && (
            <span className="flex items-center gap-1.5 text-gray-400">
              <Mail size={13} />
              {supplier.email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actividad económica",
      render: (supplier) => <span>{supplier.economicActivity || "—"}</span>,
    },
    {
      header: "Identificación",
      render: (supplier) => (
        <div className="text-xs text-gray-600 dark:text-gray-300">
          <p>NIT/DUI: {supplier.taxId || "—"}</p>
          <p className="mt-1 text-gray-400">NRC: {supplier.nrc || "—"}</p>
        </div>
      ),
    },
    {
      header: "Estado",
      render: (supplier) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass(supplier.status)}`}
        >
          {statusLabel(supplier.status)}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-center",
      render: (supplier) => (
        <div className="flex min-w-[144px] justify-center gap-1">
          <button
            type="button"
            title="Ver detalles"
            aria-label={`Ver detalles de ${supplier.name}`}
            onClick={() => void openDetails(supplier)}
            disabled={loadingDetail}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#5b642a] disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-[#a3b355]"
          >
            <Eye size={17} />
          </button>
          <button
            type="button"
            title="Editar proveedor"
            aria-label={`Editar ${supplier.name}`}
            onClick={() => void openEditForm(supplier)}
            disabled={loadingDetail}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            title={
              supplier.status === "active"
                ? "Desactivar proveedor"
                : "Activar proveedor"
            }
            aria-label={`${supplier.status === "active" ? "Desactivar" : "Activar"} ${supplier.name}`}
            onClick={() => void handleToggleStatus(supplier)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400"
          >
            <Power size={16} />
          </button>
          <button
            type="button"
            title="Eliminar proveedor"
            aria-label={`Eliminar ${supplier.name}`}
            onClick={() => setDeletingSupplier(supplier)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const changePage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, lastPage)));
  };

  const economicActivityOptions: SelectOption[] = ECONOMIC_ACTIVITIES.map(
    (actividad) => ({ label: actividad, value: actividad }),
  );
  const actividadActual = formData.economic_activity?.trim();
  if (actividadActual && !ECONOMIC_ACTIVITIES.includes(actividadActual)) {
    economicActivityOptions.unshift({
      label: actividadActual,
      value: actividadActual,
      description: "Actividad registrada anteriormente",
    });
  }

  const economicActivityFilterOptions: SelectOption[] = [
    { label: "Todas las actividades", value: "" },
    ...ECONOMIC_ACTIVITIES.map((actividad) => ({
      label: actividad,
      value: actividad,
    })),
  ];

  if (formOpen) {
    return (
      <>
        <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Volver al listado"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
                {editingId === null
                  ? "Agregar Nuevo Proveedor"
                  : "Editar Proveedor"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {editingId === null
                  ? "Ingresa los datos requeridos para registrar el proveedor."
                  : "Actualiza la información del proveedor registrado."}
              </p>
            </div>
          </div>

          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
            <form
              onSubmit={handleSaveSupplier}
              noValidate
              className="flex flex-col gap-5"
            >
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <span>{errorMessage}</span>
                  <button
                    type="button"
                    aria-label="Cerrar mensaje"
                    onClick={() => setErrorMessage("")}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Razón Social / Nombre *
                  </label>
                  <Input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="Nombre legal del proveedor"
                    value={formData.name}
                    onChange={(event) =>
                      updateFormField("name", event.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre Comercial
                  </label>
                  <Input
                    type="text"
                    maxLength={150}
                    placeholder="Nombre comercial del proveedor"
                    value={formData.trade_name ?? ""}
                    onChange={(event) =>
                      updateFormField("trade_name", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    NIT / DUI
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={17}
                    placeholder="0614-260290-101-1"
                    value={formData.tax_id ?? ""}
                    onChange={(event) =>
                      updateFormField("tax_id", formatTaxId(event.target.value))
                    }
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
                    value={formData.nrc ?? ""}
                    onChange={(event) =>
                      updateFormField("nrc", formatNrc(event.target.value))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono Principal *
                  </label>
                  <Input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="7000-0000"
                    value={formData.phone}
                    onChange={(event) =>
                      updateFormField("phone", formatPhone(event.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="proveedor@example.com"
                    value={formData.email ?? ""}
                    onChange={(event) =>
                      updateFormField("email", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre del Contacto
                  </label>
                  <Input
                    type="text"
                    maxLength={150}
                    placeholder="Persona de contacto"
                    value={formData.contact_name ?? ""}
                    onChange={(event) =>
                      updateFormField("contact_name", event.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono del Contacto
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="7000-0000"
                    value={formData.contact_phone ?? ""}
                    onChange={(event) =>
                      updateFormField(
                        "contact_phone",
                        formatPhone(event.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actividad Económica
                </label>
                <SearchableSelect
                  options={economicActivityOptions}
                  value={formData.economic_activity ?? ""}
                  onChange={(value) =>
                    updateFormField("economic_activity", value)
                  }
                  placeholder="Selecciona una actividad económica"
                  className="max-w-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <Input
                  type="text"
                  maxLength={255}
                  placeholder="Colonia Centro, San Salvador"
                  value={formData.address ?? ""}
                  onChange={(event) =>
                    updateFormField("address", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <SearchableSelect
                  options={[
                    { label: "Activo", value: "active" },
                    { label: "Inactivo", value: "inactive" },
                  ]}
                  value={formData.status ?? "active"}
                  onChange={(value) =>
                    updateFormField("status", value as SupplierStatus)
                  }
                  className="max-w-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas
                </label>
                <textarea
                  className={`${INPUT_CLASS} min-h-24 resize-y`}
                  value={formData.notes ?? ""}
                  onChange={(event) =>
                    updateFormField("notes", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => setFormOpen(false)}
                  style={{ backgroundColor: "#CCC", color: "#333" }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
                  className="w-full sm:w-auto"
                >
                  {saving
                    ? "Guardando..."
                    : editingId === null
                      ? "Guardar Proveedor"
                      : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <Toast
          type={toast?.type ?? "info"}
          message={toast?.message ?? ""}
          isOpen={toast !== null}
          onClose={() => setToast(null)}
        />
      </>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col gap-5 overflow-hidden p-4 font-sans sm:p-6 md:h-[calc(100dvh-3rem)]">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3319] dark:text-gray-100 sm:text-3xl">
            Gestión de Proveedores
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consulta y filtra los proveedores registrados en El Vergel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5b642a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4b5422] focus:outline-none focus:ring-2 focus:ring-[#5b642a]/40"
        >
          <Plus size={18} /> Nuevo proveedor
        </button>
      </header>

      <section className="shrink-0 bg-transparent">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar proveedor</span>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className={`${INPUT_CLASS} pl-10`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, teléfono, actividad, correo, NIT, NRC o contacto..."
            />
          </label>

          <div className="w-full sm:w-56 shrink-0">
            <SearchableSelect
              label="Actividad económica"
              options={economicActivityFilterOptions}
              value={economicActivity}
              onChange={(value) => {
                setEconomicActivity(value);
                setPage(1);
              }}
              placeholder="Actividad económica"
              className="max-w-none"
            />
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SearchableSelect
              label="Estado"
              options={STATUS_FILTER_OPTIONS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              className="max-w-none"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <SearchableSelect
              label="Ordenar por"
              options={SORT_FILTER_OPTIONS}
              value={sortBy ?? "id"}
              onChange={(value) => {
                setSortBy(value as SupplierQueryParams["sort_by"]);
                setPage(1);
              }}
              className="max-w-none"
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Limpiar
          </button>
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setErrorMessage("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <SupplierTableSkeleton />
        ) : (
          <Table
            data={suppliers}
            columns={columns}
            currentPage={page}
            onPageChange={changePage}
            itemsPerPage={PAGE_SIZE}
            totalItems={total}
            entityName="proveedores"
          />
        )}
      </section>

      {selectedSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSupplier(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-detail-title"
            className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            <header className="flex items-center justify-between gap-3 border-b border-gray-100 p-5 dark:border-gray-700 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-2xl bg-[#5b642a]/10 p-2.5 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]">
                  <Building2 size={22} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="supplier-detail-title"
                    className="truncate text-lg font-bold text-gray-900 dark:text-gray-100"
                  >
                    {selectedSupplier.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Proveedor #{selectedSupplier.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setSelectedSupplier(null)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </header>
            <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
              <DetailItem
                label="Nombre / razón social"
                value={selectedSupplier.name}
              />
              <DetailItem
                label="Nombre comercial"
                value={selectedSupplier.tradeName}
              />
              <DetailItem
                label="Estado"
                value={statusLabel(selectedSupplier.status)}
              />
              <DetailItem
                label="Actividad económica"
                value={selectedSupplier.economicActivity}
              />
              <DetailItem
                label="Persona de contacto"
                value={selectedSupplier.contact}
              />
              <DetailItem
                label="Teléfono del contacto"
                value={selectedSupplier.contactPhone}
              />
              <DetailItem label="Teléfono" value={selectedSupplier.phone} />
              <DetailItem
                label="Correo electrónico"
                value={selectedSupplier.email}
              />
              <DetailItem label="NIT / DUI" value={selectedSupplier.taxId} />
              <DetailItem label="NRC" value={selectedSupplier.nrc} />
              <DetailItem
                label="Fecha de registro"
                value={formatDate(selectedSupplier.createdAt)}
              />
              <div className={`${DETAIL_ITEM_CLASS} sm:col-span-2`}>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Dirección
                </span>
                <span className="flex items-center gap-2 break-words font-semibold text-gray-800 dark:text-gray-200">
                  <MapPin size={15} className="shrink-0 text-gray-400" />
                  {selectedSupplier.address || "—"}
                </span>
              </div>
              <div className={`${DETAIL_ITEM_CLASS} sm:col-span-2`}>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Notas
                </span>
                <span className="whitespace-pre-wrap break-words font-semibold text-gray-800 dark:text-gray-200">
                  {selectedSupplier.notes || "—"}
                </span>
              </div>
            </div>
            <footer className="border-t border-gray-100 p-4 dark:border-gray-700 sm:p-5">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSupplier(null)}
                  className="rounded-2xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => void openEditForm(selectedSupplier)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5b642a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4b5422]"
                >
                  <Pencil size={16} />
                  Editar proveedor
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={deletingSupplier !== null}
        title="Eliminar proveedor"
        message={`¿Seguro que deseas eliminar a ${deletingSupplier?.name ?? "este proveedor"}? Esta acción realiza un borrado lógico.`}
        confirmText="Eliminar proveedor"
        loading={deleteLoading}
        onConfirm={() => void handleDeleteSupplier()}
        onCancel={() => setDeletingSupplier(null)}
      />
      <Toast
        type={toast?.type ?? "info"}
        message={toast?.message ?? ""}
        isOpen={toast !== null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
