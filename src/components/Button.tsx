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
      "bg-[#6C7D38] hover:bg-[#5b6a2f] dark:bg-[#8A9F48] dark:hover:bg-[#7A8D40] text-white shadow-sm focus:ring-[#6C7D38]",
    outline:
      "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-900 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-sm focus:ring-zinc-400 dark:focus:ring-zinc-600",
    ghost:
      "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 focus:ring-zinc-300 dark:focus:ring-zinc-700",
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
