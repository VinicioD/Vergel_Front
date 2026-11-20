// src/views/technical/modules/inspections/InspectionFormModal.tsx
import { useState, type FormEvent } from "react";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import type {
  CreateInspectionPayload,
  Inspection,
  InspectionStatus,
  SuggestedServiceInput,
  TerrainAreaUnit,
} from "../../../../types/inspection";

interface InspectionFormModalProps {
  initialInspection?: Inspection | null;
  onClose: () => void;
  onSubmit: (payload: CreateInspectionPayload) => Promise<void>;
}

export default function InspectionFormModal({
  initialInspection,
  onClose,
  onSubmit,
}: InspectionFormModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [customerId, setCustomerId] = useState<string>(
    (initialInspection?.customerId ?? initialInspection?.customer_id)
      ? String(initialInspection?.customerId ?? initialInspection?.customer_id)
      : "",
  );
  const [appointmentId, setAppointmentId] = useState<string>(
    (initialInspection?.appointmentId ?? initialInspection?.appointment_id)
      ? String(
          initialInspection?.appointmentId ?? initialInspection?.appointment_id,
        )
      : "",
  );
  const [inspectionDate, setInspectionDate] = useState<string>(
    (
      initialInspection?.inspectionDate ??
      initialInspection?.inspection_date ??
      today
    ).slice(0, 10),
  );
  const [findings, setFindings] = useState<string>(
    initialInspection?.findings ?? "",
  );
  const [terrainWidth, setTerrainWidth] = useState<string>(
    (initialInspection?.terrainWidth ?? initialInspection?.terrain_width)
      ? String(
          initialInspection?.terrainWidth ?? initialInspection?.terrain_width,
        )
      : "",
  );
  const [terrainLength, setTerrainLength] = useState<string>(
    (initialInspection?.terrainLength ?? initialInspection?.terrain_length)
      ? String(
          initialInspection?.terrainLength ?? initialInspection?.terrain_length,
        )
      : "",
  );
  const [totalArea, setTotalArea] = useState<string>(
    (initialInspection?.totalArea ?? initialInspection?.total_area)
      ? String(initialInspection?.totalArea ?? initialInspection?.total_area)
      : "",
  );
  const [areaUnit, setAreaUnit] = useState<TerrainAreaUnit>(
    initialInspection?.areaUnit ?? initialInspection?.area_unit ?? "m2",
  );
  const [terrainNotes, setTerrainNotes] = useState<string>(
    initialInspection?.terrainNotes ?? initialInspection?.terrain_notes ?? "",
  );
  const [status, setStatus] = useState<InspectionStatus>(
    initialInspection?.status ?? "submitted",
  );

  const [services, setServices] = useState<SuggestedServiceInput[]>(() => {
    if (initialInspection?.services && initialInspection.services.length > 0) {
      return initialInspection.services.map((s) => ({
        service_id: Number(s.serviceId ?? s.service_id ?? s.service?.id ?? 0),
        suggested_quantity: Number(
          s.suggestedQuantity ?? s.suggested_quantity ?? 1,
        ),
        notes: s.notes ?? "",
      }));
    }
    return [];
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDimensionChange = (widthVal: string, lengthVal: string) => {
    setTerrainWidth(widthVal);
    setTerrainLength(lengthVal);
    const w = parseFloat(widthVal);
    const l = parseFloat(lengthVal);
    if (!Number.isNaN(w) && !Number.isNaN(l) && w >= 0 && l >= 0) {
      setTotalArea(String(Number((w * l).toFixed(2))));
    }
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { service_id: 0, suggested_quantity: 1, notes: "" },
    ]);
  };

  const updateServiceRow = (
    index: number,
    field: keyof SuggestedServiceInput,
    value: string | number,
  ) => {
    setServices((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const removeServiceRow = (index: number) => {
    setServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedCustomerId = Number(customerId);
    if (!parsedCustomerId) return;

    setIsSubmitting(true);
    try {
      const payload: CreateInspectionPayload = {
        customer_id: parsedCustomerId,
        appointment_id: appointmentId ? Number(appointmentId) : undefined,
        inspection_date: inspectionDate,
        findings: findings.trim() || undefined,
        terrain_width: terrainWidth ? Number(terrainWidth) : undefined,
        terrain_length: terrainLength ? Number(terrainLength) : undefined,
        total_area: totalArea ? Number(totalArea) : undefined,
        area_unit: areaUnit,
        terrain_notes: terrainNotes.trim() || undefined,
        status,
        services: services.filter((s) => s.service_id > 0),
        photos: photos.length > 0 ? photos : undefined,
      };

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden text-gray-800 dark:text-gray-100">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {initialInspection?.appointmentId
                ? `Inspección de Cita #${initialInspection.appointmentId}`
                : "Nueva Inspección de Campo"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Registra medidas del terreno, hallazgos, servicios sugeridos y
              fotografías
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del formulario con scroll interno */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-5 text-xs sm:text-sm"
        >
          {/* Datos principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5 font-medium">
              <span>ID Cliente *</span>
              <input
                type="number"
                required
                min={1}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Ej. 1"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-medium">
              <span>ID Cita (opcional)</span>
              <input
                type="number"
                min={1}
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="Ej. 12"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-medium">
              <span>Fecha de Visita *</span>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              />
            </label>
          </div>

          {/* Dimensiones del terreno */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/80 dark:border-gray-700/60 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Dimensiones del Terreno
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex flex-col gap-1 font-medium">
                <span className="text-xs">Ancho</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={terrainWidth}
                  onChange={(e) =>
                    handleDimensionChange(e.target.value, terrainLength)
                  }
                  placeholder="0.00"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
                />
              </label>

              <label className="flex flex-col gap-1 font-medium">
                <span className="text-xs">Largo</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={terrainLength}
                  onChange={(e) =>
                    handleDimensionChange(terrainWidth, e.target.value)
                  }
                  placeholder="0.00"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
                />
              </label>

              <label className="flex flex-col gap-1 font-medium">
                <span className="text-xs">Área Total</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
                />
              </label>

              <label className="flex flex-col gap-1 font-medium">
                <span className="text-xs">Unidad</span>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
                >
                  <option value="m2">m²</option>
                  <option value="v2">v²</option>
                  <option value="ha">Hectáreas (ha)</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 font-medium mt-1">
              <span className="text-xs">
                Notas del Terreno (suelo, acceso, toma de agua)
              </span>
              <input
                type="text"
                value={terrainNotes}
                onChange={(e) => setTerrainNotes(e.target.value)}
                placeholder="Ej. Suelo arcilloso, toma de agua a 10 metros..."
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              />
            </label>
          </div>

          {/* Hallazgos y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="sm:col-span-2 flex flex-col gap-1.5 font-medium">
              <span>Hallazgos y Requerimientos</span>
              <textarea
                rows={3}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Describe el estado actual del jardín, maleza, desniveles y trabajos necesarios..."
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-medium">
              <span>Estado de Inspección</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InspectionStatus)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#6C7D38]"
              >
                <option value="draft">Borrador (draft)</option>
                <option value="submitted">Enviada (submitted)</option>
                <option value="reviewed">Revisada (reviewed)</option>
              </select>
            </label>
          </div>

          {/* Servicios sugeridos */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Servicios Sugeridos para Cotización
              </span>
              <button
                type="button"
                onClick={addServiceRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C7D38] dark:text-[#9ab054] hover:underline cursor-pointer"
              >
                <Plus size={14} /> Agregar servicio
              </button>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No hay servicios sugeridos agregados todavía.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200/70 dark:border-gray-700/60"
                  >
                    <input
                      type="number"
                      min={1}
                      required
                      value={srv.service_id || ""}
                      onChange={(e) =>
                        updateServiceRow(
                          idx,
                          "service_id",
                          Number(e.target.value),
                        )
                      }
                      placeholder="ID Serv."
                      className="col-span-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="number"
                      min={1}
                      required
                      value={srv.suggested_quantity}
                      onChange={(e) =>
                        updateServiceRow(
                          idx,
                          "suggested_quantity",
                          Number(e.target.value),
                        )
                      }
                      placeholder="Cant."
                      className="col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={srv.notes ?? ""}
                      onChange={(e) =>
                        updateServiceRow(idx, "notes", e.target.value)
                      }
                      placeholder="Notas técnicas..."
                      className="col-span-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeServiceRow(idx)}
                      className="col-span-1 flex justify-center text-rose-500 hover:text-rose-700 cursor-pointer"
                      aria-label="Eliminar servicio"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galería / Subida de fotos */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Fotografías de Evidencia (JPEG, PNG, WEBP · máx 10MB)
            </span>
            <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#6C7D38] transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-900/30">
              <Upload size={20} className="text-[#6C7D38]" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Seleccionar imágenes desde el dispositivo
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  setPhotos(e.target.files ? Array.from(e.target.files) : [])
                }
                className="hidden"
              />
            </label>
            {photos.length > 0 && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {photos.length}{" "}
                {photos.length === 1
                  ? "archivo seleccionado"
                  : "archivos seleccionados"}
                : {photos.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>

          {/* Pie del modal */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C7D38] hover:bg-[#5b6a2f] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Guardar Inspección</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
