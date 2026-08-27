// src/components/PasswordInputWithRequirements.tsx
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  showRequirements?: boolean;
}

export default function PasswordInputWithRequirements({
  label = "Contraseña",
  value,
  onChange,
  showRequirements = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
  };

  const requirements = [
    { label: "Mínimo 8 caracteres", met: checks.length },
    { label: "Una letra mayúscula (A-Z)", met: checks.upper },
    { label: "Una letra minúscula (a-z)", met: checks.lower },
    { label: "Un número (0-9)", met: checks.number },
    { label: "Un carácter especial (@, #, $, %)", met: checks.special },
  ];

  return (
    <div className="flex flex-col gap-1.5 font-sans w-full">
      {label && (
        <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Input con Toggle */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-2xl text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#5b642a] dark:focus:border-[#7c8839] transition-all pr-10 shadow-sm"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Lista de Requisitos */}
      {showRequirements && value.length > 0 && (
        <div className="p-3 mt-1 bg-[#F4EFE6]/50 dark:bg-gray-800/60 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 space-y-1.5 text-xs transition-all">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-[11px]">
            Requisitos de seguridad:
          </p>
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 transition-colors text-[11px] ${
                req.met
                  ? "text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {req.met ? (
                <Check
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0"
                />
              ) : (
                <X
                  size={14}
                  className="text-gray-400 dark:text-gray-500 shrink-0"
                />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
