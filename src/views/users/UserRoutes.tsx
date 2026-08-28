// src/views/users/UserRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./UserLayout";

// 1. Dashboard principal de usuario (al mismo nivel que UserRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import CatalogPage from "./modules/catalog/CatalogPage";
import ClientsPage from "./modules/clients/ClientsPage";
import ProfilePage from "./modules/profile/ProfilePage";
import QuotesPage from "./modules/quotes/QuotesPage";
import RatesPage from "./modules/rates/RatesPage";
import SchedulePage from "./modules/schedule/SchedulePage";
import WalletPage from "./modules/wallet/WalletPage";

export default function UserRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout de usuario */}
      <Route element={<UserLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="rates" element={<RatesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /users */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
