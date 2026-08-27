// src/components/FileUpload.tsx
import React from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  label?: string;
  fileName?: string;
  hint?: string;
  onFileSelect?: (file: File) => void;
}

export default function FileUpload({
  label = "Logo de la Empresa",
  fileName = "Logotipo_Verdecito.png",
  hint = "PNG, JPG de hasta 5MB. Recomendado 400x400px.",
  onFileSelect,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileSelect) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 font-sans w-full">
      {label && (
        <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      <label className="relative flex items-center gap-4 p-4 bg-[#F4EFE6]/60 dark:bg-gray-800/80 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-[#5b642a] dark:hover:border-[#7c8839] transition-all group">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Ícono contenedor */}
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm text-gray-400 group-hover:text-[#5b642a] transition-colors">
          <ImageIcon size={20} />
        </div>

        {/* Detalles del Archivo */}
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
            {fileName}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {hint}
          </span>
        </div>
      </label>
    </div>
  );
}
