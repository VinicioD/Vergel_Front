import { useState, type FormEvent } from "react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import type {
  CreateRolePayload,
  Role,
  UpdateRolePayload,
} from "../../../../types/role";

interface RoleFormProps {
  initialData?: Role | null;
  onClose: () => void;
  onSave: (data: CreateRolePayload | UpdateRolePayload) => void | Promise<void>;
}

export default function RoleForm({
  initialData,
  onClose,
  onSave,
}: RoleFormProps) {
  const [roleName, setRoleName] = useState(() => initialData?.roleName ?? "");
  const [description, setDescription] = useState(
    () => initialData?.description ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = roleName.trim();
    if (!trimmedName) return;

    const trimmedDescription = description.trim();
    const payload: CreateRolePayload = {
      role_name: trimmedName,
      description: trimmedDescription || null,
    };

    setIsSaving(true);
    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
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
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          placeholder="Ej. Supervisor"
          required
          autoFocus
        />

        <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          Descripción
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe el alcance de este rol"
            rows={3}
            className="resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-[#5b642a] focus:ring-1 focus:ring-[#5b642a] dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-100 dark:focus:border-[#7c8839]"
          />
        </label>
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar rol"}
        </Button>
      </div>
    </form>
  );
}
