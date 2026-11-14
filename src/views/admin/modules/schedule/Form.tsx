// src/views/admin/modules/schedule/Form.tsx
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Users,
  CalendarDays,
  FileText,
  Loader2,
} from "lucide-react";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";
import { getCustomers } from "../../../../services/customerService";
import { getEmployees } from "../../../../services/employeeService";
import type { CustomerListItem } from "../../../../types/customer";
import type { Employee } from "../../../../types/employee";
import type {
  Appointment,
  AppointmentStatus,
  NewAppointmentCustomerPayload,
} from "../../../../types/appointment";

export interface AppointmentFormData {
  customer_mode: "existing" | "new";
  customer_id?: number;
  new_customer?: NewAppointmentCustomerPayload;
  employee_id: number;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  is_inspection: boolean;
  notes?: string;
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: AppointmentFormData) => void;
  initialDate?: string;
  initialData?: Appointment | null;
}

const PHONE_REGEX = /^\d{4}-\d{4}$/;

const todayStr = () => new Date().toISOString().split("T")[0];

const onlyDigits = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

// Teléfono: 0000-0000 (8 dígitos)
const formatPhone = (value: string) => {
  const d = onlyDigits(value, 8);
  return d.length <= 4 ? d : `${d.slice(0, 4)}-${d.slice(4)}`;
};

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Pendiente", value: "pending" },
  { label: "Confirmada", value: "confirmed" },
];

const EDIT_STATUS_OPTIONS: SelectOption[] = [
  ...STATUS_OPTIONS,
  { label: "Completada", value: "completed" },
  { label: "Cancelada", value: "cancelled" },
  { label: "Anulada", value: "annulled" },
];

const buildInitialData = (
  initialDate?: string,
  appointment?: Appointment | null,
): AppointmentFormData => ({
  customer_mode: "existing",
  customer_id: appointment?.customerId,
  new_customer: {
    legal_name: "",
    phone: "",
    address: "",
    municipality: "San Salvador",
    department: "San Salvador",
    email: "",
  },
  employee_id: appointment?.employeeId ?? 0,
  appointment_date: appointment?.appointmentDate || initialDate || todayStr(),
  appointment_time: appointment?.appointmentTime || "09:00",
  status: appointment?.status || "pending",
  is_inspection:
    appointment?.isInspection ?? appointment?.is_inspection ?? false,
  notes: appointment?.notes || "",
});

const validateAppointment = (
  data: AppointmentFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.customer_mode === "existing") {
    if (!data.customer_id) errors.customer_id = "Selecciona un cliente.";
  } else {
    const customer = data.new_customer;
    if (!customer?.legal_name.trim())
      errors.legal_name = "El nombre legal es obligatorio.";

    if (!customer?.phone.trim()) errors.phone = "El teléfono es obligatorio.";
    else if (!PHONE_REGEX.test(customer.phone))
      errors.phone = "El teléfono debe tener el formato 0000-0000.";

    if (!customer?.address.trim())
      errors.address = "La dirección es obligatoria.";

    if (!customer?.municipality.trim())
      errors.municipality = "El municipio es obligatorio.";
  }

  if (!data.employee_id) errors.employee_id = "Selecciona un colaborador.";
  if (!data.appointment_date)
    errors.appointment_date = "La fecha es obligatoria.";
  if (!data.appointment_time)
    errors.appointment_time = "La hora es obligatoria.";

  return errors;
};

