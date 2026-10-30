import { useState, type FormEvent } from "react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import type { Role, RolePayload } from "../../../../types/role";

interface RoleFormProps {
  initialData?: Role | null;
  onClose: () => void;
  onSave: (data: RolePayload) => void | Promise<void>;
}

export default function RoleForm({
  initialData,
  onClose,
  onSave,
}: RoleFormProps) {
  const [formData, setFormData] = useState<RolePayload>(() => ({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    active: initialData?.active ?? true,
  }));
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {initialData ? "Editar rol" : "Nuevo rol"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define el nombre y la descripción del rol de acceso.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre del rol"
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Ej. Supervisor"
          required
          autoFocus
        />
        <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          Descripción
          <textarea
            value={formData.description}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Describe el alcance de este rol"
            rows={3}
            className="resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[#5b642a] focus:ring-1 focus:ring-[#5b642a] dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-100 dark:focus:border-[#7c8839]"
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#6C7D38]"
          />
          Rol activo
        </label>
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar rol"}
        </Button>
      </div>
    </form>
  );
}