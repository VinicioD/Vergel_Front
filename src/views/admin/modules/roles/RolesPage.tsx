import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Edit2, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../../../../services/roleService";
import type {
  CreateRolePayload,
  Role,
  UpdateRolePayload,
} from "../../../../types/role";
import RoleForm from "./Form";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | {
        message?: string;
        errors?: Record<string, string | string[]>;
      }
    | undefined;

  if (data?.errors) {
    const messages = Object.values(data.errors).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return data?.message || fallback;
};

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

function RolesTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-3.5 w-32 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-3.5 w-56 rounded-md bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-3.5 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="h-3.5 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="px-4 py-4 sm:px-6">
            <div className="flex justify-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      setIsLoading(true);
      try {
        const response = await getRoles({
          search: debouncedSearch || undefined,
          limit: 100,
        });
        if (isMounted) {
          setRoles(response.data || []);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            getApiErrorMessage(error, "No se pudieron cargar los roles."),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadRoles();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, refreshKey]);

  const openCreateModal = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: CreateRolePayload | UpdateRolePayload) => {
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, payload as UpdateRolePayload);
        setToast({
          type: "success",
          message: "Rol actualizado correctamente.",
        });
      } else {
        await createRole(payload as CreateRolePayload);
        setToast({
          type: "success",
          message: "Rol registrado correctamente.",
        });
      }
      setIsModalOpen(false);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      const message = getApiErrorMessage(error, "No se pudo guardar el rol.");
      setToast({ type: "error", message });
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      setToast({
        type: "success",
        message: "Rol eliminado correctamente.",
      });
      setRoleToDelete(null);
      setRefreshKey((current) => current + 1);
      setErrorMessage("");
    } catch (error) {
      setToast({
        type: "error",
        message: getApiErrorMessage(error, "No se pudo eliminar el rol."),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] w-full flex-col gap-4 overflow-hidden bg-transparent p-4 font-sans transition-colors duration-300 dark:bg-gray-900 sm:gap-5 sm:p-6 md:h-[calc(100dvh-3rem)]">
      {/* Encabezado */}
      <div className="shrink-0 border-b border-gray-200/60 pb-4 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-[#2A3319] dark:text-gray-100 sm:text-3xl">
          Gestión de Roles
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          Administra los perfiles de acceso disponibles para los colaboradores.
        </p>
      </div>

      {/* Buscador y Botón */}
      <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            icon={Search}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre o descripción..."
          />
        </div>
        <Button
          type="button"
          icon={Plus}
          onClick={openCreateModal}
          className="w-full shrink-0 justify-center sm:w-auto"
        >
          Nuevo rol
        </Button>
      </div>

      {errorMessage && (
        <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla con scroll interno */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-100 bg-gray-50/95 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-400">
                <th className="px-4 py-4 sm:px-6">Rol</th>
                <th className="px-4 py-4 sm:px-6">Descripción</th>
                <th className="px-4 py-4 sm:px-6">Colaboradores</th>
                <th className="px-4 py-4 sm:px-6">Fecha creación</th>
                <th className="px-4 py-4 text-center sm:px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs dark:divide-gray-700/60 sm:text-sm">
              {isLoading ? (
                <RolesTableSkeleton rows={6} />
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No se encontraron roles.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/40"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2E8D5] text-[#586A27] dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ShieldCheck size={17} />
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {role.roleName}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-gray-600 dark:text-gray-300 sm:px-6">
                      {role.description || "Sin descripción"}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300 sm:px-6">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Users size={15} className="text-gray-400" />
                        {role.employeesCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap sm:px-6">
                      {formatDate(role.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-center sm:px-6">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Editar rol"
                          onClick={() => openEditModal(role)}
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#586A27] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          title="Eliminar rol"
                          onClick={() => setRoleToDelete(role)}
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <RoleForm
              key={selectedRole?.id ?? "new"}
              initialData={selectedRole}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={roleToDelete !== null}
        title="Eliminar rol"
        message={`¿Deseas eliminar el rol "${roleToDelete?.roleName ?? ""}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setRoleToDelete(null);
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
