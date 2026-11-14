// src/components/Toast.tsx
import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Duración en milisegundos (por defecto 4000ms)
}

export default function Toast({
  type,
  message,
  isOpen,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose, message, type]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isInfo = type === "info";

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all animate-bounce-in max-w-sm sm:max-w-md w-full bg-white/90 dark:bg-gray-800/90 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100">
      {/* Icono según el tipo */}
      <div className="shrink-0">
        {isSuccess ? (
          <CheckCircle2
            className="text-emerald-600 dark:text-emerald-400"
            size={20}
          />
        ) : isInfo ? (
          <Info className="text-sky-600 dark:text-sky-400" size={20} />
        ) : (
          <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
        )}
      </div>

      {/* Mensaje */}
      <p className="text-xs sm:text-sm font-medium grow line-clamp-2">
        {message}
      </p>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 cursor-pointer"
        title="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
