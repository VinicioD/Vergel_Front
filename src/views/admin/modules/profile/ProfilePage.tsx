// src/views/admin/modules/profile/ProfilePage.tsx
import React, { useState } from "react";
import Form from "./Form";

export interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    { id: "profile", label: "Perfil de Empresa" },
    { id: "notifications", label: "Notificaciones" },
    { id: "billing", label: "Facturación" },
    { id: "integrations", label: "Integraciones" },
    { id: "security", label: "Seguridad" },
  ];

  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left cursor-pointer ${
              isActive
                ? "bg-[#6C7D38] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen w-full bg-transparent dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Encabezado */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
          Configuración del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ajusta los detalles organizacionales, perfiles de facturación y
          accesos globales
        </p>
      </div>

      {/* Disposición de 2 columnas: Sidebar + Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SettingsSidebar */}
        <div className="lg:col-span-3">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Panel de Contenido */}
        <div className="lg:col-span-9">
          {activeTab === "profile" && <Form />}

          {activeTab !== "profile" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700/60 shadow-sm text-center">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 capitalize mb-1">
                Sección: {activeTab}
              </h3>
              <p className="text-xs text-gray-400">
                Ajustes de {activeTab} disponibles en la próxima versión.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
