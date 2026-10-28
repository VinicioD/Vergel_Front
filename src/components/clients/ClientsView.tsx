import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Loader2,
  Power,
  X,
  UserCheck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Form, { type ClientData } from "./Form";
import SearchableSelect, { type SelectOption } from "../SearchableSelect";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  updateCustomerPlan,
  type CreateCustomerPayload,
} from "../../services/customerService";
import type { CustomerListItem, CustomerDetail } from "../../types/customer";
import type { Client, ClientsViewProps } from "../../types/customer";

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "ALL" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
];

const EXPORT_SCOPE_OPTIONS: SelectOption[] = [
  { label: "Todos", value: "ALL" },
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
];

const buildInitials = (name: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CL";

const formatCurrency = (value?: number) =>
  `$${Number(value ?? 0).toLocaleString("es-SV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getStatusBadge = (status: string) =>
  status === "Activo" || status === "active"
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";

const DETAIL_ITEM_BASE =
  "p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex flex-col gap-1 min-w-0";
const DETAIL_LABEL =
  "text-[11px] font-semibold text-gray-400 uppercase tracking-wide";

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className={DETAIL_ITEM_BASE}>
    <span className={DETAIL_LABEL}>{label}</span>
    <span className="font-semibold text-gray-800 dark:text-gray-200 break-words">
      {value || "—"}
    </span>
  </div>
);

export default function ClientsView({
  searchPlaceholder = "Buscar por cliente, NIT, NRC o teléfono...",
  canCreate = true,
  canEdit = true,
  canDeactivate = true,
  canDelete = true,
}: ClientsViewProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Control de Vistas: "list" o "form"
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  // Modales y Detalles
  const [selectedClientData, setSelectedClientData] =
    useState<ClientData | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [viewDetailModal, setViewDetailModal] = useState<CustomerDetail | null>(
    null,
  );

  // Menú de exportación
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exportScope, setExportScope] = useState("ALL");

  const fetchClients = async (
    searchQuery: string = "",
    statusFilter: string = "ALL",
  ) => {
    setLoading(true);
    try {
      const response = await getCustomers({
        search: searchQuery || undefined,
        status:
          statusFilter !== "ALL"
            ? (statusFilter as "active" | "inactive")
            : undefined,
        limit: 50,
      });

      const mappedClients: Client[] = response.data.map(
        (item: CustomerListItem) => ({
          id: item.id,
          name: item.tradeName || item.legalName,
          legal_name: item.legalName,
          municipality: item.municipality || "San Salvador",
          clientType: item.currentPlanName || "Residencial",
          phone: item.phone || "Sin teléfono",
          email: item.email || "",
          address:
            item.address ||
            (item.nrc ? `NRC: ${item.nrc}` : `NIT/DUI: ${item.taxId || "S/N"}`),
          status: item.status === "active" ? "Activo" : "Inactivo",
          initials: buildInitials(item.tradeName || item.legalName),
        }),
      );

      setClients(mappedClients);
    } catch (error) {
      console.error("Error al cargar clientes desde BDD:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(searchTerm, selectedStatusFilter);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatusFilter]);

  const handleOpenAdd = () => {
    if (!canCreate) return;

    setSelectedClientId(null);
    setSelectedClientData(null);
    setViewMode("form");
  };

  const handleOpenViewDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const detailResponse = await getCustomerById(id);
      setViewDetailModal(detailResponse.data);
    } catch (error) {
      console.error("Error al obtener detalle del cliente:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenEdit = async (clientItem: Client) => {
    if (!canEdit) return;

    setLoadingDetail(true);
    try {
      const detailResponse = await getCustomerById(clientItem.id);
      const detail = detailResponse.data;

      const formDataForEdit: ClientData = {
        id: detail.id,
        legal_name: detail.legalName || "",
        trade_name: detail.tradeName || "",
        tax_id: detail.taxId || "",
        nrc: detail.nrc || "",
        economic_activity: detail.economicActivity || "",
        address: detail.address || "",
        municipality: detail.municipality || "San Salvador",
        department: detail.department || "San Salvador",
        phone: detail.phone || "",
        email: detail.email || "",
        status: detail.status === "active" ? "active" : "inactive",
        current_plan_id: detail.currentPlan?.id,
      };

      setSelectedClientId(detail.id);
      setSelectedClientData(formDataForEdit);
      setViewMode("form");
    } catch (error) {
      console.error("Error al obtener detalle del cliente:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveClient = async (formData: ClientData) => {
    if (
      (selectedClientId && !canEdit) ||
      (!selectedClientId && !canCreate)
    ) {
      return;
    }

    try {
      const cleanPayload: CreateCustomerPayload = {
        legal_name: formData.legal_name.trim(),
        address: formData.address?.trim() || "Colonia Centro, San Salvador",
        municipality: formData.municipality?.trim() || "San Salvador",
        phone: formData.phone.trim(),
      };

      if (formData.trade_name?.trim())
        cleanPayload.trade_name = formData.trade_name.trim();
      if (formData.tax_id?.trim()) cleanPayload.tax_id = formData.tax_id.trim();
      if (formData.nrc?.trim()) cleanPayload.nrc = formData.nrc.trim();
      if (formData.economic_activity?.trim())
        cleanPayload.economic_activity = formData.economic_activity.trim();
      if (formData.department?.trim())
        cleanPayload.department = formData.department.trim();
      if (formData.email?.trim()) cleanPayload.email = formData.email.trim();

      if (selectedClientId) {
        await updateCustomer(selectedClientId, cleanPayload);

        const originalPlanId = selectedClientData?.current_plan_id;
        if (
          formData.current_plan_id &&
          formData.current_plan_id !== originalPlanId
        ) {
          await updateCustomerPlan(selectedClientId, formData.current_plan_id);
        }
      } else {
        if (formData.current_plan_id)
          cleanPayload.current_plan_id = formData.current_plan_id;
        await createCustomer(cleanPayload);
      }

      await fetchClients(searchTerm, selectedStatusFilter);
      setViewMode("list");
    } catch (error) {
      console.error("Error al guardar cliente en BDD:", error);

      if (isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        alert(
          "Error de validación:\n" + JSON.stringify(validationErrors, null, 2),
        );
      }
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === "Activo" ? "inactive" : "active";
    if (!canDeactivate && newStatus === "inactive") return;

    setActionLoading(client.id);
    try {
      await updateCustomerStatus(client.id, newStatus);
      await fetchClients(searchTerm, selectedStatusFilter);
    } catch (error) {
      console.error("Error al cambiar estado del cliente:", error);

      if (isAxiosError(error)) {
        // 👈 Esto nos dirá exactamente qué código HTTP está mandando el backend
        alert(`Código de error del servidor: ${error.response?.status}`);

        if (error.response?.status === 403) {
          alert("No tienes permisos suficientes para realizar esta acción.");
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return;

    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      setActionLoading(id);
      try {
        await deleteCustomer(id);
        await fetchClients(searchTerm, selectedStatusFilter);
      } catch (error) {
        console.error("Error al eliminar cliente en BDD:", error);

        // 👈 AQUÍ TAMBIÉN LO COLOCAS
        if (isAxiosError(error) && error.response?.status === 403) {
          alert("No tienes permisos suficientes para eliminar registros.");
        }
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Descargar la ficha técnica individual de un cliente
  const handleDownloadClient = async (clientItem: Client) => {
    try {
      setActionLoading(clientItem.id);
      const detailResponse = await getCustomerById(clientItem.id);
      const detail = detailResponse.data;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const content = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Ficha de Cliente - ${detail.legalName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 30px; color: #1f2937; }
            .header { border-bottom: 2px solid #5b642a; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: bold; color: #2A3319; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
            .card { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .label { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
            .value { font-size: 14px; font-weight: 600; margin-top: 4px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${detail.legalName}</div>
            <p>Ficha Técnica del Cliente #${detail.id}</p>
          </div>
          <div class="grid">
            <div class="card"><div class="label">Nombre Comercial</div><div class="value">${detail.tradeName || "—"}</div></div>
            <div class="card"><div class="label">Estado</div><div class="value"><span class="badge">${detail.status.toUpperCase()}</span></div></div>
            <div class="card"><div class="label">NIT / DUI</div><div class="value">${detail.taxId || "—"}</div></div>
            <div class="card"><div class="label">NRC</div><div class="value">${detail.nrc || "—"}</div></div>
            <div class="card"><div class="label">Teléfono</div><div class="value">${detail.phone}</div></div>
            <div class="card"><div class="label">Correo</div><div class="value">${detail.email || "—"}</div></div>
            <div class="card" style="grid-column: span 2;"><div class="label">Dirección</div><div class="value">${detail.address}, ${detail.municipality}, ${detail.department}</div></div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
    } catch (error) {
      console.error("Error al descargar ficha del cliente:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Exportar lista masiva (Excel / PDF) según los filtros aplicados
  const handleExport = async () => {
    try {
      const response = await getCustomers({
        status:
          exportScope !== "ALL"
            ? (exportScope as "active" | "inactive")
            : undefined,
        limit: 1000,
      });

      const dataToExport = response.data;

      if (dataToExport.length === 0) {
        alert("No se encontraron registros para exportar.");
        return;
      }

      if (exportFormat === "excel") {
        const headers = [
          "ID",
          "Nombre Legal",
          "Nombre Comercial",
          "NIT",
          "NRC",
          "Teléfono",
          "Correo",
          "Estado",
          "Municipio",
        ];
        const rows = dataToExport.map((c) => [
          c.id,
          `"${c.legalName.replace(/"/g, '""')}"`,
          `"${(c.tradeName || "").replace(/"/g, '""')}"`,
          `"${c.taxId || ""}"`,
          `"${c.nrc || ""}"`,
          `"${c.phone || ""}"`,
          `"${c.email || ""}"`,
          c.status,
          `"${c.municipality || ""}"`,
        ]);

        const csvContent =
          "\uFEFF" +
          [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `Clientes_${exportScope}_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const tableRows = dataToExport
          .map(
            (c) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">#${c.id}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>${c.legalName}</b><br><small>${c.tradeName || ""}</small></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${c.phone}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${c.taxId || "—"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${c.status}</td>
          </tr>`,
          )
          .join("");

        const content = `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <title>Reporte de Clientes (${exportScope})</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
              th { background: #f3f4f6; padding: 8px; border-bottom: 2px solid #ccc; }
            </style>
          </head>
          <body>
            <h2>Reporte de Clientes (${exportScope.toUpperCase()})</h2>
            <p>Fecha: ${new Date().toLocaleDateString("es-SV")}</p>
            <table>
              <thead>
                <tr><th>ID</th><th>Cliente</th><th>Teléfono</th><th>NIT</th><th>Estado</th></tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
          </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
      }

      setExportOpen(false);
    } catch (error) {
      console.error("Error al exportar lista de clientes:", error);
    }
  };

  // VISTA FORMULARIO
  if (viewMode === "form") {
    return (
      <Form
        key={selectedClientId ?? "nuevo"}
        onClose={() => setViewMode("list")}
        onSave={handleSaveClient}
        initialData={selectedClientData}
      />
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-5rem)] md:h-[calc(100dvh-3rem)] flex flex-col gap-6 p-4 sm:p-6 font-sans overflow-hidden">
      {/* FILTROS Y ACCIONES SUPERIORES */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
          Gestion de Clientes
        </h1>
      </div>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Buscador de cliente */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm transition-all"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <SearchableSelect
              label="Estado"
              options={STATUS_OPTIONS}
              value={selectedStatusFilter}
              onChange={(val) => setSelectedStatusFilter(val)}
            />
          </div>
        </div>

        {/* Botones de Exportar y Crear */}
        <div className="flex items-center gap-3">
          {/* Exportar (dropdown con formato y alcance) */}
          <div className="relative flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setExportOpen((open) => !open)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Exportar</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${exportOpen ? "rotate-180" : ""}`}
              />
            </button>

            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 z-50 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl shadow-xl p-4 flex flex-col gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Formato
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setExportFormat("pdf")}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          exportFormat === "pdf"
                            ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                        }`}
                      >
                        <FileText size={16} />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportFormat("excel")}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          exportFormat === "excel"
                            ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                        }`}
                      >
                        <FileSpreadsheet size={16} />
                        <span>Excel</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Estado
                    </p>
                    <div className="flex flex-col gap-1">
                      {EXPORT_SCOPE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setExportScope(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            exportScope === option.value
                              ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Download size={16} />
                    <span>Descargar</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Botón Nuevo Cliente */}
          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Nuevo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA (ÚNICO CON SCROLL) */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">CLIENTE</th>
                <th className="py-4 px-6">CONTACTO</th>
                <th className="py-4 px-6">UBICACIÓN / IDENTIFICACIÓN</th>
                <th className="py-4 px-6">ESTADO</th>
                <th className="py-4 px-6 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        className="animate-spin text-[#5b642a]"
                        size={20}
                      />
                      <span>Cargando clientes desde el servidor...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    {/* CLIENTE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#5b642a]/10 dark:bg-[#5b642a]/20 text-[#5b642a] dark:text-[#a3b355] font-bold text-xs flex items-center justify-center shrink-0 border border-[#5b642a]/20">
                          {client.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                            {client.clientType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CONTACTO */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Mail size={14} className="text-gray-400" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* UBICACIÓN */}
                    <td className="py-4 px-6 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {client.address}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                          client.status,
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* BOTONES DE ACCIÓN */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ver detalle completo */}
                        <button
                          title="Ver detalles"
                          type="button"
                          onClick={() => handleOpenViewDetail(client.id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5b642a] dark:hover:text-[#7c8839] hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Editar */}
                        {canEdit && (
                          <button
                            title="Editar cliente"
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            disabled={
                              loadingDetail || actionLoading === client.id
                            }
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {/* Descargar ficha del registro */}
                        <button
                          title="Descargar ficha"
                          type="button"
                          onClick={() => handleDownloadClient(client)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer"
                        >
                          <FileDown size={16} />
                        </button>

                        {/* Cambiar estado (Activar / Inactivar) */}
                        {(canDeactivate || client.status !== "Activo") && (
                          <button
                            title={
                              client.status === "Activo"
                                ? "Inactivar"
                                : "Activar"
                            }
                            type="button"
                            onClick={() => handleToggleStatus(client)}
                            disabled={actionLoading === client.id}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Power size={16} />
                          </button>
                        )}

                        {/* Eliminar */}
                        {canDelete && (
                          <button
                            title="Eliminar cliente"
                            type="button"
                            onClick={() => handleDelete(client.id)}
                            disabled={actionLoading === client.id}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE COMPLETO DEL CLIENTE */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[90dvh] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors flex flex-col overflow-hidden">
            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-[#5b642a]/10 dark:bg-[#5b642a]/20 text-[#5b642a] dark:text-[#a3b355] rounded-2xl shrink-0">
                  <UserCheck size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                    {viewDetailModal.legalName || "Ficha del Cliente"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID #{viewDetailModal.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewDetailModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <DetailItem
                  label="Nombre Legal / Razón Social"
                  value={viewDetailModal.legalName}
                />
                <DetailItem
                  label="Nombre Comercial"
                  value={viewDetailModal.tradeName}
                />
                <DetailItem
                  label="Estado"
                  value={
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                        viewDetailModal.status,
                      )}`}
                    >
                      {viewDetailModal.status === "active"
                        ? "Activo"
                        : viewDetailModal.status === "inactive"
                          ? "Inactivo"
                          : viewDetailModal.status}
                    </span>
                  }
                />
                <DetailItem label="NIT / DUI" value={viewDetailModal.taxId} />
                <DetailItem label="NRC" value={viewDetailModal.nrc} />
                <DetailItem
                  label="Actividad Económica"
                  value={viewDetailModal.economicActivity}
                />
                <DetailItem label="Teléfono" value={viewDetailModal.phone} />
                <DetailItem label="Correo" value={viewDetailModal.email} />
                <DetailItem
                  label="Plan Actual"
                  value={viewDetailModal.currentPlan?.planName}
                />
                <DetailItem label="Dirección" value={viewDetailModal.address} />
                <DetailItem
                  label="Municipio"
                  value={viewDetailModal.municipality}
                />
                <DetailItem
                  label="Departamento"
                  value={viewDetailModal.department}
                />
                <DetailItem
                  label="Frecuencia de Visita"
                  value={
                    viewDetailModal.visitFrequency
                      ? `${viewDetailModal.visitFrequency.value} ${viewDetailModal.visitFrequency.unit}`
                      : ""
                  }
                />
                <DetailItem
                  label="Saldo Billetera"
                  value={formatCurrency(viewDetailModal.wallet?.cashBalance)}
                />
                <DetailItem
                  label="Suscripción Reservada"
                  value={formatCurrency(
                    viewDetailModal.wallet?.reservedSubscriptionBalance,
                  )}
                />
                <DetailItem
                  label="Puntos de Lealtad"
                  value={String(
                    viewDetailModal.loyaltyPoints?.pointsBalance ?? 0,
                  )}
                />
                <DetailItem
                  label="Código de Plan"
                  value={viewDetailModal.currentPlan?.planCode}
                />
                <DetailItem
                  label="Fecha de Registro"
                  value={formatDate(viewDetailModal.createdAt)}
                />
              </div>
            </div>

            {/* Pie */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewDetailModal(null)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
