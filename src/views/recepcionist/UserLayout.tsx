// src/views/recepcionist/UserLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { recepcionistMenu } from "../../config/menuConfig";
import { LayoutDashboard } from "lucide-react";

export default function UserLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Unimos el Dashboard del recepcionista con sus opciones de menuConfig
  const fullRecepcionistMenu = [
    { name: "Inicio", icon: LayoutDashboard, path: "/recepcionist/dashboard" },
    ...recepcionistMenu,
  ];

  return (
    <div className="min-h-screen flex bg-[#F4EFE6] dark:bg-gray-900 font-sans transition-colors">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        items={fullRecepcionistMenu}
      />

      <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6 overflow-y-auto min-w-0 transition-all">
        <Outlet />
      </main>
    </div>
  );
}
