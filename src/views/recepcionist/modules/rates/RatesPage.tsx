import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import Table, { type Column } from "../../../../components/Table";

interface Rate {
  id: string;
  service: string;
  description: string;
  unit: string;
  base: string;
  premium: string;
}

type RateDraft = Omit<Rate, "id">;

const INITIAL_RATES: Rate[] = [
  {
    id: "1",
    service: "Poda de árboles",
    description: "Poda de formación, reducción de copa y despeje",
    unit: "Por Árbol",
    base: "$45.00",
    premium: "$65.00",
  },
  {
    id: "2",
    service: "Diseño de jardín",
    description: "Plano paisajista conceptual en 3D y especies",
    unit: "Por Proyecto",
    base: "$350.00",
    premium: "$600.00",
  },
  {
    id: "3",
    service: "Fumigación",
    description: "Control integrado de plagas, ácaros y cochinillas",
    unit: "M² Terreno",
    base: "$1.20",
    premium: "$2.00",
  },
  {
    id: "4",
    service: "Mantenimiento mensual",
    description: "Poda de césped, control de malezas y abono",
    unit: "Mensual",
    base: "$120.00",
    premium: "$180.00",
  },
  {
    id: "5",
    service: "Riego automatizado",
    description: "Instalación de controladores y líneas de goteo",
    unit: "Por Estación",
    base: "$150.00",
    premium: "$250.00",
  },
  {
    id: "6",
    service: "Consultoría paisajística",
    description: "Inspección técnica de sanidad vegetal y riego",
    unit: "Por Sesión",
    base: "$80.00",
    premium: "$120.00",
  },
];

const EMPTY_DRAFT: RateDraft = {
  service: "",
  description: "",
  unit: "",
  base: "",
  premium: "",
};

export default function RatesPage() {
  const [rates, setRates] = useState(INITIAL_RATES);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState<RateDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingRate, setDeletingRate] = useState<Rate | null>(null);

  const filteredRates = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("es");
    if (!query) return rates;
    return rates.filter((rate) =>
      [rate.service, rate.description, rate.unit].some((value) =>
        value.toLocaleLowerCase("es").includes(query),
      ),
    );
  }, [rates, searchTerm]);

  const openNewRate = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setIsEditorOpen(true);
  };

  const openEditRate = (rate: Rate) => {
    setEditingId(rate.id);
    setIsEditorOpen(true);
    setDraft({
      service: rate.service,
      description: rate.description,
      unit: rate.unit,
      base: rate.base.replace(/[^0-9.]/g, ""),
      premium: rate.premium.replace(/[^0-9.]/g, ""),
    });
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const saveRate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rateData: RateDraft = {
      ...draft,
      service: draft.service.trim(),
      description: draft.description.trim(),
      unit: draft.unit.trim(),
      base: `$${Number(draft.base).toFixed(2)}`,
      premium: `$${Number(draft.premium).toFixed(2)}`,
    };

    if (editingId) {
      setRates((current) =>
        current.map((rate) =>
          rate.id === editingId ? { ...rate, ...rateData } : rate,
        ),
      );
    } else {
      setRates((current) => [
        ...current,
        { id: `rate-${Date.now()}`, ...rateData },
      ]);
      setCurrentPage(1);
    }
    closeEditor();
  };

  const deleteRate = () => {
    if (!deletingRate) return;
    setRates((current) =>
      current.filter((rate) => rate.id !== deletingRate.id),
    );
    setDeletingRate(null);
  };

  const columns: Column<Rate>[] = [
    {
      header: "Servicio",
      accessorKey: "service",
      className: "whitespace-nowrap font-bold text-[#30321f] dark:text-gray-100",
    },
    {
      header: "Descripción",
      accessorKey: "description",
      className: "min-w-[240px] text-gray-500 dark:text-gray-400",
    },
    {
      header: "Unidad",
      accessorKey: "unit",
      className: "whitespace-nowrap text-gray-500 dark:text-gray-400",
    },
    {
      header: "Base",
      accessorKey: "base",
      className: "whitespace-nowrap text-right font-bold text-[#30321f] dark:text-gray-100",
    },
    {
      header: "Premium",
      accessorKey: "premium",
      className: "whitespace-nowrap text-right font-bold text-[#626b2c] dark:text-[#a3b366]",
    },
    {
      header: "Acciones",
      className: "whitespace-nowrap",
      render: (rate) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditRate(rate)}
            className="rounded-md bg-[#e2f0dc] px-2.5 py-1 text-xs font-semibold text-[#35623a] transition-colors hover:bg-[#d2e8c9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35623a]"
            aria-label={`Editar tarifa ${rate.service}`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setDeletingRate(rate)}
            className="rounded-md bg-[#fde3d7] px-2.5 py-1 text-xs font-semibold text-[#c91c10] transition-colors hover:bg-[#fbd3c2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c91c10]"
            aria-label={`Eliminar tarifa ${rate.service}`}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-5 p-4 font-sans sm:gap-6 sm:p-6">
      <header className="border-b border-[#ded8cc] pb-4 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-[#30321f] dark:text-gray-100 sm:text-3xl">
          Gestión de Tarifas
        </h1>
        <p className="mt-1 text-sm text-[#777965] dark:text-gray-400">
          Actualización de precios base y ofertas de servicios
        </p>
      </header>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input
            icon={Search}
            aria-label="Buscar tarifa por servicio"
            placeholder="Buscar tarifa por servicio..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-[10px] border-[#e4ded4] placeholder:text-[#777965]"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          icon={Plus}
          onClick={openNewRate}
          className="w-full justify-center rounded-xl bg-[#626b2c] px-5 py-3 hover:bg-[#525b23] sm:w-auto"
        >
          Nueva Tarifa
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Table
          data={filteredRates}
          columns={columns}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          entityName="tarifas"
          itemsPerPage={10}
        />
      </div>

      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <form
            onSubmit={saveRate}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rate-editor-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="rate-editor-title"
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
              >
                {editingId ? "Editar tarifa" : "Nueva tarifa"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Servicio
                <Input
                  required
                  autoFocus
                  value={draft.service}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      service: event.target.value,
                    }))
                  }
                  placeholder="Nombre del servicio"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
                <Input
                  required
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Descripción del servicio"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unidad
                  <Input
                    required
                    value={draft.unit}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                    placeholder="Por sesión"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio base
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.base}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        base: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio premium
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.premium}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        premium: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditor}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingId ? "Guardar cambios" : "Crear tarifa"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {deletingRate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeletingRate(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-rate-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <h2
              id="delete-rate-title"
              className="text-lg font-bold text-gray-900 dark:text-gray-100"
            >
              Eliminar tarifa
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              ¿Deseas eliminar la tarifa “{deletingRate.service}”? Esta acción
              no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingRate(null)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={deleteRate}
                className="rounded-xl bg-[#c91c10] hover:bg-[#aa180e]"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
