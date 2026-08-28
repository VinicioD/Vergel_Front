// src/views/admin/modules/catalog/CatalogPage.tsx
import React, { useState } from "react";
import { Search, Plus, Filter, LayoutGrid, List } from "lucide-react";

// Datos de ejemplo para el catálogo
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Macetas de Barro Artesanales",
    category: "Macetas",
    price: "$15.00",
    stock: 24,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Set de Herramientas de Jardín",
    category: "Herramientas",
    price: "$28.50",
    stock: 12,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Planta Monstruosa (Deliciosa)",
    category: "Plantas",
    price: "$22.00",
    stock: 8,
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Regadera de Metal Vintage",
    category: "Accesorios",
    price: "$18.99",
    stock: 15,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500&auto=format&fit=crop",
  },
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", "Macetas", "Herramientas", "Plantas", "Accesorios"];

  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
            Catálogo de Productos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra e inspecciona todos los productos de tu inventario
          </p>
        </div>

        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5d682e] hover:bg-[#4d5626] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all cursor-pointer">
          <Plus size={18} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda Responsive */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5d682e]"
          />
        </div>

        {/* Categorías deslizables horizontalmente en celulares */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter size={16} className="text-gray-400 shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#5d682e] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Adaptable de Productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Imagen con Aspect Ratio controlado */}
                <div className="w-full h-48 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider shadow-sm">
                    {product.category}
                  </span>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Stock disponible: <span className="font-semibold text-gray-700 dark:text-gray-300">{product.stock} unids.</span>
                  </p>
                </div>
              </div>

              {/* Pie de la tarjeta */}
              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 mt-2">
                <span className="text-base sm:text-lg font-bold text-[#5d682e] dark:text-[#a0b05b]">
                  {product.price}
                </span>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-[#5d682e] text-[#5d682e] dark:border-[#a0b05b] dark:text-[#a0b05b] hover:bg-[#5d682e] hover:text-white dark:hover:bg-[#a0b05b] dark:hover:text-gray-900 font-medium transition-all cursor-pointer">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado Vacío / Sin Resultados */
        <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
            No se encontraron productos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Intenta cambiar los términos de búsqueda o los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}