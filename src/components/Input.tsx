// src/components/Input.tsx
import React, { type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export default function Input({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label adaptable */}
      {label && (
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wide transition-colors">
          {label}
        </label>
      )}

      {/* Contenedor del Input */}
      <div className="relative flex items-center w-full">
        {/* Ícono adaptable */}
        {Icon && (
          <Icon className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none shrink-0" />
        )}

        <input
          {...props}
          className={`w-full py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-1 ${
            /* Colores Base (Claro) vs Dark */
            "bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800/90 dark:text-gray-100 dark:placeholder-gray-500"
          } ${Icon ? "pl-10 pr-4" : "px-4"} ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
              : "border-gray-300 focus:border-[#5b642a] focus:ring-[#5b642a] dark:border-gray-700 dark:focus:border-[#7c8839] dark:focus:ring-[#7c8839]"
          } ${className}`}
        />
      </div>

      {/* Mensaje de Error */}
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
