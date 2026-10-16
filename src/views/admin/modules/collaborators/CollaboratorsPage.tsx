// src/views/admin/modules/collaborators/CollaboratorsPage.tsx
import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import Button from "../../../../components/Button";
import Form, { type CollaboratorData } from "./Form";

interface Collaborator extends CollaboratorData {
  id: number;
  initials: string;
}

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 1,
    name: "Mateo Torres",
    role: "Jardinero",
    phone: "+51 987 654 321",
    email: "mateo.torres@verdecito.com",
    zone: "Lima Central",
    status: "Activo",
    initials: "MT",
  },
  {
    id: 2,
    name: "Sofía Rojas",
    role: "Inspector",
    phone: "+51 981 123 456",
    email: "sofia.rojas@verdecito.com",
    zone: "Surco - Miraflores",
    status: "Activo",
    initials: "SR",
  },
  {
    id: 3,
    name: "Andrés Gómez",
    role: "Inspector",
    phone: "+51 912 345 678",
    email: "andres.gomez@verdecito.com",
    zone: "Norte Provincias",
    status: "Inactivo",
    initials: "AG",
  },
];

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    INITIAL_COLLABORATORS,
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar la modal del formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<Collaborator | null>(null);

  // Filtrado dinámico por nombre, rol o email
  const filteredCollaborators = collaborators.filter(
    (collab) =>
      collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Abrir Modal para Agregar Nuevo
  const handleOpenAddModal = () => {
    setSelectedCollaborator(null);
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Existente
  const handleOpenEditModal = (collab: Collaborator) => {
    setSelectedCollaborator(collab);
    setIsModalOpen(true);
  };

  // Guardar Cambios (Crea o Actualiza)
  const handleSaveCollaborator = (data: CollaboratorData) => {
    if (selectedCollaborator) {
      // Editar
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === selectedCollaborator.id
            ? {
                ...c,
                ...data,
                initials: data.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
              }
            : c,
        ),
      );
    } else {
      // Crear
      const newCollab: Collaborator = {
        ...data,
        id: Date.now(),
        initials: data.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      };
      setCollaborators((prev) => [...prev, newCollab]);
    }
  };

  // Eliminar Colaborador
  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este colaborador?")) {
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Gestión de Colaboradores
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Organiza tu equipo, asigna roles de campo y controla sus accesos.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenAddModal}
          style={{ backgroundColor: "#6C7D38", color: "#FFFFFF" }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm shadow-sm hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Agregar</span>
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#586A27]"
          />
        </div>
      </div>

      {/* Tabla Adaptable y Responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Colaborador</th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Contacto
                </th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                  Zona de Trabajo
                </th>
                <th className="py-4 px-4 sm:px-6">Estado</th>
                <th className="py-4 px-4 sm:px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs sm:text-sm">
              {filteredCollaborators.length > 0 ? (
                filteredCollaborators.map((collab) => (
                  <tr
                    key={collab.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Nombre e Iniciales */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {collab.initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {collab.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {collab.role}
                          </p>
                          {/* Datos visibles solo en pantallas pequeñas */}
                          <p className="text-[11px] text-gray-400 md:hidden mt-0.5">
                            {collab.phone} • {collab.zone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Teléfono y Email (Tablets / Desktops) */}
                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {collab.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          {collab.email}
                        </span>
                      </div>
                    </td>

                    {/* Zona (Desktops) */}
                    <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {collab.zone}
                      </span>
                    </td>

                    {/* Badge de Estado */}
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          collab.status === "Activo"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {collab.status}
                      </span>
                    </td>

                    {/* Botones de Acción */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(collab)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#586A27] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title="Editar colaborador"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(collab.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron colaboradores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal que renderiza el Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[500px]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <Form
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveCollaborator}
              initialData={selectedCollaborator}
            />
          </div>
        </div>
      )}
    </div>
  );
}
