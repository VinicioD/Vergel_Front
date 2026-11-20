import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import {
  Award,
  CheckCircle2,
  Coins,
  DollarSign,
  Eye,
  FileText,
  History,
  LoaderCircle,
  Search,
  Wallet,
  X,
} from "lucide-react";
import DateRangePicker, { type DateOption } from "../../../../components/DateRangePicker";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import { getCustomers } from "../../../../services/customerService";
import {
  createLoyaltyPointsTransaction,
  createWalletTransaction,
  getCustomerLoyaltyRedemptions,
  getCustomerPortfolioMovements,
  getLoyaltyRewards,
  getPortfolioMovements,
  getPortfolioSummaries,
} from "../../../../services/portfolioService";
import type { CustomerListItem } from "../../../../types/customer";
import type {
  CustomerPortfolioSummary,
  LoyaltyPointsTransactionPayload,
  LoyaltyRedemption,
  LoyaltyReward,
  PortfolioMovement,
  WalletTransactionPayload,
} from "../../../../types/portfolio";

type WalletCustomer = Omit<CustomerPortfolioSummary, "wallet" | "loyaltyPoints"> & {
  wallet: {
    cashBalance: number;
    reservedSubscriptionBalance: number;
    totalAvailable: number;
  };
  loyaltyPoints: { pointsBalance: number };
  phone: string;
  identifier: string;
  planName: string;
};

type Tab = "clients" | "movements" | "loyalty";
const TABLE_PAGE_SIZE = 9;

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación de la tabla"
      className="flex items-center justify-end gap-3 text-xs text-gray-500 dark:text-gray-400"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
      >
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
      >
        Siguiente
      </button>
    </nav>
  );
}

const DATE_OPTIONS: DateOption[] = [
  { label: "Hoy", value: "today" },
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "last_month" },
  { label: "Año actual", value: "this_year" },
];

const WALLET_TRANSACTION_LABELS: Record<
  WalletTransactionPayload["transaction_type"],
  string
> = {
  top_up: "Recarga de saldo",
  annual_fee: "Pago de anualidad",
  maintenance_deduction: "Deducción de mantenimiento",
  adjustment: "Ajuste de saldo",
  reserve_funds: "Reservar saldo para suscripción",
  spend_reserved_funds: "Usar saldo reservado",
};

const POINTS_TRANSACTION_LABELS: Record<
  LoyaltyPointsTransactionPayload["transaction_type"],
  string
> = {
  earned_purchase: "Ganados por compra",
  redeemed: "Puntos utilizados",
  referral: "Por referido",
  promotional: "Promocionales",
  special_bonus: "Bonos especiales",
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError(error)) return fallback;

  const data = error.response?.data as
    | {
        message?: string;
        error?: string;
        errors?: Record<string, string | string[]>;
      }
    | undefined;
  const validationErrors = data?.errors;

  if (validationErrors) {
    const messages = Object.values(validationErrors).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return data?.message || data?.error || fallback;
};

