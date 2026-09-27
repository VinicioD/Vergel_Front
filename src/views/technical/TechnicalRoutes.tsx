// src/views/technical/TechnicalRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import TechnicalLayout from "./TechnicalLayout";

// 1. Dashboard principal (al mismo nivel que TechnicalRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import ProfilePage from "./modules/profile/ProfilePage";
import SchedulePage from "./modules/schedule/SchedulePage";

export default function TechnicalRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout de técnico */}
      <Route element={<TechnicalLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /technical */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
