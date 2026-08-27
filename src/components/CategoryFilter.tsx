// src/components/CategoryFilter.tsx
import React from "react";

export interface CategoryOption {
  label: string;
  value: string;
}

interface CategoryFilterProps {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryFilter({
  options,
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 font-sans">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all duration-200 focus:outline-none ${
              isActive
                ? "bg-[#5b642a] text-white shadow-sm"
                : "bg-[#F4EFE6] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
