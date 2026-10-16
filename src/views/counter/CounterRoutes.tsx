// src/views/counter/CounterRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import CounterLayout from "./CounterLayout";

// 1. Dashboard principal (al mismo nivel que CounterRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import FinancesPage from "./modules/finances/FinancesPage";
import ProfilePage from "./modules/profile/ProfilePage";
import ReportsPage from "./modules/reports/ReportsPage";
import HistoryPage from "./modules/history/HistoryPage";

export default function CounterRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout de contabilidad */}
      <Route element={<CounterLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /counter */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
