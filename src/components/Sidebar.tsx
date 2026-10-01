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
import LogoVergelDark from "../assets/LOGO-sin-fondo.png";

export type MenuItem = {
  name: string;
  icon: LucideIcon;
  path: string;
};

type RoleConfig = {
  /** Prefijo de ruta que identifica al rol, ej. "/admin" */
  prefix: string;
  panelTitle: string;
  panelSubtitle: string;
  displayName: string;
  email: string;
  /** Ruta de perfil. Omitirla si el rol no tiene vista de perfil. */
  profilePath?: string;
};

const ROLES: RoleConfig[] = [
  {
    prefix: "/admin",
    panelTitle: "Admin Panel",
    panelSubtitle: "Panel Admin",
    displayName: "Admin Vergel",
    email: "admin@vergel.com",
    profilePath: "/admin/profile",
  },
  {
    prefix: "/recepcionist",
    panelTitle: "Mi Cuenta",
    panelSubtitle: "Gestión",
    displayName: "Usuario Vergel",
    email: "usuario@vergel.com",
    profilePath: "/recepcionist/profile",
  },
  {
    prefix: "/technical",
    panelTitle: "Panel Técnico",
    panelSubtitle: "Servicio de campo",
    displayName: "Técnico Vergel",
    email: "tecnico@vergel.com",
    profilePath: "/technical/profile",
  },
  {
    prefix: "/auditor",
    panelTitle: "Panel Auditor",
    panelSubtitle: "Control y trazabilidad",
    displayName: "Auditor Vergel",
    email: "auditor@vergel.com",
    profilePath: "/auditor/profile",
  },
  {
    prefix: "/quote",
    panelTitle: "Panel Cotizaciones",
    panelSubtitle: "Ventas y presupuestos",
    displayName: "Cotizador Vergel",
    email: "cotizador@vergel.com",
    profilePath: "/quote/profile",
  },
  {
    prefix: "/counter",
    panelTitle: "Panel Contabilidad",
    panelSubtitle: "Finanzas y reportes",
    displayName: "Contador Vergel",
    email: "contador@vergel.com",
    profilePath: "/counter/profile",
  },
];

const FALLBACK_ROLE: RoleConfig = {
  prefix: "/",
  panelTitle: "Sistema Vergel",
  panelSubtitle: "Panel",
  displayName: "Usuario Vergel",
  email: "usuario@vergel.com",
};

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

  const activeRole =
    ROLES.find((role) => location.pathname.startsWith(role.prefix)) ??
    FALLBACK_ROLE;
  const profilePath = activeRole.profilePath;
  const isProfileActive = profilePath
    ? location.pathname.startsWith(profilePath)
    : false;

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Avatar + nombre/correo del rol activo. Se muestra dentro de un NavLink
  // cuando el rol tiene vista de perfil, y como bloque plano cuando no.
  const identityBlock = (
    <span
      className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center" : "min-w-0 flex-1"}`}
    >
      <span className="w-9 h-9 rounded-full bg-white/20 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-white/30 dark:border-gray-600">
        <User className="w-5 h-5 text-white" />
      </span>

      <span
        className={`flex flex-col min-w-0 ${
          isCollapsed ? "md:hidden" : "flex"
        }`}
      >
        <span className="text-sm font-semibold truncate text-white dark:text-gray-100">
          {activeRole.displayName}
        </span>
        <span className="text-xs text-white/70 dark:text-gray-400 truncate">
          {activeRole.email}
        </span>
      </span>
    </span>
  );

  return (
    <>
      {/* BOTÓN HAMBURGUESA Y BARRA SUPERIOR (Solo visible en móviles - md:hidden) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#636B2F] border-b border-white/10 dark:bg-gray-900 z-40 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img
            src={LogoVergel}
            alt="Vergel Logo"
            className="w-8 h-8 object-contain dark:hidden"
          />
          <img
            src={LogoVergelDark}
            alt="Vergel Logo"
            className="w-8 h-8 object-contain hidden dark:block"
          />
        </div>
        <span className="text-white font-semibold text-sm">
          {activeRole.panelTitle}
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
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#636B2F] dark:bg-gray-900 text-white dark:text-gray-100 p-4 flex flex-col justify-between font-sans shadow-lg transition-all duration-300 z-50 shrink-0 ${
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
          <div className="w-full border-b border-white/10 dark:border-gray-800 pb-4 pt-1">
            <div
              className={`flex items-center transition-all duration-300 ${
                isCollapsed
                  ? "flex-col justify-center gap-3"
                  : "justify-between"
              }`}
            >
              {/* Contenedor del Logo + Nombre */}
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Ícono/Logo pequeño */}
                <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center">
                  {/* Logo para Modo Claro */}
                  <img
                    src={LogoVergel}
                    alt="Vergel Logo"
                    className="w-full h-full object-contain dark:hidden"
                  />
                  {/* Logo para Modo Oscuro */}
                  <img
                    src={LogoVergelDark} // O vuelve a usar LogoVergel si es la misma imagen
                    alt="Vergel Logo"
                    className="w-full h-full object-contain hidden dark:block"
                  />
                </div>

                {/* Nombre del Sistema (se oculta cuando la barra está colapsada) */}
                <div
                  className={`flex flex-col min-w-0 ${
                    isCollapsed ? "md:hidden" : "flex"
                  }`}
                >
                  <span className="font-bold text-base md:text-lg text-white dark:text-gray-100 leading-tight truncate">
                    Sistema Vergel
                  </span>
                  <span className="text-[10px] text-white/70 dark:text-gray-400 font-medium tracking-wider uppercase truncate">
                    {activeRole.panelSubtitle}
                  </span>
                </div>
              </div>

              {/* Botón de cerrar en móvil / colapsar en Desktop */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:block p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
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
                      ? "bg-white/20 dark:bg-gray-800 text-white font-semibold shadow-sm"
                      : "text-white/90 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/60 hover:text-white"
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

        {/* SECCIÓN INFERIOR: Identidad + Logout (mismo estilo para todos los roles) */}
        <div className="border-t border-white/10 dark:border-gray-800 pt-4 mt-2">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all bg-white/5 dark:bg-gray-800/40 border-transparent ${
              isCollapsed ? "md:justify-center" : "justify-between"
            }`}
          >
            {/* La identidad es enlace solo si el rol tiene vista de perfil. */}
            {profilePath ? (
              <NavLink
                to={profilePath}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? "Mi Perfil" : undefined}
                className={`flex items-center gap-3 rounded-lg transition-colors ${
                  isProfileActive
                    ? "text-white font-semibold"
                    : "text-white/90 dark:text-gray-300 hover:text-white"
                } ${isCollapsed ? "md:justify-center" : "min-w-0 flex-1"}`}
              >
                {identityBlock}
              </NavLink>
            ) : (
              identityBlock
            )}

            <button
              onClick={handleLogout}
              className={`p-1.5 text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0 ${
                isCollapsed ? "md:hidden" : "block"
              }`}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
