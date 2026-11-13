// src/views/admin/modules/schedule/AppointmentFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Form, { type AppointmentFormData } from "./Form";
import {
  createAppointment,
  getAppointmentById,
  updateAppointment,
} from "../../../../services/appointmentService";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "../../../../types/appointment";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;

  const responseData = error.response?.data as
    | {
        message?: string;
        error?: string;
        errors?: Record<string, string | string[]>;
      }
    | undefined;
  const validationErrors = responseData?.errors;

  if (validationErrors) {
    const messages = Object.values(validationErrors).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return responseData?.message || responseData?.error || fallback;
};

export default function AppointmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const backToAgenda = () => navigate("/admin/schedule", { replace: true });

  useEffect(() => {
    if (!id) return;

    let active = true;

    getAppointmentById(id)
      .then((response) => {
        if (active) setAppointment(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar la cita:", error);
        if (active) setLoadError("No se pudo cargar la información de la cita.");
      })
      .finally(() => {
        if (active) setLoadingAppointment(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (data: AppointmentFormData) => {
    setSaving(true);
    setErrorMessage("");

    try {
      if (isEditing && id) {
        await updateAppointment(id, {
          employee_id: data.employee_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          status: data.status,
          notes: data.notes,
        });
      } else {
        const payload: CreateAppointmentPayload = {
          employee_id: data.employee_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time,
          status: data.status,
          is_inspection: data.is_inspection,
        };

        if (data.customer_mode === "existing" && data.customer_id) {
          payload.customer_id = data.customer_id;
        } else if (data.new_customer) {
          payload.customer = data.new_customer;
        }

        if (data.notes) payload.notes = data.notes;

        await createAppointment(payload);
      }

      backToAgenda();
    } catch (error) {
      console.error("Error al guardar la cita:", error);
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? "No se pudo actualizar la cita. Intenta nuevamente."
            : "No se pudo agendar la cita. Intenta nuevamente.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingAppointment) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent dark:bg-gray-900">
        <Loader2 className="animate-spin text-[#5d682e]" size={36} />
        <p className="text-xs text-gray-500 mt-2">Cargando cita...</p>
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
          onClick={backToAgenda}
          className="px-4 py-2 rounded-xl bg-[#5d682e] hover:bg-[#4d5626] text-white text-sm font-medium transition-all cursor-pointer"
        >
          Volver a la agenda
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <p className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-gray-700 shadow-lg dark:bg-gray-800 dark:text-gray-100">
            {isEditing ? "Guardando cambios..." : "Agendando cita..."}
          </p>
        </div>
      )}

      <Form
        key={id ?? "nueva"}
        onClose={backToAgenda}
        onSave={handleSave}
        initialDate={searchParams.get("date") || undefined}
        initialData={appointment}
      />
    </div>
  );
}
