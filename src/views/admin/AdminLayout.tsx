// src/views/admin/AdminLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../config/menuConfig";
import { LayoutDashboard } from "lucide-react";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Unimos el Dashboard con las opciones que definiste en menuConfig
  const fullAdminMenu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    ...adminMenu,
  ];

  return (
    <div className="min-h-screen flex bg-[#F4EFE6] dark:bg-gray-900 font-sans transition-colors">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        items={fullAdminMenu}
      />

      <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6 overflow-y-auto min-w-0 transition-all">
        <Outlet />
      </main>
    </div>
  );
}
