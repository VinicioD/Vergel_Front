// src/views/admin/modules/users/UsersPage.tsx
import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  FileDown,
} from "lucide-react";
import SearchableSelect, {
  type SelectOption,
} from "../../../../components/SearchableSelect";

interface User {
  id: string;
  code: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: "Activo" | "Inactivo" | "Pendiente";
  joinedDate: string;
}

const ROLE_OPTIONS: SelectOption[] = [
  { label: "Todos los roles", value: "ALL" },
  { label: "Administrador", value: "Administrador" },
  { label: "Inspector de Campo", value: "Inspector de Campo" },
  { label: "Jefe de Inspectores", value: "Jefe de Inspectores" },
  { label: "Asistente", value: "Asistente" },
];

const MOCK_USERS: User[] = [
  {
    id: "1",
    code: "USR-2026-001",
    name: "Carlos Huerta",
    email: "carlos.huerta@empresa.com",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    role: "Administrador",
    status: "Activo",
    joinedDate: "15 Ene 2024",
  },
  {
    id: "2",
    code: "USR-2026-002",
    name: "Lucía Mendoza",
    email: "lucia.mendoza@empresa.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    role: "Asistente",
    status: "Activo",
    joinedDate: "20 Mar 2024",
  },
  {
    id: "3",
    code: "USR-2026-003",
    name: "Raúl Torres",
    email: "raul.torres@empresa.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    role: "Jefe de Inspectores",
    status: "Activo",
    joinedDate: "10 Jun 2024",
  },
  {
    id: "4",
    code: "USR-2026-004",
    name: "María José Delgado",
    email: "maria.delgado@empresa.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
    role: "Inspector de Campo",
    status: "Inactivo",
    joinedDate: "05 Sep 2024",
  },
  {
    id: "5",
    code: "USR-2026-005",
    name: "Fernando Gómez",
    email: "fernando.gomez@empresa.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    role: "Inspector de Campo",
    status: "Pendiente",
    joinedDate: "12 Ago 2026",
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Estilos dinámicos para los badges de estado
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "Activo":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "Inactivo":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
      case "Pendiente":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER DE LA VISTA */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra accesos, roles y perfiles del personal de la plataforma
          </p>
        </div>

        {/* Tarjeta de Usuario Actual */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 pr-4 sm:pr-5 rounded-full border border-gray-200/80 dark:border-gray-700 shadow-sm self-end sm:self-auto">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
            alt="Carlos Huerta"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Carlos Huerta
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Administrador
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS Y ACCIONES SUPERIORES */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Buscador de usuario */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm transition-all"
            />
          </div>

          {/* Filtro por Rol */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <SearchableSelect
              label="Rol"
              options={ROLE_OPTIONS}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
            />
          </div>
        </div>

        {/* Botones de Exportar y Crear */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Exportar Lista</span>
          </button>

          <button
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA (CON SCROLL HORIZONTAL EN MÓVIL) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">CÓDIGO</th>
                <th className="py-4 px-6">USUARIO</th>
                <th className="py-4 px-6">ROL</th>
                <th className="py-4 px-6">FECHA REGISTRO</th>
                <th className="py-4 px-6">ESTADO</th>
                <th className="py-4 px-6 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
              {MOCK_USERS.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                >
                  {/* CÓDIGO */}
                  <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {user.code}
                  </td>

                  {/* AVATAR + NOMBRE Y CORREO */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ROL */}
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {user.role}
                  </td>

                  {/* FECHA REGISTRO */}
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {user.joinedDate}
                  </td>

                  {/* ESTADO BADGE */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                        user.status,
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* BOTONES DE ACCIÓN */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver */}
                      <button
                        title="Ver detalles"
                        type="button"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#5b642a] dark:hover:text-[#7c8839] hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Editar */}
                      <button
                        title="Editar usuario"
                        type="button"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Descargar Ficha */}
                      <button
                        title="Descargar Ficha PDF"
                        type="button"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <FileDown size={16} />
                      </button>

                      {/* Eliminar */}
                      <button
                        title="Eliminar usuario"
                        type="button"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Mostrando 5 de 24 usuarios
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              currentPage === 1
                ? "bg-[#5b642a] text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            1
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              currentPage === 2
                ? "bg-[#5b642a] text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            2
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
