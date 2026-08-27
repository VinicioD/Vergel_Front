// src/views/admin/AdminRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// Componentes temporales  (se reemplazará por las vistas reales)
const Dashboard = () => <h1 className="text-2xl font-bold">Vista Dashboard</h1>;
const Clients = () => <h1 className="text-2xl font-bold">Vista Clientes</h1>;
const Quotes = () => <h1 className="text-2xl font-bold">Vista Cotizaciones</h1>;
const Collaborators = () => (
  <h1 className="text-2xl font-bold">Vista Colaboradores</h1>
);

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro de AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="collaborators" element={<Collaborators />} />

        {/* Tu compañero agregará las rutas restantes de menuConfig aquí:
        <Route path="schedule" element={<Schedule />} />
        <Route path="history" element={<History />} />
        <Route path="plans" element={<Plans />} />
        ...etc
        */}
      </Route>

      {/* Redirección por defecto si entran a /admin */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
