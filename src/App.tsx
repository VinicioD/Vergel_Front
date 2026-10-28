import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./views/auth/login";
import AdminRoutes from "./views/admin/AdminRoutes";
import UserRoutes from "./views/recepcionist/UserRoutes";
import TechnicalRoutes from "./views/technical/TechnicalRoutes";
import AuditorRoutes from "./views/auditor/AuditorRoutes";
import QuoteRoutes from "./views/quote/QuoteRoutes";
import CounterRoutes from "./views/counter/CounterRoutes";

// Importamos los Guards
import { AuthGuard, RoleGuard } from "./components/Guards";
import { APP_ROLES } from "./config/roles";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* ==================== CAPA DE SEGURIDAD GLOBAL ==================== */}
        {/* Si no hay token en localStorage, nadie puede pasar de este punto */}
        <Route element={<AuthGuard />}>
          {/* Módulo Admin: Solo acceso a usuarios con rol 'admin' */}
          <Route element={<RoleGuard allowedRoles={[APP_ROLES.admin]} />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>

          {/* Módulo Recepcionista: Solo acceso a 'recepcionist' */}
          <Route
            element={<RoleGuard allowedRoles={[APP_ROLES.receptionist]} />}
          >
            <Route path="/recepcionist/*" element={<UserRoutes />} />
          </Route>

          {/* Módulo Técnico: Solo acceso a 'technical' */}
          <Route element={<RoleGuard allowedRoles={[APP_ROLES.technical]} />}>
            <Route path="/technical/*" element={<TechnicalRoutes />} />
          </Route>

          {/* Módulo Auditor: Solo acceso a 'auditor' */}
          <Route element={<RoleGuard allowedRoles={[APP_ROLES.auditor]} />}>
            <Route path="/auditor/*" element={<AuditorRoutes />} />
          </Route>

          {/* Módulo Cotizador: Solo acceso a 'quote' */}
          <Route element={<RoleGuard allowedRoles={["quote"]} />}>
            <Route path="/quote/*" element={<QuoteRoutes />} />
          </Route>

          {/* Módulo Mostrador / Counter: Solo acceso a 'counter' */}
          <Route element={<RoleGuard allowedRoles={["counter"]} />}>
            <Route path="/counter/*" element={<CounterRoutes />} />
          </Route>
        </Route>
        {/* =================================================================== */}

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
