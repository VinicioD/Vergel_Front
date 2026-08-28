// src/views/admin/modules/profile/Form.tsx
import React, { useState, useEffect } from 'react';
import { Upload, Sun, Moon, Check } from 'lucide-react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

// Componente FileUpload Reutilizable
export interface FileUploadProps {
  fileName?: string;
  hint?: string;
  onFileSelect?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  fileName = 'Logotipo_Verdecito.png',
  hint = 'PNG, JPG de hasta 5MB. Recomendado 400x400px.',
  onFileSelect,
}) => {
  const [selectedName, setSelectedName] = useState(fileName);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-[#EFECE6] dark:bg-gray-900/60 border border-transparent hover:border-[#6C7D38]/40 transition-all cursor-pointer group">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-[#6C7D38] dark:group-hover:text-emerald-400 shadow-sm transition-colors shrink-0">
        <Upload size={20} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {selectedName}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
          {hint}
        </span>
      </div>
    </div>
  );
};

// Componente Form Principal
export interface CompanyProfileData {
  companyName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
}

export const Form: React.FC = () => {
  const [formData, setFormData] = useState<CompanyProfileData>({
    companyName: 'Verdecito S.A.C.',
    ruc: '20601234567',
    address: 'Av. Primavera 1280, Of. 402 - Santiago de Surco, Lima',
    phone: '(01) 456-7890',
    email: 'contacto@verdecito.pe',
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Detectar y sincronizar con la clase 'dark' en el <html>
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = (mode: 'light' | 'dark') => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/60 shadow-sm transition-colors duration-300">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Perfil de Empresa
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nombre de Empresa y RUC */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Nombre de Empresa
            </label>
            <Input
              type="text"
              required
              value={formData.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              RUC
            </label>
            <Input
              type="text"
              required
              value={formData.ruc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, ruc: e.target.value })
              }
            />
          </div>
        </div>

        {/* Dirección Fiscal */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Dirección Fiscal
          </label>
          <Input
            type="text"
            required
            value={formData.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Teléfono Corporativo
            </label>
            <Input
              type="text"
              required
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email de Contacto
            </label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* Logo de la Empresa usando FileUpload */}
        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Logo de la Empresa
          </label>
          <FileUpload />
        </div>

        {/* Selector de Modo Claro / Oscuro */}
        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Tema de la Interfaz
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => toggleTheme('light')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                !isDarkMode
                  ? 'bg-[#6C7D38]/10 border-[#6C7D38] text-[#6C7D38] dark:text-emerald-400 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Sun size={16} />
              <span>Modo Claro</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTheme('dark')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#6C7D38]/10 border-[#6C7D38] text-[#6C7D38] dark:text-emerald-400 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Moon size={16} />
              <span>Modo Oscuro</span>
            </button>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            type="submit"
            style={{ backgroundColor: '#4D5A27', color: '#FFF' }}
            className="px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm"
          >
            Guardar Cambios
          </Button>
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={16} /> Cambios guardados correctamente
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;