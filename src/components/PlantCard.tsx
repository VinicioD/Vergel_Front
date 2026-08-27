// src/components/PlantCard.tsx
import React from "react";

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  price: string;
  imageUrl: string;
}

interface PlantCardProps {
  plant: Plant;
  onViewDetails?: (plant: Plant) => void;
}

export default function PlantCard({ plant, onViewDetails }: PlantCardProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col font-sans">
      {/* Imagen */}
      <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {plant.name}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
              {plant.category}
            </span>
          </div>
          <p className="text-xs italic text-gray-400 dark:text-gray-500">
            {plant.scientificName}
          </p>
        </div>

        <hr className="border-gray-100 dark:border-gray-700/60" />

        {/* Precio y Acción */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#3a3d20] dark:text-gray-100">
            {plant.price}
          </span>
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(plant)}
            className="text-xs font-bold text-[#5b642a] dark:text-[#7c8839] hover:underline transition-all"
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
