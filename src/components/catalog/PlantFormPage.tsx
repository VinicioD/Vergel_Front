// src/components/catalog/PlantFormPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { PlantForm, type PlantFormData } from "./form/page";
import {
  createPlant,
  getPlantById,
  updatePlant,
} from "../../services/plantService";
import type { Plant } from "../../types/plant";

export default function PlantFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [initialPlant, setInitialPlant] = useState<Plant | null>(null);
  const [loadingPlant, setLoadingPlant] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Vuelve al catálogo quitando el sufijo de la ruta actual
  const backTo = location.pathname.replace(/\/(?:nueva|\d+\/editar)$/, "");

  useEffect(() => {
    if (!id) return;

    let active = true;
    getPlantById(id)
      .then((response) => {
        if (active) setInitialPlant(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar la planta:", error);
        if (active) {
          setLoadError("No se pudo cargar la información de la planta.");
        }
      })
      .finally(() => {
        if (active) setLoadingPlant(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleClose = () => {
    navigate(backTo);
  };

  const handleSave = async (data: PlantFormData, imageFile?: File) => {
    setSaving(true);
    setErrorMessage("");

    const basePayload = {
      name: data.name,
      price: Number(data.price),
      category_type: data.category_type,
      active: data.active,
    };

    try {
      if (isEditing && id) {
        await updatePlant(id, {
          ...basePayload,
          image: imageFile,
          remove_image: data.remove_image,
        });
      } else {
        await createPlant({ ...basePayload, image: imageFile });
      }
      navigate(backTo, { replace: true });
    } catch (error) {
      console.error("Error al guardar la planta:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage("No tienes permisos suficientes para guardar plantas.");
      } else if (isAxiosError(error) && error.response?.status === 422) {
        setErrorMessage("Revisa los datos ingresados: el servidor los rechazó.");
      } else {
        setErrorMessage("No se pudo guardar la planta. Intenta nuevamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingPlant) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent dark:bg-gray-900">
        <Loader2 className="animate-spin text-[#5d682e]" size={36} />
        <p className="text-xs text-gray-500 mt-2">Cargando planta...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-transparent dark:bg-gray-900 px-4 text-center">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {loadError}
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-xl bg-[#5d682e] hover:bg-[#4d5626] text-white text-sm font-medium transition-all cursor-pointer"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <p className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-100">
            Guardando planta...
          </p>
        </div>
      )}

      <PlantForm
        onClose={handleClose}
        onSave={handleSave}
        initialData={initialPlant}
      />
    </div>
  );
}
