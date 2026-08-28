import React, { useState } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

interface FormProps {
  onClose?: () => void;
}

export const Form: React.FC<FormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    price: '',
    category: 'Interiores'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Planta guardada:', formData);
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-[450px] p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#2A3319] dark:text-gray-100 mt-0 mb-6">
        Agregar Nueva Planta
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre Común
          </label>
          <Input 
            type="text" 
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre Científico
          </label>
          <Input 
            type="text" 
            value={formData.scientificName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, scientificName: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Precio ($)
          </label>
          <Input 
            type="text" 
            value={formData.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
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
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;