const formatCurrency = (amount: number) =>
  `$${Math.abs(amount).toLocaleString("es-SV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleString("es-SV", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const isMovementInDateRange = (date: string, range: string) => {
  const movementDate = new Date(date);
  if (Number.isNaN(movementDate.getTime())) return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return movementDate >= startOfToday;
  if (range === "7d" || range === "30d") {
    const days = range === "7d" ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    return movementDate >= startDate;
  }
  if (range === "this_month") {
    return movementDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (range === "last_month") {
    return (
      movementDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1) &&
      movementDate < new Date(now.getFullYear(), now.getMonth(), 1)
    );
  }
  if (range === "this_year") {
    return movementDate >= new Date(now.getFullYear(), 0, 1);
  }
  return true;
};

const getMovementSource = (movement: PortfolioMovement) =>
  movement.source || movement.type || "wallet";

const isNegativeMovement = (movement: PortfolioMovement) => {
  const transactionType = movement.transactionType || "";
  if (
    [
      "maintenance_deduction",
      "spend_reserved_funds",
      "redeemed",
    ].includes(transactionType)
  ) {
    return true;
  }
  const value = movement.amount ?? movement.points ?? 0;
  if (value < 0) return true;
  return /deducci[oó]n|usad[oa]s?|redenci[oó]n|pagad[oa]/i.test(
    movement.concept || movement.description || "",
  );
};

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [clients, setClients] = useState<WalletCustomer[]>([]);
  const [movements, setMovements] = useState<PortfolioMovement[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("30d");
  const [clientsPage, setClientsPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [movementPageCount, setMovementPageCount] = useState(1);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState<WalletCustomer | null>(
    null,
  );
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [clientMovements, setClientMovements] = useState<PortfolioMovement[]>(
    [],
  );
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(
    null,
  );
  const [balanceForm, setBalanceForm] = useState({
    transactionType: "top_up" as WalletTransactionPayload["transaction_type"],
    amount: "",
    paymentMethod: "transfer" as NonNullable<
      WalletTransactionPayload["payment_method"]
    >,
  });
  const [pointsForm, setPointsForm] = useState({
    transactionType: "earned_purchase" as LoyaltyPointsTransactionPayload["transaction_type"],
    points: "",
    description: "",
  });

  const showToast = (type: ToastType, message: string) =>
    setToast({ type, message });

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const portfolioResponse = await getPortfolioSummaries(100);
      let customerItems: CustomerListItem[] = [];
      try {
        const customerResponse = await getCustomers({ limit: 100 });
        customerItems = customerResponse.data;
      } catch (error) {
        console.warn("No se pudo completar la información de contacto de clientes:", error);
      }
      const customerById = new Map<number, CustomerListItem>(
        customerItems.map((customer) => [customer.id, customer]),
      );
      const mappedClients = (portfolioResponse.data || []).map((summary) => {
        const customer = customerById.get(summary.customerId);
        const wallet = summary.wallet || {};
        const cashBalance = Number(summary.cashBalance ?? wallet.cashBalance ?? 0);
        const reservedSubscriptionBalance = Number(
          summary.reservedSubscriptionBalance ?? wallet.reservedSubscriptionBalance ?? 0,
        );
        const loyalty = summary.loyaltyPoints ?? summary.loyalty;
        const pointsBalance = Number(
          (typeof loyalty === "number" ? loyalty : loyalty?.pointsBalance) ??
            summary.pointsBalance ??
            summary.totalPoints ??
            0,
        );
        return {
          ...summary,
          customerName:
            summary.customerName ||
            summary.tradeName ||
            summary.legalName ||
            customer?.tradeName ||
            customer?.legalName ||
            `Cliente ${summary.customerId}`,
          wallet: {
            cashBalance,
            reservedSubscriptionBalance,
            totalAvailable: Number(
              summary.totalAvailable ??
                wallet.totalAvailable ??
                cashBalance + reservedSubscriptionBalance,
            ),
          },
          loyaltyPoints: { pointsBalance },
          phone: customer?.phone || "Sin teléfono",
          identifier: customer?.taxId || `ID ${summary.customerId}`,
          planName: customer?.currentPlanName || "Sin plan activo",
        };
      });
      setClients(mappedClients);
    } catch (error) {
      showToast("error", getApiErrorMessage(error, "No se pudo cargar la cartera."));
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const loadMovements = useCallback(async () => {
    setLoadingMovements(true);
    try {
      const response = await getPortfolioMovements({
        page: movementPage,
        limit: TABLE_PAGE_SIZE,
      });
      setMovements(response.data);
      setMovementPageCount(response.meta?.totalPages || 1);
    } catch (error) {
      showToast(
        "error",
        getApiErrorMessage(error, "No se pudieron cargar los movimientos."),
      );
    } finally {
      setLoadingMovements(false);
    }
  }, [movementPage]);

  const loadRewards = useCallback(async () => {
    setLoadingRewards(true);
    try {
      const response = await getLoyaltyRewards(true);
      setRewards(response.data);
    } catch (error) {
      showToast("error", getApiErrorMessage(error, "No se pudieron cargar las recompensas."));
    } finally {
      setLoadingRewards(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadClients();
      void loadRewards();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadClients, loadRewards]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMovements(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMovements]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase();
    return clients
      .filter((client) =>
        `${client.customerName} ${client.identifier} ${client.phone}`
          .toLocaleLowerCase()
          .includes(term),
      )
      .sort(
        (first, second) =>
          second.loyaltyPoints.pointsBalance -
          first.loyaltyPoints.pointsBalance,
      );
  }, [clients, searchTerm]);

  const clientsPageCount = Math.max(
    1,
    Math.ceil(filteredClients.length / TABLE_PAGE_SIZE),
  );
  const visibleClientsPage = Math.min(clientsPage, clientsPageCount);
  const visibleClients = filteredClients.slice(
    (visibleClientsPage - 1) * TABLE_PAGE_SIZE,
    visibleClientsPage * TABLE_PAGE_SIZE,
  );

  const clientById = useMemo(
    () => new Map(clients.map((client) => [client.customerId, client])),
    [clients],
  );

  const filteredMovements = useMemo(
    () => movements.filter((movement) => isMovementInDateRange(movement.createdAt, dateFilter)),
    [movements, dateFilter],
  );

  const openHistory = async (client: WalletCustomer) => {
    setSelectedClient(client);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const [movementResult, redemptionResult] = await Promise.allSettled([
        getCustomerPortfolioMovements(client.customerId, { page: 1, limit: 100 }),
        getCustomerLoyaltyRedemptions(client.customerId),
      ]);
      if (movementResult.status === "fulfilled") {
        setClientMovements(movementResult.value.data);
      } else {
        setClientMovements([]);
        showToast("error", getApiErrorMessage(movementResult.reason, "No se pudieron cargar los movimientos del cliente."));
      }
      if (redemptionResult.status === "fulfilled") {
        setRedemptions(redemptionResult.value.data);
      } else {
        setRedemptions([]);
        showToast("error", getApiErrorMessage(redemptionResult.reason, "No se pudieron cargar los canjes del cliente."));
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleBalanceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    const amount = Number(balanceForm.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      showToast("error", "Ingresa un monto válido distinto de cero.");
      return;
    }
    if (balanceForm.transactionType !== "adjustment" && amount < 0) {
      showToast("error", "Solo los ajustes permiten registrar un monto negativo.");
      return;
    }

    const payload: WalletTransactionPayload = {
      transaction_type: balanceForm.transactionType,
      amount,
      ...(balanceForm.transactionType === "top_up" ||
      balanceForm.transactionType === "annual_fee"
        ? { payment_method: balanceForm.paymentMethod }
        : {}),
      ...(balanceForm.transactionType === "annual_fee"
        ? { is_annual_payment: true }
        : {}),
    };

    setSaving(true);
    try {
      await createWalletTransaction(selectedClient.customerId, payload);
      showToast("success", "La transacción de cartera se registró correctamente.");
      setShowBalanceModal(false);
      setBalanceForm({ ...balanceForm, amount: "" });
      await Promise.all([loadClients(), loadMovements()]);
    } catch (error) {
      showToast("error", getApiErrorMessage(error, "No se pudo registrar la transacción."));
    } finally {
      setSaving(false);
    }
  };

  const handlePointsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    const points = Number(pointsForm.points);
    if (!Number.isInteger(points) || points < 1) {
      showToast("error", "La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    const payload: LoyaltyPointsTransactionPayload = {
      transaction_type: pointsForm.transactionType,
      points,
      ...(pointsForm.description.trim()
        ? { description: pointsForm.description.trim() }
        : {}),
    };

    setSaving(true);
    try {
      await createLoyaltyPointsTransaction(selectedClient.customerId, payload);
      showToast("success", "La transacción de EcoPuntos se registró correctamente.");
      setShowPointsModal(false);
      setPointsForm({ ...pointsForm, points: "", description: "" });
      await Promise.all([loadClients(), loadMovements()]);
      if (showHistoryModal) await openHistory(selectedClient);
    } catch (error) {
      showToast("error", getApiErrorMessage(error, "No se pudo registrar la transacción de puntos."));
    } finally {
      setSaving(false);
    }
  };

  const closeHistory = () => {
    setShowHistoryModal(false);
    setClientMovements([]);
    setRedemptions([]);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 font-sans">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isOpen
          onClose={() => setToast(null)}
        />
      )}

      <header className="pb-4 border-b border-gray-200/60 dark:border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Cartera y EcoPuntos
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Consulta de saldos, movimientos, recompensas y puntos de los clientes
        </p>
      </header>

      <nav className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-700 overflow-x-auto pb-1">
        {([
          ["clients", "Cartera de clientes", Wallet],
          ["movements", "Movimientos", History],
          ["loyalty", "EcoPuntos y recompensas", Award],
        ] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab
                ? "bg-[#5b642a] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {activeTab === "clients" && (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Buscar por cliente, identificación o teléfono..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setClientsPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#5b642a] shadow-sm"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredClients.length} clientes
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Cliente</th>
                    <th className="py-4 px-6">Identificación y teléfono</th>
                    <th className="py-4 px-6">Saldo disponible</th>
                    <th className="py-4 px-6">EcoPuntos</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
                  {loadingClients ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        <LoaderCircle className="inline animate-spin mr-2" size={17} />
                        Cargando cartera desde el servidor...
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No hay clientes en la cartera.
                      </td>
                    </tr>
                  ) : (
                    visibleClients.map((client) => {
                      const hasSubscription =
                        client.wallet.reservedSubscriptionBalance > 0 ||
                        client.planName !== "Sin plan activo";
                      return (
                        <tr
                          key={client.customerId}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#5b642a]/10 text-[#5b642a] flex items-center justify-center">
                                <Wallet size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                  {client.customerName}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                  {hasSubscription && <CheckCircle2 size={12} />}
                                  {client.planName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {client.identifier}
                              </span>
                              <span className="text-xs text-gray-400">{client.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(client.wallet.totalAvailable)} USD
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Efectivo {formatCurrency(client.wallet.cashBalance)} · reservado {formatCurrency(client.wallet.reservedSubscriptionBalance)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Coins size={16} className="text-amber-500 shrink-0" />
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {client.loyaltyPoints.pointsBalance.toLocaleString()} pts
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                title="Registrar movimiento de cartera"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setBalanceForm({ ...balanceForm, amount: "" });
                                  setShowBalanceModal(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold"
                              >
                                <DollarSign size={14} /> Saldo
                              </button>
                              <button
                                type="button"
                                title="Registrar movimiento de EcoPuntos"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setPointsForm({ ...pointsForm, points: "", description: "" });
                                  setShowPointsModal(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-xl text-xs font-semibold"
                              >
                                <Coins size={14} /> Puntos
                              </button>
                              <button
                                type="button"
                                title="Ver movimientos y canjes"
                                onClick={() => void openHistory(client)}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <TablePagination
            currentPage={visibleClientsPage}
            totalPages={clientsPageCount}
            onPageChange={setClientsPage}
          />
        </section>
      )}

      {activeTab === "movements" && (
        <section className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Movimientos de cartera y EcoPuntos
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Historial unificado recibido del servidor
              </p>
            </div>
            <DateRangePicker
              value={dateFilter}
              options={DATE_OPTIONS}
              onChange={(option) => {
                setDateFilter(option.value);
                setMovementPage(1);
              }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3">Origen</th>
                  <th className="py-3">Detalle</th>
                  <th className="py-3 text-right">Monto / puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs sm:text-sm">
                {loadingMovements ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-500"><LoaderCircle className="inline animate-spin mr-2" size={17} />Cargando movimientos...</td></tr>
                ) : filteredMovements.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-500">No hay movimientos para este período.</td></tr>
                ) : (
                  filteredMovements.map((movement) => {
                    const source = getMovementSource(movement);
                    const isNegative = isNegativeMovement(movement);
                    const isLoyalty = source === "loyalty";
                    const value = movement.amount ?? movement.points ?? 0;
                    const amountText = isLoyalty
                      ? `${isNegative ? "−" : "+"}${Math.abs(value).toLocaleString()} pts`
                      : `${isNegative ? "−" : "+"}${formatCurrency(value)}`;
                    const name = clientById.get(movement.customerId)?.customerName || `Cliente ${movement.customerId}`;
                    return (
                      <tr key={`${source}-${movement.id}`}>
                        <td className="py-3.5 font-bold text-gray-900 dark:text-gray-100">{name}</td>
                        <td className="py-3.5 text-gray-500">{formatDate(movement.createdAt)}</td>
                        <td className="py-3.5"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${isLoyalty ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"}`}>{isLoyalty ? "EcoPuntos" : "Cartera"}</span></td>
                        <td className="py-3.5 text-gray-600 dark:text-gray-300">{movement.description || movement.concept || (movement.transactionType ? WALLET_TRANSACTION_LABELS[movement.transactionType as WalletTransactionPayload["transaction_type"]] || POINTS_TRANSACTION_LABELS[movement.transactionType as LoyaltyPointsTransactionPayload["transaction_type"]] || movement.transactionType : "Movimiento")}</td>
                        <td className={`py-3.5 text-right font-bold ${isNegative ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{amountText}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {movementPageCount > 1 && (
            <div className="mt-4">
              <TablePagination
                currentPage={movementPage}
                totalPages={movementPageCount}
                onPageChange={setMovementPage}
              />
            </div>
          )}
        </section>
      )}

      {activeTab === "loyalty" && (
        <section className="flex flex-col gap-7">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Clientes con más EcoPuntos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingClients ? (
                <p className="text-sm text-gray-500">Cargando clientes...</p>
              ) : filteredClients.slice(0, 3).map((client, index) => (
                <div key={client.customerId} className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative">
                  <div className="absolute top-3 left-3 bg-[#5b642a] text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">#{index + 1}</div>
                  <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-3"><Coins size={24} /></div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{client.customerName}</h3>
                  <span className="text-xs text-gray-400 mb-4">{client.identifier}</span>
                  <div className="w-full bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Saldo:</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{client.loyaltyPoints.pointsBalance.toLocaleString()} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-[#5b642a]" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recompensas disponibles</h2>
            </div>
            {loadingRewards ? (
              <p className="text-sm text-gray-500"><LoaderCircle className="inline animate-spin mr-2" size={16} />Cargando recompensas...</p>
            ) : rewards.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay recompensas disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rewards.map((reward) => (
                  <article key={reward.id} className="bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 rounded-2xl p-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{reward.name}</h3>
                      {reward.service?.name && <p className="text-xs text-gray-500 mt-1">Servicio: {reward.service.name}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-xs font-bold">{reward.pointsCost.toLocaleString()} pts</span>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">El API compartido permite consultar recompensas y canjes; no incluye un endpoint para solicitar un nuevo canje.</p>
          </div>
        </section>
      )}

      {showBalanceModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><DollarSign className="text-emerald-600" size={20} />Registrar movimiento de cartera</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cliente: <strong className="text-gray-800 dark:text-gray-200">{selectedClient.customerName}</strong></p>
            <form onSubmit={(event) => void handleBalanceSubmit(event)} className="flex flex-col gap-3 text-xs sm:text-sm">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Tipo de transacción
                <select value={balanceForm.transactionType} onChange={(event) => setBalanceForm({ ...balanceForm, transactionType: event.target.value as WalletTransactionPayload["transaction_type"] })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {Object.entries(WALLET_TRANSACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Monto (USD)
                <input type="number" step="0.01" min={balanceForm.transactionType === "adjustment" ? undefined : "0.01"} required placeholder="0.00" value={balanceForm.amount} onChange={(event) => setBalanceForm({ ...balanceForm, amount: event.target.value })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </label>
              {(balanceForm.transactionType === "top_up" || balanceForm.transactionType === "annual_fee") && (
                <label className="font-semibold text-gray-700 dark:text-gray-300">Método de pago
                  <select value={balanceForm.paymentMethod} onChange={(event) => setBalanceForm({ ...balanceForm, paymentMethod: event.target.value as NonNullable<WalletTransactionPayload["payment_method"]> })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <option value="transfer">Transferencia</option><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="check">Cheque</option>
                  </select>
                </label>
              )}
              {balanceForm.transactionType === "adjustment" && <p className="text-[11px] text-gray-500">Los ajustes admiten montos negativos, según las reglas del servidor.</p>}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBalanceModal(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#5b642a] text-white rounded-xl font-semibold disabled:opacity-60">{saving ? "Registrando..." : "Registrar transacción"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPointsModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Coins className="text-amber-500" size={20} />Registrar EcoPuntos</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setShowPointsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cliente: <strong className="text-gray-800 dark:text-gray-200">{selectedClient.customerName}</strong> · saldo actual {selectedClient.loyaltyPoints.pointsBalance.toLocaleString()} pts</p>
            <form onSubmit={(event) => void handlePointsSubmit(event)} className="flex flex-col gap-3 text-xs sm:text-sm">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Tipo de transacción
                <select value={pointsForm.transactionType} onChange={(event) => setPointsForm({ ...pointsForm, transactionType: event.target.value as LoyaltyPointsTransactionPayload["transaction_type"] })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  {Object.entries(POINTS_TRANSACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Cantidad de puntos
                <input type="number" min="1" step="1" required placeholder="Ej. 150" value={pointsForm.points} onChange={(event) => setPointsForm({ ...pointsForm, points: event.target.value })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </label>
              <label className="font-semibold text-gray-700 dark:text-gray-300">Descripción (opcional)
                <textarea rows={2} placeholder="Detalle del movimiento" value={pointsForm.description} onChange={(event) => setPointsForm({ ...pointsForm, description: event.target.value })} className="mt-1 w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </label>
              {pointsForm.transactionType === "redeemed" && <p className="text-[11px] text-gray-500">El servidor valida que el saldo de puntos no quede negativo. Este registro no solicita un canje de recompensa.</p>}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPointsModal(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#5b642a] text-white rounded-xl font-semibold disabled:opacity-60">{saving ? "Registrando..." : "Registrar puntos"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"><FileText className="text-[#5b642a]" size={20} />Historial: {selectedClient.customerName}</h3>
              <button type="button" aria-label="Cerrar" onClick={closeHistory} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl text-xs">
              <div><span className="text-gray-400 block">Saldo total disponible</span><strong className="text-gray-800 dark:text-gray-200 text-sm">{formatCurrency(selectedClient.wallet.totalAvailable)} USD</strong></div>
              <div><span className="text-gray-400 block">Saldo reservado</span><strong className="text-gray-800 dark:text-gray-200 text-sm">{formatCurrency(selectedClient.wallet.reservedSubscriptionBalance)} USD</strong></div>
              <div><span className="text-gray-400 block">EcoPuntos</span><strong className="text-amber-600 text-sm">{selectedClient.loyaltyPoints.pointsBalance.toLocaleString()} pts</strong></div>
            </div>
            {loadingHistory ? (
              <p className="py-8 text-center text-gray-500"><LoaderCircle className="inline animate-spin mr-2" size={17} />Cargando historial...</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Movimientos</h4>
                  {clientMovements.length === 0 ? <p className="text-xs text-gray-500 py-2">Sin movimientos registrados.</p> : clientMovements.map((movement) => {
                    const isLoyalty = getMovementSource(movement) === "loyalty";
                    const negative = isNegativeMovement(movement);
                    const amount = movement.amount ?? movement.points ?? 0;
                    return (
                      <div key={`${movement.source || movement.type}-${movement.id}`} className="py-2.5 border-b border-gray-100 dark:border-gray-700/60 flex items-start justify-between gap-4 text-xs">
                        <div><span className="font-bold text-gray-800 dark:text-gray-200 block">{movement.description || movement.concept || movement.transactionType || "Movimiento"}</span><span className="text-gray-400 text-[10px]">{formatDate(movement.createdAt)} · {isLoyalty ? "EcoPuntos" : "Cartera"}</span></div>
                        <span className={`shrink-0 font-bold ${negative ? "text-rose-600" : "text-emerald-600"}`}>{negative ? "−" : "+"}{isLoyalty ? `${Math.abs(amount).toLocaleString()} pts` : formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Canjes de recompensas</h4>
                  {redemptions.length === 0 ? <p className="text-xs text-gray-500 py-2">Sin canjes registrados.</p> : redemptions.map((redemption) => (
                    <div key={redemption.id} className="py-2.5 border-b border-gray-100 dark:border-gray-700/60 flex items-start justify-between gap-4 text-xs">
                      <div><span className="font-bold text-gray-800 dark:text-gray-200 block">{redemption.reward.name}</span><span className="text-gray-400 text-[10px]">{formatDate(redemption.requestedAt)} · {redemption.status}</span></div>
                      <span className="shrink-0 font-bold text-amber-600">−{redemption.pointsRedeemed.toLocaleString()} pts</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button type="button" onClick={closeHistory} className="mt-1 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200">Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}