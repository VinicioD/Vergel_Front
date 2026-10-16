// src/views/quote/QuoteRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import QuoteLayout from "./QuoteLayout";

// 1. Dashboard principal (al mismo nivel que QuoteRoutes.tsx)
import Dashboard from "./Dashboard";

// 2. Vistas ubicadas dentro de /modules
import ClientsPage from "./modules/clients/ClientsPage";
import ProfilePage from "./modules/profile/ProfilePage";
import QuotesPage from "./modules/quotes/QuotesPage";
import CatalogPage from "./modules/catalog/CatalogPage";

export default function QuoteRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro del Layout de cotizaciones */}
      <Route element={<QuoteLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Redirección por defecto si la URL no existe o si entran solo a /quote */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
