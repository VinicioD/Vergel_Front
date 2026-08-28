// src/views/admin/modules/clients/Form.tsx
import React, { useState, useEffect } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export interface ClientData {
  id?: number;
  name: string;
  clientType: 'Residencial' | 'Corporativo';
  phone: string;
  email: string;
  address: string;
  status: 'Activo' | 'Inactivo';
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: ClientData) => void;
  initialData?: ClientData | null;
}

export const Form: React.FC<FormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    clientType: 'Residencial',
    phone: '',
    email: '',
    address: '',
    status: 'Activo',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        clientType: 'Residencial',
        phone: '',
        email: '',
        address: '',
        status: 'Activo',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-[500px] p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#2A3319] dark:text-gray-100 mt-0 mb-6">
        {initialData ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nombre del Cliente */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre / Empresa *
          </label>
          <Input 
            type="text" 
            required
            placeholder="Ej. Condominio Los Olivos"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* Tipo de Cliente y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Cliente *
            </label>
            <select
              value={formData.clientType}
              onChange={(e) => setFormData({...formData, clientType: e.target.value as 'Residencial' | 'Corporativo'})}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C7D38]"
            >
              <option value="Residencial">Residencial</option>
              <option value="Corporativo">Corporativo</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Teléfono *
            </label>
            <Input 
              type="text" 
              required
              placeholder="+51 987 654 321"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Correo Electrónico *
          </label>
          <Input 
            type="email" 
            required
            placeholder="contacto@empresa.com"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        {/* Dirección */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Dirección / Ubicación
          </label>
          <Input 
            type="text" 
            placeholder="Ej. Av. Primavera 123, Surco"
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1 pt-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado
          </label>
          <div className="flex items-center gap-4 mt-1">
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input 
                type="radio" 
                name="clientStatus"
                value="Activo" 
                checked={formData.status === 'Activo'}
                onChange={() => setFormData({...formData, status: 'Activo'})}
                className="accent-[#6C7D38]"
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input 
                type="radio" 
                name="clientStatus"
                value="Inactivo" 
                checked={formData.status === 'Inactivo'}
                onChange={() => setFormData({...formData, status: 'Inactivo'})}
                className="accent-[#6C7D38]"
              />
              Inactivo
            </label>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          {onClose && (
            <Button 
              type="button" 
              onClick={onClose} 
              style={{ backgroundColor: '#CCC', color: '#333' }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            style={{ backgroundColor: '#6C7D38', color: '#FFF' }}
            className="w-full sm:w-auto"
          >
            {initialData ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;