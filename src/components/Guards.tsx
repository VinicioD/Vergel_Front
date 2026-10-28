import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { getRoleHomePath, normalizeRoleName } from "../config/roles";

// 1. Guard de Autenticación General: Si no hay token, no entra a NINGUNA ruta protegida
export const AuthGuard: React.FC = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// 2. Guard de Roles: Muestra pantalla 403 si el rol no coincide
interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const userRole = normalizeRoleName(localStorage.getItem("role"));
  const navigate = useNavigate();

  // Si el usuario no tiene los permisos requeridos para esta sección
  if (!allowedRoles.includes(userRole)) {
    // Definimos a dónde debería regresar según su rol real
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          textAlign: "center",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff3f3",
            border: "1px solid #ffcdd2",
            padding: "30px",
            borderRadius: "8px",
            maxWidth: "450px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ color: "#d32f2f", marginTop: 0, marginBottom: "10px" }}>
            403 - Acceso Denegado
          </h2>
          <p
            style={{
              color: "#555",
              fontSize: "14px",
              lineHeight: "1.5",
              marginBottom: "20px",
            }}
          >
            No tienes los permisos necesarios (tu rol actual es{" "}
            <b>{userRole}</b>) para acceder a esta sección de edición o gestión
            restringida.
          </p>
          <button
            onClick={() =>
              navigate(getRoleHomePath(userRole), { replace: true })
            }
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Regresar a mi panel
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