export const Form = ({
  onClose,
  onSave,
  initialDate,
  initialData,
}: FormProps) => {
  const isEditing = Boolean(initialData);
  const [formData, setFormData] = useState<AppointmentFormData>(() =>
    buildInitialData(initialDate, initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getCustomers({ limit: 100, status: "active" }),
      getEmployees({ per_page: 100 }),
    ])
      .then(([customersResponse, employeeList]) => {
        if (!active) return;
        setCustomers(customersResponse.data);
        setEmployees(employeeList.data);
      })
      .catch((error) => {
        console.error("Error al cargar los datos de la cita:", error);
        if (active) {
          setLoadError(
            "No se pudieron cargar los clientes o colaboradores. Intenta recargar la página.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const customerOptions: SelectOption[] = customers.map((customer) => ({
    label: customer.tradeName || customer.legalName,
    value: String(customer.id),
  }));

  const employeeOptions: SelectOption[] = employees
    .filter(
      (employee) => employee.active || employee.id === formData.employee_id,
    )
    .map((employee) => ({
      label: employee.roleName
        ? `${employee.fullName} · ${employee.roleName}`
        : employee.fullName,
      value: String(employee.id),
    }));

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const patchForm = (patch: Partial<AppointmentFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const patchCustomer = (patch: Partial<NewAppointmentCustomerPayload>) =>
    setFormData((prev) => ({
      ...prev,
      new_customer: { ...prev.new_customer!, ...patch },
    }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateAppointment(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const newCustomer = formData.new_customer;

    onSave?.({
      ...formData,
      customer_id:
        formData.customer_mode === "existing"
          ? formData.customer_id
          : undefined,
      new_customer:
        formData.customer_mode === "new" && newCustomer
          ? {
              legal_name: newCustomer.legal_name.trim(),
              phone: newCustomer.phone.trim(),
              address: newCustomer.address.trim(),
              municipality: newCustomer.municipality.trim(),
              department: newCustomer.department?.trim() || undefined,
              email: newCustomer.email?.trim() || undefined,
            }
          : undefined,
      notes: formData.notes?.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen w-full dark:bg-gray-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto mb-7">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Volver a la agenda"
              className="h-11 w-11 shrink-0 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-[#E5E8DC] dark:border-gray-700 text-[#68783B] dark:text-gray-300 shadow-sm hover:bg-[#F0F2E9] dark:hover:bg-gray-700 hover:-translate-x-1 transition-all"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-6 rounded-full bg-[#82934C]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#82934C] dark:text-[#A3B77A]">
                Gestión de agenda
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#303B24] dark:text-gray-100">
              {isEditing ? "Editar Cita" : "Agregar Nueva Cita"}
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing
                ? "Actualiza los datos de la cita programada."
                : "Programa una visita o inspección y asígnala a un colaborador."}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[28px] border border-[#E8EBDD] dark:border-gray-800 shadow-[0_12px_45px_rgba(55,70,35,0.07)] overflow-hidden">
        {/* Franja superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#5B6D35] via-[#9BAA68] to-[#D5DDBB]" />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-7 p-5 sm:p-7 lg:p-9"
        >
          {loadError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {loadError}
            </p>
          )}

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 xl:gap-9 items-start">
            {/* COLUMNA 1: CLIENTE */}
            <div className="flex flex-col gap-5 lg:pr-7 lg:border-r border-[#EDF0E7] dark:border-gray-800">
              <div className="flex items-center gap-3 pb-3 border-b border-[#EDF0E7] dark:border-gray-800">
                <div className="h-10 w-10 rounded-xl bg-[#EEF2E5] dark:bg-[#344027]/50 flex items-center justify-center text-[#687C3D] dark:text-[#B4C58A]">
                  <Users size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#303B24] dark:text-gray-100">
                    Información del cliente
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Datos de identificación
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Cliente <span className="text-red-500">*</span>
                </label>

                {isEditing ? (
                  <div className="p-4 bg-[#F6F8F1] dark:bg-gray-800/70 rounded-2xl border border-[#E6EBD9] dark:border-gray-700 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#82934C] uppercase tracking-wider">
                      Cliente asignado
                    </span>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
                      {initialData?.customer?.legalName || "Cliente"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {initialData?.customer?.phone}
                      {initialData?.customer?.address
                        ? ` · ${initialData.customer.address}`
                        : ""}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F1F3EC] dark:bg-gray-800 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          patchForm({ customer_mode: "existing" });
                          setErrors({});
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          formData.customer_mode === "existing"
                            ? "bg-white dark:bg-gray-700 text-[#5B6D35] dark:text-[#C1D49A] shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        Cliente existente
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          patchForm({ customer_mode: "new" });
                          setErrors({});
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          formData.customer_mode === "new"
                            ? "bg-white dark:bg-gray-700 text-[#5B6D35] dark:text-[#C1D49A] shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        Nuevo cliente
                      </button>
                    </div>

                    {formData.customer_mode === "existing" ? (
                      <div className="flex flex-col gap-1">
                        <SearchableSelect
                          options={customerOptions}
                          value={
                            formData.customer_id
                              ? String(formData.customer_id)
                              : ""
                          }
                          onChange={(value) => {
                            patchForm({ customer_id: Number(value) });
                            clearError("customer_id");
                          }}
                          placeholder={
                            loadingData
                              ? "Cargando clientes..."
                              : "Selecciona un cliente"
                          }
                          className="max-w-none"
                        />

                        {errors.customer_id && (
                          <span className="text-xs text-red-500 dark:text-red-400 mt-1">
                            {errors.customer_id}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Nombre Legal / Razón Social *
                          </label>
                          <Input
                            type="text"
                            required
                            placeholder="Cliente Ejemplo S.A. de C.V."
                            value={formData.new_customer?.legal_name || ""}
                            error={errors.legal_name}
                            onChange={(event) => {
                              patchCustomer({ legal_name: event.target.value });
                              clearError("legal_name");
                            }}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Teléfono *
                          </label>
                          <Input
                            type="text"
                            required
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="7000-0000"
                            value={formData.new_customer?.phone || ""}
                            error={errors.phone}
                            onChange={(event) => {
                              patchCustomer({
                                phone: formatPhone(event.target.value),
                              });
                              clearError("phone");
                            }}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Correo Electrónico
                          </label>
                          <Input
                            type="email"
                            placeholder="cliente@example.com"
                            value={formData.new_customer?.email || ""}
                            onChange={(event) =>
                              patchCustomer({ email: event.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Departamento
                            </label>
                            <Input
                              type="text"
                              placeholder="San Salvador"
                              value={formData.new_customer?.department || ""}
                              onChange={(event) =>
                                patchCustomer({
                                  department: event.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Municipio *
                            </label>
                            <Input
                              type="text"
                              required
                              placeholder="San Salvador"
                              value={formData.new_customer?.municipality || ""}
                              error={errors.municipality}
                              onChange={(event) => {
                                patchCustomer({
                                  municipality: event.target.value,
                                });
                                clearError("municipality");
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Dirección *
                          </label>
                          <Input
                            type="text"
                            required
                            placeholder="Colonia Centro, San Salvador"
                            value={formData.new_customer?.address || ""}
                            error={errors.address}
                            onChange={(event) => {
                              patchCustomer({ address: event.target.value });
                              clearError("address");
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* COLUMNA 2: PROGRAMACIÓN */}
            <div className="flex flex-col gap-5 lg:pr-7 lg:border-r border-[#EDF0E7] dark:border-gray-800">
              <div className="flex items-center gap-3 pb-3 border-b border-[#EDF0E7] dark:border-gray-800">
                <div className="h-10 w-10 rounded-xl bg-[#EEF2E5] dark:bg-[#344027]/50 flex items-center justify-center text-[#687C3D] dark:text-[#B4C58A]">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#303B24] dark:text-gray-100">
                    Programación
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Fecha, hora y responsable
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Colaborador Asignado *
                </label>

                <SearchableSelect
                  options={employeeOptions}
                  value={
                    formData.employee_id ? String(formData.employee_id) : ""
                  }
                  onChange={(value) => {
                    patchForm({ employee_id: Number(value) });
                    clearError("employee_id");
                  }}
                  placeholder={
                    loadingData
                      ? "Cargando colaboradores..."
                      : "Selecciona un colaborador"
                  }
                  className="max-w-none"
                />

                {errors.employee_id && (
                  <span className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.employee_id}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Fecha *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.appointment_date}
                    error={errors.appointment_date}
                    onChange={(event) => {
                      patchForm({ appointment_date: event.target.value });
                      clearError("appointment_date");
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Hora *
                  </label>
                  <Input
                    type="time"
                    required
                    value={formData.appointment_time}
                    error={errors.appointment_time}
                    onChange={(event) => {
                      patchForm({ appointment_time: event.target.value });
                      clearError("appointment_time");
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Estado
                </label>
                <SearchableSelect
                  options={isEditing ? EDIT_STATUS_OPTIONS : STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(value) =>
                    patchForm({ status: value as AppointmentStatus })
                  }
                  placeholder="Selecciona un estado"
                  className="max-w-none"
                />
              </div>

              {!isEditing && (
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F6F8F1] dark:bg-gray-800/70 border border-[#E9EDDF] dark:border-gray-700 cursor-pointer select-none hover:bg-[#EFF3E6] dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_inspection}
                    onChange={(event) =>
                      patchForm({ is_inspection: event.target.checked })
                    }
                    className="h-4 w-4 accent-[#5b642a] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Marcar como inspección
                  </span>
                </label>
              )}
            </div>

            {/* COLUMNA 3: NOTAS */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-3 border-b border-[#EDF0E7] dark:border-gray-800">
                <div className="h-10 w-10 rounded-xl bg-[#EEF2E5] dark:bg-[#344027]/50 flex items-center justify-center text-[#687C3D] dark:text-[#B4C58A]">
                  <FileText size={19} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#303B24] dark:text-gray-100">
                    Notas e indicaciones
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Información adicional
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Notas
                </label>

                <textarea
                  rows={8}
                  placeholder="Indicaciones adicionales para la visita..."
                  value={formData.notes || ""}
                  onChange={(event) => patchForm({ notes: event.target.value })}
                  className="w-full min-h-[190px] px-4 py-3.5 text-sm rounded-2xl border border-[#E1E6D8] dark:border-gray-700 bg-[#FAFBF8] dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#899B58]/20 focus:border-[#82934C]"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Agrega detalles importantes que el colaborador deba conocer.
                </p>
              </div>
            </div>
          </div>

          {/* Cargando */}
          {loadingData && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F5F7EF] dark:bg-gray-800/70 border border-[#E9EDDF] dark:border-gray-700">
              <Loader2 className="animate-spin text-[#718447]" size={17} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Cargando clientes y colaboradores...
              </span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[#EDF0E7] dark:border-gray-800">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: "#E9EDE2", color: "#455333" }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              style={{ backgroundColor: "#687C3D", color: "#FFF" }}
              className="w-full sm:w-auto"
              disabled={loadingData}
            >
              {isEditing ? "Guardar Cambios" : "Agendar Cita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
