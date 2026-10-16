// src/views/admin/modules/wallet/WalletPage.tsx
import React, { useState } from "react";
import {
  Search,
  Wallet,
  Coins,
  PlusCircle,
  Award,
  Eye,
  History,
  TrendingUp,
  FileText,
  X,
  Printer,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import DatePickerSelect from "../../../../components/DateRangePicker";

// --- TIPOS DE DATOS ---
interface ClientWallet {
  id: string;
  code: string;
  name: string;
  phone: string;
  avatar: string;
  balance: number; // Saldo monetario (+, 0, -)
  isSubscription: boolean; // ¿Tiene plan anual suscrito?
  ecoPoints: number; // Saldo total de puntos
}

interface Transaction {
  id: string;
  clientName: string;
  date: string;
  type: "Saldo" | "EcoPuntos";
  subType: string;
  amount: string;
  description: string;
  isPositive: boolean;
}

// --- MOCK DATA ---
const MOCK_CLIENTS: ClientWallet[] = [
  {
    id: "1",
    code: "CLI-2026-001",
    name: "Residencial Los Parques",
    phone: "+503 7890-1234",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    balance: 1450.0,
    isSubscription: true,
    ecoPoints: 1250,
  },
  {
    id: "2",
    code: "CLI-2026-002",
    name: "Club Campestre San Isidro",
    phone: "+503 7123-4567",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    balance: -320.5,
    isSubscription: false,
    ecoPoints: 480,
  },
  {
    id: "3",
    code: "CLI-2026-003",
    name: "Condominio Las Hortensias",
    phone: "+503 7555-9876",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    balance: 0.0,
    isSubscription: false,
    ecoPoints: 85,
  },
  {
    id: "4",
    code: "CLI-2026-004",
    name: "Inmobiliaria Bosques",
    phone: "+503 7222-3344",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    balance: 2800.0,
    isSubscription: true,
    ecoPoints: 3400,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TR-001",
    clientName: "Residencial Los Parques",
    date: "24 Oct 2026",
    type: "Saldo",
    subType: "Recarga Anualidad",
    amount: "+$1,450.00",
    description: "Suscripción Plan Anual de Mantenimiento Jardinería",
    isPositive: true,
  },
  {
    id: "TR-002",
    clientName: "Club Campestre San Isidro",
    date: "22 Oct 2026",
    type: "Saldo",
    subType: "Servicio a Crédito",
    amount: "-$320.50",
    description: "Poda de árboles de altura sin saldo disponible",
    isPositive: false,
  },
  {
    id: "TR-003",
    clientName: "Inmobiliaria Bosques",
    date: "20 Oct 2026",
    type: "EcoPuntos",
    subType: "Ganados por compra",
    amount: "+450 pts",
    description: "Factura FAC-2026-091 pagada con éxito",
    isPositive: true,
  },
  {
    id: "TR-004",
    clientName: "Residencial Los Parques",
    date: "18 Oct 2026",
    type: "EcoPuntos",
    subType: "Usados por redención",
    amount: "-200 pts",
    description: "Redención de descuento en fertilizantes orgánicos",
    isPositive: false,
  },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<
    "clients" | "transactions" | "top"
  >("clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("30d");

  // Simulación de permisos (Solo Propietario o Administrador Financiero pueden editar)
  const [isAdminOrFinancial] = useState(true);

  // Estados para Modales
  const [selectedClient, setSelectedClient] = useState<ClientWallet | null>(
    null,
  );
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Formularios
  const [balanceForm, setBalanceForm] = useState({
    amount: "",
    paymentType: "Transferencia",
    isAnnuality: "recarga",
    subscriptionType: "Estándar",
    date: new Date().toISOString().split("T")[0],
  });

  const [pointsForm, setPointsForm] = useState({
    transactionType: "Ganados por compra",
    points: "",
    description: "",
  });

  // Filtrado de clientes
  const filteredClients = MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {/* HEADER DE LA VISTA */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Billetera & EcoPuntos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de cuentas corrientes, saldos monetarios y programa de
            fidelización de clientes
          </p>
        </div>
      </div>

      {/* PESTAÑAS Y DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-700 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "clients"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Wallet size={16} />
          <span>Clientes & Cuentas</span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "transactions"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <History size={16} />
          <span>Historial de Transacciones</span>
        </button>

        <button
          onClick={() => setActiveTab("top")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "top"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Award size={16} />
          <span>Top Clientes EcoPuntos</span>
        </button>
      </div>

      {/* ----------------- PESTAÑA 1: CLIENTES Y CUENTAS ----------------- */}
      {activeTab === "clients" && (
        <div className="flex flex-col gap-5">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por Nombre, ID o Teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm transition-all"
              />
            </div>

            <DatePickerSelect
              value={dateFilter}
              onChange={(val: any) =>
                setDateFilter(typeof val === "object" ? val.value : val)
              }
            />
          </div>

          {/* TABLA DE CLIENTES */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">CLIENTE</th>
                    <th className="py-4 px-6">ID & TELÉFONO</th>
                    <th className="py-4 px-6">SALDO MONETARIO</th>
                    <th className="py-4 px-6">ECOPUNTOS</th>
                    <th className="py-4 px-6 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
                  {filteredClients.map((client) => {
                    const isNegative = client.balance < 0;
                    const isZero = client.balance === 0;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {/* NOMBRE Y AVATAR */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={client.avatar}
                              alt={client.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {client.name}
                              </span>
                              {client.isSubscription ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 size={12} /> Plan Anual Suscrito
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  Cuenta Estándar
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ID & TELÉFONO */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {client.code}
                            </span>
                            <span className="text-xs text-gray-400">
                              {client.phone}
                            </span>
                          </div>
                        </td>

                        {/* SALDO MONETARIO */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-bold ${
                                isNegative
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isZero
                                    ? "text-gray-600 dark:text-gray-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              ${Math.abs(client.balance).toFixed(2)} USD
                              {isNegative && " (Deuda)"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {client.isSubscription
                                ? "Reservado para mantenimientos"
                                : "Cuenta corriente activa"}
                            </span>
                          </div>
                        </td>

                        {/* ECOPUNTOS */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Coins
                              size={16}
                              className="text-amber-500 shrink-0"
                            />
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {client.ecoPoints.toLocaleString()} pts
                            </span>
                          </div>
                        </td>

                        {/* ACCIONES */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {isAdminOrFinancial && (
                              <>
                                <button
                                  type="button"
                                  title="Añadir Saldo"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setShowAddBalanceModal(true);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all"
                                >
                                  <DollarSign size={14} />
                                  <span>+ Saldo</span>
                                </button>

                                <button
                                  type="button"
                                  title="Añadir Puntos"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setShowAddPointsModal(true);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-all"
                                >
                                  <Coins size={14} />
                                  <span>+ Puntos</span>
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              title="Ver Movimientos"
                              onClick={() => {
                                setSelectedClient(client);
                                setShowHistoryModal(true);
                              }}
                              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PESTAÑA 2: HISTORIAL DE TRANSACCIONES ----------------- */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Historial General de Movimientos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="py-3">CLIENTE</th>
                  <th className="py-3">FECHA</th>
                  <th className="py-3">TIPO</th>
                  <th className="py-3">DETALLE</th>
                  <th className="py-3 text-right">MONTO / PUNTOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-gray-100">
                      {tx.clientName}
                    </td>
                    <td className="py-3.5 text-gray-500">{tx.date}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.type === "Saldo"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {tx.subType}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-600 dark:text-gray-300">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3.5 text-right font-bold ${
                        tx.isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- PESTAÑA 3: TOP CLIENTES ----------------- */}
      {activeTab === "top" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_CLIENTS.slice(0, 3).map((client, idx) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-3 left-3 bg-[#5b642a] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">
                #{idx + 1}
              </div>
              <img
                src={client.avatar}
                alt={client.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#5b642a] mb-3"
              />
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                {client.name}
              </h3>
              <span className="text-xs text-gray-400 mb-4">{client.code}</span>

              <div className="w-full bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Acumulado:
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Coins size={16} />
                  {client.ecoPoints.toLocaleString()} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AÑADIR / RECARGAR SALDO MONETARIO */}
      {/* ========================================================================= */}
      {showAddBalanceModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <DollarSign className="text-emerald-600" size={20} />
                Añadir / Recargar Saldo
              </h3>
              <button
                onClick={() => setShowAddBalanceModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cliente:{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                {selectedClient.name}
              </strong>{" "}
              ({selectedClient.code})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddBalanceModal(false);
              }}
              className="flex flex-col gap-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Monto a Recargar ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={balanceForm.amount}
                  onChange={(e) =>
                    setBalanceForm({ ...balanceForm, amount: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Operación
                </label>
                <select
                  value={balanceForm.isAnnuality}
                  onChange={(e) =>
                    setBalanceForm({
                      ...balanceForm,
                      isAnnuality: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                >
                  <option value="recarga">
                    Recarga Estándar / Abono a Deuda
                  </option>
                  <option value="anualidad">
                    Pago de Anualidad (Suscripción)
                  </option>
                </select>
              </div>

              {balanceForm.isAnnuality === "anualidad" && (
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Suscripción
                  </label>
                  <select
                    value={balanceForm.subscriptionType}
                    onChange={(e) =>
                      setBalanceForm({
                        ...balanceForm,
                        subscriptionType: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                  >
                    <option value="Estándar">
                      Plan Mantenimiento Estándar
                    </option>
                    <option value="Premium">Plan Mantenimiento Premium</option>
                    <option value="Corporativo">
                      Plan Corporativo Personalizado
                    </option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={balanceForm.paymentType}
                    onChange={(e) =>
                      setBalanceForm({
                        ...balanceForm,
                        paymentType: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                  >
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={balanceForm.date}
                    onChange={(e) =>
                      setBalanceForm({ ...balanceForm, date: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => alert("Imprimiendo comprobante...")}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold"
                >
                  <Printer size={15} />
                  <span>Comprobante</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBalanceModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5b642a] text-white rounded-xl font-semibold hover:bg-[#4a5222]"
                  >
                    Registrar Saldo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AÑADIR / GESTIONAR ECOPUNTOS */}
      {/* ========================================================================= */}
      {showAddPointsModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Coins className="text-amber-500" size={20} />
                Añadir / Gestionar EcoPuntos
              </h3>
              <button
                onClick={() => setShowAddPointsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Saldo Actual de Puntos:
              </span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {selectedClient.ecoPoints.toLocaleString()} pts
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddPointsModal(false);
              }}
              className="flex flex-col gap-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Transacción
                </label>
                <select
                  value={pointsForm.transactionType}
                  onChange={(e) =>
                    setPointsForm({
                      ...pointsForm,
                      transactionType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                >
                  <option value="Ganados por compra">Ganados por compra</option>
                  <option value="Usados por redención">
                    Usados por redención
                  </option>
                  <option value="Por referido">Por referido</option>
                  <option value="Promocional">Promocional</option>
                  <option value="Bonos especiales">Bonos especiales</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad de Puntos
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 150"
                  value={pointsForm.points}
                  onChange={(e) =>
                    setPointsForm({ ...pointsForm, points: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Descripción Libre
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Bonificación promocional por inicio de temporada"
                  value={pointsForm.description}
                  onChange={(e) =>
                    setPointsForm({
                      ...pointsForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#5b642a]"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPointsModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5b642a] text-white rounded-xl font-semibold hover:bg-[#4a5222]"
                >
                  Agregar Puntos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VER PANEL HISTORIAL DEL CLIENTE */}
      {/* ========================================================================= */}
      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="text-[#5b642a]" size={20} />
                Historial de Movimientos - {selectedClient.name}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl text-xs">
              <div>
                <span className="text-gray-400 block">Saldo Monetario:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                  ${selectedClient.balance.toFixed(2)} USD
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">EcoPuntos:</span>
                <span className="font-bold text-amber-600 text-sm">
                  {selectedClient.ecoPoints} pts
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                Últimas Transacciones
              </h4>
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
                {MOCK_TRANSACTIONS.filter(
                  (t) => t.clientName === selectedClient.name,
                ).map((t) => (
                  <div
                    key={t.id}
                    className="py-2.5 flex items-start justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block">
                        {t.subType}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {t.description}
                      </span>
                      <span className="text-gray-400 text-[10px] block mt-0.5">
                        {t.date}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        t.isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="mt-2 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
