import { useEffect, useState, type FormEvent } from "react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import { getRoles } from "../../../../services/roleService";
import type { CreateEmployeePayload } from "../../../../types/employee";
import type { Role } from "../../../../types/role";

interface UserFormProps {
  onClose: () => void;
  onSave: (data: CreateEmployeePayload) => void | Promise<void>;
  initialData?: Partial<CreateEmployeePayload> & { roleName?: string };
}

export default function UserForm({ onClose, onSave, initialData }: UserFormProps) {
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    full_name: initialData?.full_name ?? "",
    role_id: initialData?.role_id ?? 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getRoles()
      .then((response) => {
        if (isMounted) {
          setRoles(response);
          setRolesError("");
        }
      })
      .catch(() => {
        if (isMounted) setRolesError("No se pudieron cargar los roles.");
      })
      .finally(() => {
        if (isMounted) setRolesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const roleOptions: SelectOption[] = roles
    .filter((role) => role.active !== false)
    .map((role) => ({
      label: role.name || role.role_name || role.roleName || role.title || "Sin nombre",
      value: String(role.id),
      description: role.description || "Sin descripción",
    }));
  const selectedRoleId =
    formData.role_id ||
    Number(
      roleOptions.find((option) => option.label === initialData?.roleName)
        ?.value ?? 0,
    );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        full_name: formData.full_name.trim(),
        role_id: selectedRoleId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {initialData ? "Editar colaborador" : "Nuevo colaborador"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {initialData
            ? "Actualiza los datos del colaborador."
            : "Registra los datos básicos del colaborador y asigna su rol."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          value={formData.full_name}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              full_name: event.target.value,
            }))
          }
          placeholder="Ej. María López"
          required
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Rol *
          </label>
          <SearchableSelect
            options={roleOptions}
            value={selectedRoleId ? String(selectedRoleId) : ""}
            onChange={(value) =>
              setFormData((current) => ({
                ...current,
                role_id: Number(value),
              }))
            }
            placeholder={rolesLoading ? "Cargando roles..." : "Seleccionar rol"}
          />
          {rolesError && (
            <span className="text-xs text-rose-500 dark:text-rose-400">
              {rolesError}
            </span>
          )}
        </div>
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isSaving ||
            rolesLoading ||
            roleOptions.length === 0 ||
            !selectedRoleId
          }
        >
          {isSaving ? "Guardando..." : initialData ? "Actualizar colaborador" : "Guardar colaborador"}
        </Button>
      </div>
    </form>
  );
}