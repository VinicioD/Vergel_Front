import {
  Users,
  FileText,
  Calendar,
  History,
  Layers,
  Wallet,
  TrendingUp,
  AlertCircle,
  DollarSign,
  BookOpen,
  ArrowRightLeft,
  UserCheck,
  User,
  Settings,
} from "lucide-react";

export const adminMenu = [
  { name: "Clientes", icon: Users, path: "/admin/clients" },
  { name: "Cotizaciones", icon: FileText, path: "/admin/quotes" },
  { name: "Agenda", icon: Calendar, path: "/admin/schedule" },
  { name: "Historial", icon: History, path: "/admin/history" },
  { name: "Planes", icon: Layers, path: "/admin/plans" },
  { name: "Billetera", icon: Wallet, path: "/admin/wallet" },
  { name: "Finanzas", icon: TrendingUp, path: "/admin/finances" },
  { name: "Reportes", icon: AlertCircle, path: "/admin/reports" },
  { name: "Tarifas", icon: DollarSign, path: "/admin/rates" },
  { name: "Catálogo", icon: BookOpen, path: "/admin/catalog" },
  { name: "Movimientos", icon: ArrowRightLeft, path: "/admin/transactions" },
  { name: "Colaboradores", icon: UserCheck, path: "/admin/collaborators" },
  { name: "Usuarios", icon: User, path: "/admin/users" },
  { name: "Configuración", icon: Settings, path: "/admin/settings" },
];

// Solo incluye rutas que existen en UserRoutes.tsx
export const recepcionistMenu = [
  { name: "Clientes", icon: Users, path: "/recepcionist/clients" },
  { name: "Cotizaciones", icon: FileText, path: "/recepcionist/quotes" },
  { name: "Agenda", icon: Calendar, path: "/recepcionist/schedule" },
  { name: "Billetera", icon: Wallet, path: "/recepcionist/wallet" },
  { name: "Tarifas", icon: DollarSign, path: "/recepcionist/rates" },
  { name: "Catálogo", icon: BookOpen, path: "/recepcionist/catalog" },
];

// Solo incluye rutas que existen en TechnicalRoutes.tsx
export const technicalMenu = [
  { name: "Agenda", icon: Calendar, path: "/technical/schedule" },
];

// Solo incluye rutas que existen en AuditorRoutes.tsx
export const auditorMenu = [
  { name: "Historial", icon: History, path: "/auditor/history" },
  { name: "Movimientos", icon: ArrowRightLeft, path: "/auditor/transactions" },
];

// Solo incluye rutas que existen en QuoteRoutes.tsx
export const quoteMenu = [
  { name: "Cotizaciones", icon: FileText, path: "/quote/quotes" },
  { name: "Clientes", icon: Users, path: "/quote/clients" },
  { name: "Catálogo", icon: BookOpen, path: "/quote/catalog" },
];

// Solo incluye rutas que existen en CounterRoutes.tsx
export const counterMenu = [
  { name: "Finanzas", icon: TrendingUp, path: "/counter/finances" },
  { name: "Reportes", icon: AlertCircle, path: "/counter/reports" },
  { name: "Historial", icon: History, path: "/counter/history" },
];
