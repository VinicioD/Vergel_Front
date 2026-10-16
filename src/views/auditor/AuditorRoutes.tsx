// src/views/auditor/AuditorRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuditorLayout from "./AuditorLayout";

// 1. Dashboard principal (al mismo nivel que AuditorRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import HistoryPage from "./modules/history/HistoryPage";
import ProfilePage from "./modules/profile/ProfilePage";
import TransactionsPage from "./modules/transactions/TransactionsPage";

export default function AuditorRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout de auditoría */}
      <Route element={<AuditorLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /auditor */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
