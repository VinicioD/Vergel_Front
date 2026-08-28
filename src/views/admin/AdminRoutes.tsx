// src/views/admin/AdminRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// 1. Dashboard (está al mismo nivel que AdminRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import CatalogPage from "./modules/catalog/CatalogPage";
import ClientsPage from "./modules/clients/ClientsPage";
import CollaboratorsPage from "./modules/collaborators/CollaboratorsPage";
import FinancesPage from "./modules/finances/FinancesPage";
import HistoryPage from "./modules/history/HistoryPage";
import PlansPage from "./modules/plans/PlansPage";
import QuotesPage from "./modules/quotes/QuotesPage";
import RatesPage from "./modules/rates/RatesPage";
import ReportsPage from "./modules/reports/ReportsPage";
import SchedulePage from "./modules/schedule/SchedulePage";
import TransactionsPage from "./modules/transactions/TransactionsPage";
import WalletPage from "./modules/wallet/WalletPage";
import ProfilePage from "./modules/profile/ProfilePage";
import UsersPage from "./modules/users/UsersPage";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout visual (Sidebar + Contenido) */}
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="rates" element={<RatesPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="collaborators" element={<CollaboratorsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /admin */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
