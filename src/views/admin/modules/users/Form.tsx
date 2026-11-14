import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import { getRoles } from "../../../../services/roleService";
import type { CreateEmployeePayload } from "../../../../types/employee";
import type { Role } from "../../../../types/role";

export type EmployeeFormData = CreateEmployeePayload;

interface UserFormProps {
  onClose: () => void;
  onSave: (data: CreateEmployeePayload) => void | Promise<void>;
  initialData?: Partial<CreateEmployeePayload> & { roleName?: string };
  submitError?: string;
}

const DUI_REGEX = /^\d{8}-\d$/;
const PHONE_REGEX = /^\d{4}-\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const onlyDigits = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

// Normaliza fechas ISO (YYYY-MM-DDTHH:mm:ss) al formato del input date
const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

// DUI: 00000000-0 (9 dígitos, guion antes del último)
const formatDui = (value: string) => {
  const d = onlyDigits(value, 9);
  return d.length <= 8 ? d : `${d.slice(0, 8)}-${d.slice(8)}`;
};

// Teléfono: 0000-0000 (8 dígitos)
const formatPhone = (value: string) => {
  const d = onlyDigits(value, 8);
  return d.length <= 4 ? d : `${d.slice(0, 4)}-${d.slice(4)}`;
};

const buildFormData = (
  data?: Partial<CreateEmployeePayload> & { roleName?: string },
): EmployeeFormData => ({
  full_name: data?.full_name || "",
  role_id: Number(data?.role_id) || 0,

  dui: data?.dui || "",
  phone: data?.phone || "",
  birth_date: toDateInputValue(data?.birth_date),
  hire_date: toDateInputValue(data?.hire_date),
  address: data?.address || "",
  municipality: data?.municipality || "",
  department: data?.department || "",
  active: data?.active ?? true,
});

const validateEmployee = (data: EmployeeFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.full_name.trim())
    errors.full_name = "El nombre completo es obligatorio.";

  if (!data.role_id) errors.role_id = "Selecciona un rol para el colaborador.";

  if (data.dui && !DUI_REGEX.test(data.dui))
    errors.dui = "El DUI debe tener el formato 00000000-0.";

  if (data.phone && !PHONE_REGEX.test(data.phone))
    errors.phone = "El teléfono debe tener el formato 0000-0000.";

  return errors;
};

export default function UserForm({
  onClose,
  onSave,
  initialData,
  submitError,
}: UserFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(() =>
    buildFormData(initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      label:
        role.name ||
        role.role_name ||
        role.roleName ||
        role.title ||
        "Sin nombre",
      value: String(role.id),
      description: role.description || "Sin descripción",
    }));

  const statusOptions: SelectOption[] = [
    { label: "Activo", value: "true" },
    { label: "Inactivo", value: "false" },
  ];

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateEmployee(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload: CreateEmployeePayload = {
      full_name: formData.full_name.trim(),
      role_id: Number(formData.role_id),
      active: formData.active ?? true,
    };

    if (formData.dui?.trim()) payload.dui = formData.dui.trim();
    if (formData.email?.trim()) payload.email = formData.email.trim();
    if (formData.phone?.trim()) payload.phone = formData.phone.trim();
    if (formData.address?.trim()) payload.address = formData.address.trim();
    if (formData.municipality?.trim())
      payload.municipality = formData.municipality.trim();
    if (formData.department?.trim())
      payload.department = formData.department.trim();
    if (formData.birth_date) payload.birth_date = formData.birth_date;
    if (formData.hire_date) payload.hire_date = formData.hire_date;

    setIsSaving(true);
    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-transparent dark:bg-gray-900 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title="Volver al listado"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {initialData ? "Editar Colaborador" : "Agregar Nuevo Colaborador"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {initialData
              ? "Actualiza la información del colaborador registrado."
              : "Ingresa los datos requeridos para registrar el colaborador."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Nombre Completo y Rol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo *
              </label>
              <Input
                type="text"
                required
                placeholder="Ej. María López"
                value={formData.full_name}
                error={errors.full_name}
                onChange={(event) => {
                  setFormData({ ...formData, full_name: event.target.value });
                  clearError("full_name");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Rol *
              </label>
              <SearchableSelect
                options={roleOptions}
                value={formData.role_id ? String(formData.role_id) : ""}
                onChange={(value) => {
                  setFormData({ ...formData, role_id: Number(value) });
                  clearError("role_id");
                }}
                placeholder={
                  rolesLoading ? "Cargando roles..." : "Selecciona un rol"
                }
              />
              {errors.role_id && (
                <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {errors.role_id}
                </span>
              )}
              {rolesError && (
                <span className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">
                  {rolesError}
                </span>
              )}
            </div>
          </div>

          {/* DUI y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                DUI
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="00000000-0"
                value={formData.dui || ""}
                error={errors.dui}
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    dui: formatDui(event.target.value),
                  });
                  clearError("dui");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Teléfono
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="7000-0000"
                value={formData.phone || ""}
                error={errors.phone}
                onChange={(event) => {
                  setFormData({
                    ...formData,
                    phone: formatPhone(event.target.value),
                  });
                  clearError("phone");
                }}
              />
            </div>
          </div>

          {/* Fechas de Nacimiento y Contratación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Nacimiento
              </label>
              <Input
                type="date"
                value={formData.birth_date || ""}
                onChange={(event) =>
                  setFormData({ ...formData, birth_date: event.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Contratación
              </label>
              <Input
                type="date"
                value={formData.hire_date || ""}
                onChange={(event) =>
                  setFormData({ ...formData, hire_date: event.target.value })
                }
              />
            </div>
          </div>

          {/* Departamento y Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Departamento
              </label>
              <Input
                type="text"
                placeholder="San Salvador"
                value={formData.department || ""}
                onChange={(event) =>
                  setFormData({ ...formData, department: event.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Municipio
              </label>
              <Input
                type="text"
                placeholder="San Salvador"
                value={formData.municipality || ""}
                onChange={(event) =>
                  setFormData({ ...formData, municipality: event.target.value })
                }
              />
            </div>
          </div>

          {/* Dirección y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección
              </label>
              <Input
                type="text"
                placeholder="Colonia Centro, San Salvador"
                value={formData.address || ""}
                onChange={(event) =>
                  setFormData({ ...formData, address: event.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <SearchableSelect
                options={statusOptions}
                value={formData.active === false ? "false" : "true"}
                onChange={(value) =>
                  setFormData({ ...formData, active: value === "true" })
                }
                placeholder="Selecciona el estado"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            {submitError && (
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 sm:mr-auto">
                {submitError}
              </p>
            )}
            <Button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{ backgroundColor: "#CCC", color: "#333" }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || rolesLoading || roleOptions.length === 0}
              style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
              className="w-full sm:w-auto"
            >
              {isSaving
                ? "Guardando..."
                : initialData
                  ? "Guardar Cambios"
                  : "Guardar Colaborador"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
