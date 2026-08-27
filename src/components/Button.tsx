// src/components/Button.tsx
import React, { type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  icon?: LucideIcon;
}

export default function Button({
  children,
  variant = "primary",
  icon: Icon,
  className = "",
  ...props
}: ButtonProps) {
  // Definición de estilos por variante (Light + Dark Mode)
  const variants = {
    primary:
      "bg-[#5b642a] hover:bg-[#4a5222] text-white shadow-sm dark:bg-[#5b642a] dark:hover:bg-[#6c7732]",
    outline:
      "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-900 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5b642a] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} className="shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
