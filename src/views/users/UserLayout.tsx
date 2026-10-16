// src/views/users/UserLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { userMenu } from "../../config/menuConfig";
import { LayoutDashboard } from "lucide-react";

export default function UserLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Unimos el Dashboard del usuario con sus opciones de menuConfig
  const fullUserMenu = [
    { name: "Inicio", icon: LayoutDashboard, path: "/users/dashboard" },
    ...userMenu,
  ];

  return (
    <div className="min-h-screen flex bg-[#F4EFE6] dark:bg-gray-900 font-sans transition-colors">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        items={fullUserMenu}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
