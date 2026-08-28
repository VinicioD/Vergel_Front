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
];

export const userMenu = [
  { name: "Clientes", icon: Users, path: "/users/clients" },
  { name: "Cotizaciones", icon: FileText, path: "/users/quotes" },
  { name: "Agenda", icon: Calendar, path: "/users/schedule" },
  { name: "Billetera", icon: Wallet, path: "/users/wallet" },
  { name: "Tarifas", icon: DollarSign, path: "/users/rates" },
  { name: "Catálogo", icon: BookOpen, path: "/users/catalog" },
];
