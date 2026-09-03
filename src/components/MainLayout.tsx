// src/components/MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { type MenuItem } from "./Sidebar";

interface MainLayoutProps {
  items: MenuItem[];
}

export default function MainLayout({ items }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar con el menú móvil y desktop */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        items={items}
      />

      {/* Contenido Principal con el padding superior compensatorio en móvil */}
      <main className="flex-1 pt-16 md:pt-0 min-w-0 transition-all">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}