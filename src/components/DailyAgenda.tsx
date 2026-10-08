import { useMemo, useState, type FormEvent } from "react";
import Input from "./Input";

type AppointmentStatus = "Completado" | "Pendiente" | "En curso" | "Disponible";
type AppointmentPriority = "Alta" | "Media" | "Baja";

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  description: string;
  assignedTo?: string;
  priority?: AppointmentPriority;
  pendingAction?: "complete" | "start";
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    date: "2026-09-11",
    time: "8:00 A:M",
    status: "Completado",
    description: "Preparación de área y equipos",
    assignedTo: "Equipo 3",
    priority: "Alta",
  },
  {
    id: 2,
    date: "2026-09-11",
    time: "9:30 A:M",
    status: "Pendiente",
    description: "Check-in: Inmobiliaria Bosques",
    assignedTo: "Recepcionista",
    priority: "Media",
    pendingAction: "complete",
  },
  {
    id: 3,
    date: "2026-09-11",
    time: "10:45 A:M",
    status: "En curso",
    description: "Entrega de Fertilizantes",
    assignedTo: "Equipo 2 / Eduardo",
    priority: "Media",
  },
  {
    id: 4,
    date: "2026-09-11",
    time: "2:00 P:M",
    status: "Pendiente",
    description: "Revisión Suscripción Plan Pro",
    assignedTo: "Sebastian",
    priority: "Alta",
    pendingAction: "start",
  },
  {
    id: 5,
    date: "2026-09-11",
    time: "2:45 P:M",
    status: "Disponible",
    description: "Espacio libre / Disponible",
  },
];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Completado: "bg-[#e2f0dc] text-[#35623a]",
  Pendiente: "bg-[#fde3d7] text-[#c91c10]",
  "En curso": "bg-[#e2f0dc] text-[#35623a]",
  Disponible: "bg-[#e2f0dc] text-[#35623a]",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DailyAgenda() {
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 8, 11));
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const selectedDateKey = dateKey(selectedDate);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return appointments.filter((appointment) => {
      if (appointment.date !== selectedDateKey) return false;
      if (!query) return true;
      return [
        appointment.time,
        appointment.status,
        appointment.description,
        appointment.assignedTo,
        appointment.priority,
      ]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("es").includes(query));
    });
  }, [appointments, search, selectedDateKey]);

  const changeStatus = (appointment: Appointment, status: AppointmentStatus) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id ? { ...item, status } : item,
      ),
    );
  };

  const bookAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    const assignedTo = String(formData.get("assignedTo") ?? "").trim();
    const priority = String(formData.get("priority") ?? "") as AppointmentPriority;
    const availableSlot = appointments.find(
      (appointment) =>
        appointment.date === selectedDateKey &&
        appointment.status === "Disponible",
    );

    if (!description || !availableSlot) return;

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === availableSlot.id
          ? {
              ...appointment,
              status: "Pendiente",
              description,
              assignedTo,
              priority,
            }
          : appointment,
      ),
    );
    setIsBooking(false);
  };

  return (
    <section className="w-full bg-white px-1 py-2 font-sans text-[#30321f] sm:px-3">
      <div className="flex flex-col gap-4 rounded-[18px] bg-[#ede7dc] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
        <div className="w-full sm:max-w-[370px]">
          <Input
            aria-label="Buscar en la agenda"
            placeholder="Buscar tarifa por servicio..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-[10px] border-[#e4ded4] px-4 py-2 text-sm shadow-none placeholder:text-[#777965]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              setSelectedDate(
                (date) =>
                  new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
              )
            }
            className="rounded-md border border-[#e4ded4] bg-white px-3 py-2 text-sm transition-colors hover:bg-[#f8f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c7d38]"
          >
            Día Anterior
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedDate(
                (date) =>
                  new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
              )
            }
            className="rounded-md border border-[#e4ded4] bg-white px-3 py-2 text-sm transition-colors hover:bg-[#f8f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c7d38]"
          >
            Siguiente Día
          </button>
        </div>
      </div>

      <p className="my-3 pr-4 text-right text-sm font-bold">{formatDate(selectedDate)}</p>

      <div className="overflow-hidden rounded-[20px] border border-[#e5ded2]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="bg-[#ede7dc] text-[13px] font-bold uppercase">
              <tr>
                <th className="px-6 py-[17px]">Hora</th>
                <th className="px-6 py-[17px]">Estado</th>
                <th className="px-6 py-[17px]">Descripción</th>
                <th className="px-6 py-[17px]">Asignado a</th>
                <th className="px-6 py-[17px]">Prioridad</th>
                <th className="px-6 py-[17px] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e2d8] text-sm">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="transition-colors hover:bg-[#faf9f6]"
                  >
                    <td className="whitespace-nowrap px-6 py-[17px] text-[#777965]">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-[17px]">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-[17px] text-base font-semibold">
                      {appointment.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-[17px] text-[#777965]">
                      {appointment.assignedTo ?? ""}
                    </td>
                    <td className="px-6 py-[17px]">{appointment.priority ?? ""}</td>
                    <td className="px-6 py-[17px] text-right">
                      {appointment.status === "Completado" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(appointment)}
                          className="font-bold text-[#35623a] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35623a]"
                        >
                          Ver
                        </button>
                      ) : appointment.status === "Disponible" ? (
                        <button
                          type="button"
                          onClick={() => setIsBooking(true)}
                          className="font-bold text-[#35623a] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35623a]"
                        >
                          Agendar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            changeStatus(
                              appointment,
                              appointment.status === "En curso" ||
                                appointment.pendingAction === "complete"
                                ? "Completado"
                                : "En curso",
                            )
                          }
                          className={`font-bold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            appointment.status === "Pendiente"
                              ? "text-[#c91c10] focus-visible:outline-[#c91c10]"
                              : "text-[#35623a] focus-visible:outline-[#35623a]"
                          }`}
                        >
                          {appointment.status === "Pendiente"
                            ? appointment.pendingAction === "complete"
                              ? "Completar"
                              : "Iniciar"
                            : "Completar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#777965]">
                    No hay actividades que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isBooking || selectedAppointment) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsBooking(false);
              setSelectedAppointment(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            {isBooking ? (
              <form onSubmit={bookAppointment} className="flex flex-col gap-4">
                <h2 id="agenda-dialog-title" className="text-lg font-bold">
                  Agendar espacio disponible
                </h2>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Descripción
                  <input
                    name="description"
                    required
                    autoFocus
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#6c7d38]"
                    placeholder="Actividad o servicio"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Asignado a
                  <input
                    name="assignedTo"
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#6c7d38]"
                    placeholder="Nombre o equipo"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Prioridad
                  <select
                    name="priority"
                    defaultValue="Media"
                    className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#6c7d38]"
                  >
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </label>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBooking(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#6c7d38] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b6a2f]"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 id="agenda-dialog-title" className="text-lg font-bold">
                  Detalle de actividad
                </h2>
                <p className="mt-4 font-semibold">{selectedAppointment?.description}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedAppointment?.time} · {selectedAppointment?.assignedTo}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="mt-6 rounded-lg bg-[#6c7d38] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b6a2f]"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
