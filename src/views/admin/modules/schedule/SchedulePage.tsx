// src/views/admin/modules/schedule/SchedulePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import Swal from "sweetalert2";
import {
  deleteAppointment,
  getAppointments,
} from "../../../../services/appointmentService";
import type { Appointment } from "../../../../types/appointment";
import type { CalendarEvent } from "../../../../components/CalendarView";
import type { Inspection } from "../../../../components/DailyInspections";
import ScheduleView from "./ScheduleView";
import AppointmentDetailModal from "./AppointmentDetailModal";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;

  const responseData = error.response?.data as
    | { message?: string; error?: string }
    | undefined;

  return responseData?.message || responseData?.error || fallback;
};

const showToast = (icon: "success" | "error", title: string) => {
  void Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewingAppointment, setViewingAppointment] =
    useState<Appointment | null>(null);

  // Cargar citas desde el backend con el parámetro "all=true" para el calendario mensual
  useEffect(() => {
    let active = true;

    const fetchAppointments = async () => {
      try {
        const response = await getAppointments({
          all: true, // Trae todo el listado para la cuadrícula del calendario
        });
        if (active) setAppointments(response.data);
      } catch (error) {
        console.error("Error al cargar la agenda:", error);
        if (isAxiosError(error) && error.response?.status === 403) {
          alert("No tienes permisos suficientes para ver la agenda completa.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAppointments();
    return () => {
      active = false;
    };
  }, []);

  // Las citas anuladas representan eliminaciones y no se muestran en la agenda
  const visibleAppointments = appointments.filter(
    (appointment) => appointment.status !== "annulled",
  );

  // 1. Mapear citas reales al formato de CalendarEvent
  const calendarEvents: CalendarEvent[] = visibleAppointments.map((app) => ({
    id: String(app.id),
    date: app.appointmentDate,
    title: `${app.customer?.legalName || "Cliente"} (${app.appointmentTime})`,
    time: app.appointmentTime,
  }));

  // 2. Filtrar y mapear citas para el día seleccionado (DailyInspections / DailyAgenda)
  const todaysAppointments = visibleAppointments.filter(
    (app) => app.appointmentDate === selectedDate,
  );

  const dailyInspections: Inspection[] = todaysAppointments.map((app) => {
    // Mapeo seguro de estados del backend a los estilos del componente visual
    let mappedStatus: "Asignado" | "En Proceso" | "Completado" = "Asignado";
    if (app.status === "confirmed" || app.status === "completed") {
      mappedStatus = "Completado";
    } else if (app.status === "pending") {
      mappedStatus = "En Proceso";
    }

    return {
      id: String(app.id),
      time: app.appointmentTime,
      client: app.customer?.legalName || "Sin cliente",
      type: app.service?.name || "Visita / Inspección General",
      location: app.customer?.address || "Sin dirección registrada",
      status: mappedStatus,
    };
  });

  const handleView = (id: string) => {
    const appointment = appointments.find(
      (item) => String(item.id) === id,
    );
    if (appointment) setViewingAppointment(appointment);
  };

  const handleEdit = (id: string) => {
    navigate(`${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    const appointment = appointments.find((item) => String(item.id) === id);
    if (!appointment) return;

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar cita?",
      text: `Se eliminará la cita de ${
        appointment.customer?.legalName || "este cliente"
      }. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#be123c",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteAppointment(appointment.id);
      setAppointments((prev) =>
        prev.filter((item) => item.id !== appointment.id),
      );
      showToast("success", "Cita eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      showToast(
        "error",
        getApiErrorMessage(error, "No se pudo eliminar la cita."),
      );
    }
  };

  return (
    <>
      <ScheduleView
        events={calendarEvents}
        inspections={dailyInspections}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onScheduleNew={() => navigate(`new?date=${selectedDate}`)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {viewingAppointment && (
        <AppointmentDetailModal
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          onEdit={(id) => {
            setViewingAppointment(null);
            navigate(`${id}/edit`);
          }}
        />
      )}
    </>
  );
}
