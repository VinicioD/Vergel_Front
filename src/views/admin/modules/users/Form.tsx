import { useEffect, useState, type FormEvent } from "react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import {
  type CreateEmployeePayload,
} from "../../../../services/employeeService";
import { getRoles } from "../../../../services/roleService";
import type { Role } from "../../../../types/role";

interface UserFormProps {
  onClose: () => void;
  onSave: (data: CreateEmployeePayload) => void | Promise<void>;
  initialData?: Partial<CreateEmployeePayload> & { name?: string };
}

export default function UserForm({ onClose, onSave, initialData }: UserFormProps) {
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    fullName: initialData?.fullName ?? initialData?.name ?? "",
    email: initialData?.email ?? "",
    password: "",
    roleId: initialData?.roleId ?? 0,
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
      label: role.name || role.role_name || `Rol ${role.id}`,
      value: String(role.id),
    }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        roleId: Number(formData.roleId),
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
            : "Registra el usuario y asigna su rol de acceso."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre completo"
          value={formData.fullName}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              fullName: event.target.value,
            }))
          }
          placeholder="Ej. María López"
          required
          autoFocus
        />
        <Input
          label="Usuario o correo electrónico"
          type="email"
          value={formData.email}
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="usuario@vergel.com"
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={formData.password}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="Ingresa una contraseña"
          minLength={8}
          required={!initialData}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Rol *
          </label>
          <SearchableSelect
            options={roleOptions}
            value={formData.roleId ? String(formData.roleId) : ""}
            onChange={(value) =>
              setFormData((current) => ({
                ...current,
                roleId: Number(value),
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
            !formData.roleId
          }
        >
          {isSaving ? "Guardando..." : initialData ? "Actualizar colaborador" : "Guardar colaborador"}
        </Button>
      </div>
    </form>
  );
}