import { useEffect, useState } from "react";
import { Edit2, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import Button from "../../../../components/Button";
import { createRole, deleteRole, getRoles, updateRole } from "../../../../services/roleService";
import type { Role, RolePayload } from "../../../../types/role";
import RoleForm from "./Form";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo completar la operación.";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRoles = async () => {
      setIsLoading(true);
      try {
        const response = await getRoles();
        if (isMounted) {
          setRoles(response);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadRoles();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredRoles = roles.filter((role) =>
    `${role.name} ${role.description ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const openCreateModal = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: RolePayload) => {
    if (selectedRole) await updateRole(selectedRole.id, payload);
    else await createRole(payload);
    setIsModalOpen(false);
    setRefreshKey((current) => current + 1);
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    try {
      await deleteRole(role.id);
      setRefreshKey((current) => current + 1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent p-4 transition-colors duration-300 dark:bg-gray-900 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3319] dark:text-gray-100 sm:text-3xl">
            Gestión de Roles
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Administra los perfiles de acceso disponibles para los usuarios.
          </p>
        </div>
        <Button type="button" icon={Plus} onClick={openCreateModal}>
          Nuevo rol
        </Button>
      </div>

      <div className="mb-6 max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-gray-400" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-xs text-gray-900 outline-none focus:border-[#5b642a] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:text-sm"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setRefreshKey((current) => current + 1)} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                <th className="px-4 py-4 sm:px-6">Rol</th>
                <th className="px-4 py-4 sm:px-6">Descripción</th>
                <th className="px-4 py-4 sm:px-6">Usuarios</th>
                <th className="px-4 py-4 sm:px-6">Estado</th>
                <th className="px-4 py-4 text-center sm:px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs dark:divide-gray-700/60 sm:text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Cargando roles...</td></tr>
              ) : filteredRoles.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No se encontraron roles.</td></tr>
              ) : filteredRoles.map((role) => (
                <tr key={role.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/40">
                  <td className="px-4 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2E8D5] text-[#586A27] dark:bg-emerald-950/60 dark:text-emerald-300"><ShieldCheck size={17} /></span><span className="font-bold text-gray-900 dark:text-gray-100">{role.name}</span></div></td>
                  <td className="max-w-xs px-4 py-4 text-gray-600 dark:text-gray-300 sm:px-6">{role.description || "Sin descripción"}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300 sm:px-6"><span className="inline-flex items-center gap-1.5"><Users size={15} className="text-gray-400" />{role.users_count ?? 0}</span></td>
                  <td className="px-4 py-4 sm:px-6"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${role.active === false ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>{role.active === false ? "Inactivo" : "Activo"}</span></td>
                  <td className="px-4 py-4 text-center sm:px-6"><div className="flex justify-center gap-2"><button type="button" title="Editar rol" onClick={() => openEditModal(role)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#586A27] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"><Edit2 size={16} /></button><button type="button" title="Eliminar rol" onClick={() => void handleDelete(role)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <RoleForm key={selectedRole?.id ?? "new"} initialData={selectedRole} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}