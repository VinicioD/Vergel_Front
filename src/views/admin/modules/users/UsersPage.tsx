// src/views/admin/modules/users/UsersPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  FileDown,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  type CreateEmployeePayload,
} from "../../../../services/employeeService";
import type { EmployeeApiRecord } from "../../../../types/employee";
import UserForm from "./Form";

interface User {
  id: string;
  code: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleId: number;
  status: "Activo" | "Inactivo" | "Pendiente";
  joinedDate: string;
}

const ITEMS_PER_PAGE = 5;

const getRoleName = (role: EmployeeApiRecord["role"]): string => {
  if (typeof role === "string") return role;
  return role?.name ?? "Sin rol";
};

const getStatus = (employee: EmployeeApiRecord): User["status"] => {
  const status = String(employee.status ?? "").toLowerCase();
  if (status === "pending" || status === "pendiente") return "Pendiente";
  if (
    employee.active === false ||
    employee.active === 0 ||
    employee.active === "false" ||
    status === "inactive" ||
    status === "inactivo"
  ) {
    return "Inactivo";
  }
  return "Activo";
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "Sin fecha";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const mapEmployee = (employee: EmployeeApiRecord): User => ({
  id: String(employee.id),
  code: employee.code ?? `EMP-${employee.id}`,
  name:
    employee.fullName ??
    employee.full_name ??
    employee.name ??
    employee.user?.name ??
    "Sin nombre",
  email: employee.email ?? employee.user?.email ?? "Sin correo",
  avatar: employee.avatar ?? "",
  role:
    employee.roleName ||
    getRoleName(employee.role),
  roleId: Number(
    employee.roleId ??
    employee.role_id ??
      (employee.role && typeof employee.role === "object"
        ? employee.role.id
        : undefined) ??
      0,
  ),
  status: getStatus(employee),
  joinedDate: formatDate(
    employee.hireDate ??
      employee.hire_date ??
      employee.createdAt ??
      employee.created_at,
  ),
});

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exportScope, setExportScope] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await getEmployees();
        if (isMounted) {
          setUsers(response.data.map(mapEmployee));
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los colaboradores.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadEmployees();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleSave = async (payload: CreateEmployeePayload) => {
    try {
      const requestPayload = payload.password
        ? payload
        : { ...payload, password: undefined };
      if (selectedUser) {
        await updateEmployee(selectedUser.id, requestPayload);
      } else {
        await createEmployee(payload);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      setErrorMessage("");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el colaborador.",
      );
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`¿Eliminar al colaborador "${user.name}"?`)) return;

    try {
      await deleteEmployee(user.id);
      setErrorMessage("");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el colaborador.",
      );
    }
  };

  const handleDownload = (user: User) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <title>Ficha de ${escapeHtml(user.name)}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 32px; color: #1f2937; }
            dl { display: grid; grid-template-columns: 180px 1fr; gap: 12px; }
            dt { font-weight: 700; } dd { margin: 0; }
          </style>
        </head>
        <body>
          <h1>Ficha del colaborador</h1>
          <dl>
            <dt>Código</dt><dd>${escapeHtml(user.code)}</dd>
            <dt>Nombre</dt><dd>${escapeHtml(user.name)}</dd>
            <dt>Correo</dt><dd>${escapeHtml(user.email)}</dd>
            <dt>Rol</dt><dd>${escapeHtml(user.role)}</dd>
            <dt>Estado</dt><dd>${escapeHtml(user.status)}</dd>
            <dt>Fecha de registro</dt><dd>${escapeHtml(user.joinedDate)}</dd>
          </dl>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const roleOptions = useMemo<SelectOption[]>(() => {
    const roles = Array.from(
      new Set(users.map((user) => user.role).filter((role) => role !== "Sin rol")),
    );
    return [
      { label: "Todos los roles", value: "ALL" },
      ...roles.map((role) => ({ label: role, value: role })),
    ];
  }, [users]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = `${user.name} ${user.email}`
          .toLowerCase()
          .includes(search);
        const matchesRole =
          selectedRole === "ALL" || user.role === selectedRole;
        return matchesSearch && matchesRole;
      }),
    [searchTerm, selectedRole, users],
  );

  const handleExport = () => {
    const dataToExport =
      exportScope === "ALL"
        ? users
        : users.filter((user) => user.role === exportScope);

    if (dataToExport.length === 0) {
      alert("No se encontraron colaboradores para exportar.");
      return;
    }

    if (exportFormat === "excel") {
      const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
      const headers = ["Código", "Nombre", "Correo", "Rol", "Estado", "Fecha de registro"];
      const rows = dataToExport.map((user) => [
        escapeCsv(user.code),
        escapeCsv(user.name),
        escapeCsv(user.email),
        escapeCsv(user.role),
        escapeCsv(user.status),
        escapeCsv(user.joinedDate),
      ]);
      const csvContent = "\uFEFF" + [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `Colaboradores_${exportScope}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const escapeHtml = (value: string) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const tableRows = dataToExport
        .map(
          (user) => `
            <tr>
              <td>${escapeHtml(user.code)}</td>
              <td><b>${escapeHtml(user.name)}</b><br><small>${escapeHtml(user.email)}</small></td>
              <td>${escapeHtml(user.role)}</td>
              <td>${escapeHtml(user.status)}</td>
              <td>${escapeHtml(user.joinedDate)}</td>
            </tr>`,
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Reporte de Colaboradores (${escapeHtml(exportScope)})</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
              th, td { padding: 8px; border-bottom: 1px solid #eee; }
              th { background: #f3f4f6; border-bottom: 2px solid #ccc; }
            </style>
          </head>
          <body>
            <h2>Reporte de Colaboradores (${escapeHtml(exportScope.toUpperCase())})</h2>
            <p>Fecha: ${new Date().toLocaleDateString("es-SV")}</p>
            <table>
              <thead><tr><th>Código</th><th>Colaborador</th><th>Rol</th><th>Estado</th><th>Fecha de registro</th></tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setExportOpen(false);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Estilos dinámicos para los badges de estado
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "Activo":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "Inactivo":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
      case "Pendiente":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER DE LA VISTA */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Colaboradores
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra accesos, roles y perfiles de los colaboradores de la plataforma
          </p>
        </div>
      </div>

      {/* FILTROS Y ACCIONES SUPERIORES */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Buscador de colaboradores */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm transition-all"
            />
          </div>

          {/* Filtro por Rol */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <SearchableSelect
              label="Rol"
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => {
                setSelectedRole(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Botones de Exportar y Crear */}
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExportOpen((open) => !open)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
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
              <div className="absolute right-4 mt-2 z-50 w-64 rounded-2xl border border-gray-200/60 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Formato
                </p>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("pdf")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                      exportFormat === "pdf"
                        ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    <FileText size={16} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat("excel")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                      exportFormat === "excel"
                        ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                    }`}
                  >
                    <FileSpreadsheet size={16} /> Excel
                  </button>
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Rol
                </p>
                <div className="mb-4 flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setExportScope(option.value)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium ${
                        exportScope === option.value
                          ? "bg-[#5b642a]/10 text-[#5b642a] dark:bg-[#5b642a]/20 dark:text-[#a3b355]"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5b642a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4a5222]"
                >
                  <Download size={16} /> Descargar
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <UserForm
              onClose={() => setIsModalOpen(false)}
              onSave={handleSave}
              initialData={
                selectedUser
                  ? {
                      fullName: selectedUser.name,
                      email: selectedUser.email === "Sin correo" ? "" : selectedUser.email,
                      roleId: selectedUser.roleId,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* CONTENEDOR DE LA TABLA (CON SCROLL HORIZONTAL EN MÓVIL) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">CÓDIGO</th>
                <th className="py-4 px-6">USUARIO</th>
                <th className="py-4 px-6">ROL</th>
                <th className="py-4 px-6">FECHA REGISTRO</th>
                <th className="py-4 px-6">ESTADO</th>
                <th className="py-4 px-6 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    Cargando colaboradores...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-rose-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No se encontraron colaboradores.
                  </td>
                </tr>
              ) : visibleUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                >
                  {/* CÓDIGO */}
                  <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {user.code}
                  </td>

                  {/* AVATAR + NOMBRE Y CORREO */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2E8D5] text-xs font-bold text-[#586A27] dark:bg-gray-700 dark:text-gray-200">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ROL */}
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {user.role}
                  </td>

                  {/* FECHA REGISTRO */}
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {user.joinedDate}
                  </td>

                  {/* ESTADO BADGE */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                        user.status,
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* BOTONES DE ACCIÓN */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver */}
                      <button
                        title="Ver detalles"
                        type="button"
                        onClick={() => setDetailUser(user)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5b642a] dark:hover:text-[#7c8839] hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Editar */}
                      <button
                        title="Editar colaborador"
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Descargar Ficha */}
                      <button
                        title="Descargar Ficha PDF"
                        type="button"
                        onClick={() => handleDownload(user)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <FileDown size={16} />
                      </button>

                      {/* Eliminar */}
                      <button
                        title="Eliminar colaborador"
                        type="button"
                        onClick={() => void handleDelete(user)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8D5] font-bold text-[#586A27] dark:bg-gray-700 dark:text-gray-200">
                {detailUser.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {detailUser.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {detailUser.email}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Código</dt>
              <dd className="text-right font-semibold text-gray-900 dark:text-gray-100">{detailUser.code}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Rol</dt>
              <dd className="text-right font-semibold text-gray-900 dark:text-gray-100">{detailUser.role}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Estado</dt>
              <dd className="text-right font-semibold text-gray-900 dark:text-gray-100">{detailUser.status}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Fecha de registro</dt>
              <dd className="text-right font-semibold text-gray-900 dark:text-gray-100">{detailUser.joinedDate}</dd>
            </dl>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-2xl bg-[#5b642a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a5222]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Mostrando {visibleUsers.length} de {filteredUsers.length} colaboradores
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            type="button"
            disabled={currentPage === 1 || totalPages === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              currentPage === 1
                ? "bg-[#5b642a] text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            1
          </button>

          {totalPages > 1 && <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, 2))}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              currentPage === 2
                ? "bg-[#5b642a] text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            2
          </button>}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
