// src/views/admin/modules/clients/ClientsPage.tsx
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';
import Form, { type ClientData } from './Form';

interface Client extends ClientData {
  id: number;
  initials: string;
}

const INITIAL_CLIENTS: Client[] = [
  {
    id: 1,
    name: 'Condominio Los Olivos',
    clientType: 'Corporativo',
    phone: '+51 987 111 222',
    email: 'administracion@losolivos.pe',
    address: 'Av. Las Flores 450, San Isidro',
    status: 'Activo',
    initials: 'CL',
  },
  {
    id: 2,
    name: 'María García',
    clientType: 'Residencial',
    phone: '+51 981 333 444',
    email: 'maria.garcia@gmail.com',
    address: 'Calle Los Pinos 120, Miraflores',
    status: 'Activo',
    initials: 'MG',
  },
  {
    id: 3,
    name: 'Corporación GreenOffice',
    clientType: 'Corporativo',
    phone: '+51 912 555 666',
    email: 'contacto@greenoffice.com',
    address: 'Av. Javier Prado Este 2050, San Borja',
    status: 'Inactivo',
    initials: 'CG',
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = (data: ClientData) => {
    if (selectedClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                ...data,
                initials: data.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
              }
            : c
        )
      );
    } else {
      const newClient: Client = {
        ...data,
        id: Date.now(),
        initials: data.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      };
      setClients((prev) => [...prev, newClient]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f5f0] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      {/* Encabezado y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Gestión de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Administra tus clientes residenciales y corporativos.
          </p>
        </div>

        {/* Botón Píldora corregido con tag nativo button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6C7D38] hover:bg-[#5b6a2f] text-white font-medium text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <span>Agregar Cliente</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, tipo o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C7D38]"
          />
        </div>
      </div>

      {/* Tabla Adaptable */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Cliente</th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">Contacto</th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">Dirección</th>
                <th className="py-4 px-4 sm:px-6">Estado</th>
                <th className="py-4 px-4 sm:px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs sm:text-sm">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {client.initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {client.clientType}
                          </p>
                          <p className="text-[11px] text-gray-400 md:hidden mt-0.5">
                            {client.phone} • {client.address}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-gray-600 dark:text-gray-300 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {client.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          {client.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {client.address}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          client.status === 'Activo'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(client)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#6C7D38] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Eliminar cliente"
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
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              onSave={handleSaveClient}
              initialData={selectedClient}
            />
          </div>
        </div>
      )}
    </div>
  );
}