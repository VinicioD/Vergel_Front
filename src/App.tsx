// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./views/auth/login";
import AdminRoutes from "./views/admin/AdminRoutes";
import UserRoutes from "./views/recepcionist/UserRoutes";
import TechnicalRoutes from "./views/technical/TechnicalRoutes";
import AuditorRoutes from "./views/auditor/AuditorRoutes";
import QuoteRoutes from "./views/quote/QuoteRoutes";
import CounterRoutes from "./views/counter/CounterRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/recepcionist/*" element={<UserRoutes />} />
        <Route path="/technical/*" element={<TechnicalRoutes />} />
        <Route path="/auditor/*" element={<AuditorRoutes />} />
        <Route path="/quote/*" element={<QuoteRoutes />} />
        <Route path="/counter/*" element={<CounterRoutes />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
