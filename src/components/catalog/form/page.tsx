// src/components/plants/PlantForm.tsx
import React, { useState } from "react";
import Input from "../../Input";
import Button from "../../Button";
import SearchableSelect, { type SelectOption } from "../../SearchableSelect";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import type { CreatePlantPayload, Plant } from "../../../types/plant";
import { resolveImageUrl } from "../../../utils/imageUrl";

export interface PlantFormData extends Omit<CreatePlantPayload, "price"> {
  // Se mantiene como string durante la edición para permitir escribir "45.80"
  price: number | string;
  id?: number;
  imageUrl?: string;
  remove_image?: boolean;
}

interface PlantFormProps {
  onClose?: () => void;
  onSave?: (data: PlantFormData, imageFile?: File) => void;
  initialData?: Plant | null;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Interior", value: "Interior" },
  { label: "Exterior", value: "Exterior" },
  { label: "Sombra", value: "Sombra" },
];

const buildInitialFormData = (data?: Plant | null): PlantFormData => ({
  name: data?.name || "",
  price: data ? String(data.price) : "",
  category_type: data?.categoryType || "Interior",
  active: data?.active ?? true,
  imageUrl: data?.imageUrl || "",
  remove_image: false,
  id: data?.id,
});

// Permite solo dígitos y un único punto decimal (ej. "45.80")
const sanitizePriceInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) return cleaned;

  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
};

const validatePlant = (data: PlantFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "El nombre de la planta es obligatorio.";
  }

  const rawPrice = String(data.price ?? "").trim();

  if (!rawPrice) {
    errors.price = "El precio es obligatorio.";
  } else if (isNaN(Number(rawPrice))) {
    errors.price = "El precio debe ser un número válido.";
  } else if (Number(rawPrice) < 0) {
    errors.price = "El precio no puede ser negativo.";
  }

  if (!data.category_type?.trim()) {
    errors.category_type = "La categoría es obligatoria.";
  }

  return errors;
};

export const PlantForm: React.FC<PlantFormProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<PlantFormData>(() =>
    buildInitialFormData(initialData),
  );
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>(
    resolveImageUrl(initialData?.imageUrl || initialData?.imagePath),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, remove_image: false }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(undefined);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "", remove_image: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePlant(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (onSave) {
      onSave({ ...formData, price: Number(formData.price) }, imageFile);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado con Botón Volver */}
      <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Volver al catálogo"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            {initialData ? "Editar Planta" : "Agregar Nueva Planta"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {initialData
              ? "Actualiza la información y el catálogo de la especie."
              : "Ingresa los detalles requeridos para registrar una nueva planta."}
          </p>
        </div>
      </div>

      {/* Contenedor del Formulario */}
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Nombre y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de la Planta *
              </label>
              <Input
                type="text"
                required
                placeholder="Monstera Deliciosa"
                value={formData.name}
                error={errors.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearError("name");
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio Unitario ($) *
              </label>
              <Input
                type="text"
                inputMode="decimal"
                required
                placeholder="24.50"
                value={formData.price}
                error={errors.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({
                    ...formData,
                    price: sanitizePriceInput(e.target.value),
                  });
                  clearError("price");
                }}
              />
            </div>
          </div>

          {/* Categoría y Estado Activo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoría / Ambiente *
              </label>
              <SearchableSelect
                options={CATEGORY_OPTIONS}
                value={formData.category_type || "Interior"}
                onChange={(value) => {
                  setFormData({ ...formData, category_type: value });
                  clearError("category_type");
                }}
                placeholder="Selecciona una categoría"
              />
              {errors.category_type && (
                <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {errors.category_type}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Disponibilidad en Catálogo
              </label>
              <div className="flex items-center h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4 text-[#5d682e] rounded border-gray-300 focus:ring-[#5d682e]"
                  />
                  <span>
                    {formData.active ? "Activo (Disponible)" : "Inactivo"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Sección de Carga de Imagen */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Imagen de la Planta (Formatos: JPG, PNG, WEBP - Máx: 5MB)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              {/* Previsualización */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700 relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400" size={32} />
                )}
              </div>

              {/* Botones de selección */}
              <div className="flex flex-col gap-2 w-full">
                <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm">
                  <Upload size={16} />
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline text-left sm:text-center font-medium"
                  >
                    Quitar imagen actual
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción Final */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: "#CCC", color: "#333" }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              style={{ backgroundColor: "#6C7D38", color: "#FFF" }}
              className="w-full sm:w-auto"
            >
              {initialData ? "Guardar Cambios" : "Guardar Planta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
