// src/views/users/UserRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./UserLayout";

// Componentes temporales (se reemplazará por las vistas reales)
const Dashboard = () => (
  <h1 className="text-2xl font-bold">Vista Inicio Usuario</h1>
);
const Clients = () => <h1 className="text-2xl font-bold">Vista Clientes</h1>;
const Quotes = () => <h1 className="text-2xl font-bold">Vista Cotizaciones</h1>;
const Schedule = () => <h1 className="text-2xl font-bold">Vista Agenda</h1>;
const Wallet = () => <h1 className="text-2xl font-bold">Vista Billetera</h1>;
const Rates = () => <h1 className="text-2xl font-bold">Vista Tarifas</h1>;
const Catalog = () => <h1 className="text-2xl font-bold">Vista Catálogo</h1>;

export default function UserRoutes() {
  return (
    <Routes>
      {/* Envuelve todas las vistas dentro de UserLayout */}
      <Route element={<UserLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="rates" element={<Rates />} />
        <Route path="catalog" element={<Catalog />} />
      </Route>

      {/* Redirección por defecto al entrar a /users */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
