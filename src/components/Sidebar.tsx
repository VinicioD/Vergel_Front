import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";
import LogoVergel from "../assets/Logo.png";

export interface MenuItem {
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
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta si estamos en el modulo admin o users para saber a qué perfil ir
  const isAdmin = location.pathname.startsWith("/admin");
  const profilePath = isAdmin ? "/admin/profile" : "/users/profile";
  const isProfileActive = location.pathname.startsWith(profilePath);

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que al dar clic en salir nos navegue al perfil
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside
      className={`sticky top-0 h-screen bg-[#636B2F] text-white p-4 flex flex-col justify-between font-sans shadow-lg transition-all duration-300 shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* SECCIÓN SUPERIOR: Header + Navegación */}
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Header / Logo + Botón dinámico */}
        <div className="w-full border-b border-white/10 pb-4 pt-1">
          <div
            className={`flex items-center transition-all duration-300 ${
              isCollapsed
                ? "flex-col justify-center gap-3"
                : "relative justify-center"
            }`}
          >
            {/* Logo */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ${
                isCollapsed ? "w-10 h-10" : "w-28 h-28"
              }`}
            >
              <img
                src={LogoVergel}
                alt="Vergel Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Botón de colapsar */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors ${
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
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all text-left text-sm ${
                  isActive
                    ? "bg-white/20 text-white font-semibold shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* SECCIÓN INFERIOR: Perfil + Logout */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <NavLink
          to={profilePath}
          title={isCollapsed ? "Mi Perfil" : undefined}
          className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${
            isProfileActive
              ? "bg-white/20 border-white/30 text-white font-semibold shadow-sm"
              : "bg-white/5 border-transparent hover:bg-white/10 text-white/90"
          } ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <User className="w-5 h-5 text-white" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate text-white">
                  {isAdmin ? "Admin Vergel" : "Usuario Vergel"}
                </span>
                <span className="text-xs text-white/70 truncate">
                  {isAdmin ? "admin@vergel.com" : "usuario@vergel.com"}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
