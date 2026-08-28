// src/views/admin/modules/collaborators/Form.tsx
import React, { useState, useEffect } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

export interface CollaboratorData {
  id?: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  zone: string;
  status: 'Activo' | 'Inactivo';
}

interface FormProps {
  onClose?: () => void;
  onSave?: (data: CollaboratorData) => void;
  initialData?: CollaboratorData | null;
}

export const Form: React.FC<FormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<CollaboratorData>({
    name: '',
    role: '',
    phone: '',
    email: '',
    zone: '',
    status: 'Activo',
  });

  // Si se pasa 'initialData', se precargan los campos (modo edición)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        role: '',
        phone: '',
        email: '',
        zone: '',
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
        {initialData ? 'Editar Colaborador' : 'Agregar Nuevo Colaborador'}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nombre Completo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre Completo *
          </label>
          <Input 
            type="text" 
            required
            placeholder="Ej. Mateo Torres"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* Cargo y Zona (Grid Adaptable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Cargo / Rol *
            </label>
            <Input 
              type="text" 
              required
              placeholder="Ej. Jardinero"
              value={formData.role}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, role: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Zona Asignada
            </label>
            <Input 
              type="text" 
              placeholder="Ej. Lima Central"
              value={formData.zone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, zone: e.target.value})}
            />
          </div>
        </div>

        {/* Teléfono y Email (Grid Adaptable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico *
            </label>
            <Input 
              type="email" 
              required
              placeholder="correo@verdecito.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Seleccionar Estado */}
        <div className="flex flex-col gap-1 pt-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado
          </label>
          <div className="flex items-center gap-4 mt-1">
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input 
                type="radio" 
                name="status"
                value="Activo" 
                checked={formData.status === 'Activo'}
                onChange={() => setFormData({...formData, status: 'Activo'})}
                className="accent-[#586A27]"
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input 
                type="radio" 
                name="status"
                value="Inactivo" 
                checked={formData.status === 'Inactivo'}
                onChange={() => setFormData({...formData, status: 'Inactivo'})}
                className="accent-[#586A27]"
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
            style={{ backgroundColor: '#586A27', color: '#FFF' }}
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