import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import LogoVergel from "../assets/Logo.png";

export type MenuItem = {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  items: MenuItem[];
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  items,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith("/admin");
  const profilePath = isAdmin ? "/admin/profile" : "/users/profile";
  const isProfileActive = location.pathname.startsWith(profilePath);

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* BOTÓN HAMBURGUESA Y BARRA SUPERIOR (Solo visible en móviles - md:hidden) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#636B2F] dark:bg-zinc-900 border-b border-white/10 dark:border-zinc-800 z-40 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src={LogoVergel} alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <span className="text-white font-semibold text-sm">
          {isAdmin ? "Admin Panel" : "Mi Cuenta"}
        </span>
      </div>

      {/* OVERLAY PARA CERRAR EL MENÚ EN MÓVIL AL HACER CLIC FUERA */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#636B2F] dark:bg-zinc-900 text-white dark:text-zinc-100 p-4 flex flex-col justify-between font-sans shadow-lg transition-all duration-300 z-50 shrink-0 ${
          // Ancho y posicionamiento en Desktop vs Móvil
          isCollapsed ? "md:w-20" : "md:w-64"
        } w-64 ${
          // Ocultar totalmente a la izquierda en móvil cuando está cerrado
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* SECCIÓN SUPERIOR: Header + Navegación */}
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Header / Logo + Botón dinámico */}
          <div className="w-full border-b border-white/10 dark:border-zinc-800 pb-4 pt-1">
            <div
              className={`flex items-center transition-all duration-300 ${
                isCollapsed
                  ? "flex-col justify-center gap-3"
                  : "relative justify-between md:justify-center"
              }`}
            >
              {/* Logo */}
              <div
                className={`flex items-center justify-center transition-all duration-300 ${
                  isCollapsed ? "w-10 h-10" : "w-20 h-20 md:w-28 md:h-28"
                }`}
              >
                <img
                  src={LogoVergel}
                  alt="Vergel Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Botón de cerrar en móvil / colapsar en Desktop */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`hidden md:block p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-zinc-800 transition-colors ${
                    isCollapsed ? "static" : "absolute right-0 top-0"
                  }`}
                  title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen size={20} />
                  ) : (
                    <PanelLeftClose size={20} />
                  )}
                </button>

                {/* Botón de cerrar para vista móvil */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Menú Dinámico con Scroll Independiente */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)} // Cierra el sidebar al hacer clic en móvil
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all text-left text-sm ${
                    isActive
                      ? "bg-white/20 dark:bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-white/90 dark:text-zinc-300 hover:bg-white/10 dark:hover:bg-zinc-800/60 hover:text-white"
                  } ${isCollapsed ? "md:justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={`truncate ${
                      isCollapsed ? "md:hidden" : "inline"
                    }`}
                  >
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* SECCIÓN INFERIOR: Perfil + Logout */}
        <div className="border-t border-white/10 dark:border-zinc-800 pt-4 mt-2">
          <NavLink
            to={profilePath}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? "Mi Perfil" : undefined}
            className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${
              isProfileActive
                ? "bg-white/20 dark:bg-zinc-800 border-white/30 dark:border-zinc-700 text-white font-semibold shadow-sm"
                : "bg-white/5 dark:bg-zinc-800/40 border-transparent hover:bg-white/10 dark:hover:bg-zinc-800 text-white/90 dark:text-zinc-300"
            } ${isCollapsed ? "md:justify-center" : "justify-between"}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-zinc-700 flex items-center justify-center shrink-0 border border-white/30 dark:border-zinc-600">
                <User className="w-5 h-5 text-white" />
              </div>

              <div
                className={`flex flex-col min-w-0 ${
                  isCollapsed ? "md:hidden" : "flex"
                }`}
              >
                <span className="text-sm font-semibold truncate text-white dark:text-zinc-100">
                  {isAdmin ? "Admin Vergel" : "Usuario Vergel"}
                </span>
                <span className="text-xs text-white/70 dark:text-zinc-400 truncate">
                  {isAdmin ? "admin@vergel.com" : "usuario@vergel.com"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`p-1.5 text-white/70 dark:text-zinc-400 hover:text-white dark:hover:text-zinc-100 hover:bg-white/10 dark:hover:bg-zinc-700 rounded-lg transition-colors shrink-0 ${
                isCollapsed ? "md:hidden" : "block"
              }`}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </NavLink>
        </div>
      </aside>
    </>
  );
}