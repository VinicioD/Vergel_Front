import { useMemo, useState } from "react";
import { Award, Coins, History, Search, Wallet } from "lucide-react";
import Input from "../../../../components/Input";
import KpiCard from "../../../../components/KpiCard";
import Table, { type Column } from "../../../../components/Table";

type WalletTab = "clients" | "transactions" | "top";

interface ClientWallet {
  id: string;
  code: string;
  name: string;
  phone: string;
  balance: number;
  isSubscription: boolean;
  ecoPoints: number;
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

const CLIENTS: ClientWallet[] = [
  {
    id: "1",
    code: "CLI-2026-001",
    name: "Residencial Los Parques",
    phone: "+503 7890-1234",
    balance: 1450,
    isSubscription: true,
    ecoPoints: 1250,
  },
  {
    id: "2",
    code: "CLI-2026-002",
    name: "Club Campestre San Isidro",
    phone: "+503 7123-4567",
    balance: -320.5,
    isSubscription: false,
    ecoPoints: 480,
  },
  {
    id: "3",
    code: "CLI-2026-003",
    name: "Condominio Las Hortensias",
    phone: "+503 7555-9876",
    balance: 0,
    isSubscription: false,
    ecoPoints: 85,
  },
  {
    id: "4",
    code: "CLI-2026-004",
    name: "Inmobiliaria Bosques",
    phone: "+503 7222-3344",
    balance: 2800,
    isSubscription: true,
    ecoPoints: 3400,
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "TR-001",
    clientName: "Residencial Los Parques",
    date: "2026-10-24",
    type: "Saldo",
    subType: "Recarga Anualidad",
    amount: "+$1,450.00",
    description: "Suscripción Plan Anual de Mantenimiento Jardinería",
    isPositive: true,
  },
  {
    id: "TR-002",
    clientName: "Club Campestre San Isidro",
    date: "2026-10-22",
    type: "Saldo",
    subType: "Servicio a Crédito",
    amount: "-$320.50",
    description: "Poda de árboles de altura sin saldo disponible",
    isPositive: false,
  },
  {
    id: "TR-003",
    clientName: "Inmobiliaria Bosques",
    date: "2026-10-20",
    type: "EcoPuntos",
    subType: "Ganados por compra",
    amount: "+450 pts",
    description: "Factura FAC-2026-091 pagada con éxito",
    isPositive: true,
  },
  {
    id: "TR-004",
    clientName: "Residencial Los Parques",
    date: "2026-10-18",
    type: "EcoPuntos",
    subType: "Usados por redención",
    amount: "-200 pts",
    description: "Redención de descuento en fertilizantes orgánicos",
    isPositive: false,
  },
];

const currency = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

const clientColumns: Column<ClientWallet>[] = [
  {
    header: "Cliente",
    render: (client) => (
      <div className="flex items-center gap-3 whitespace-nowrap">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ede7dc] text-sm font-bold text-[#5b642a]">
          {client.name
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {client.name}
          </span>
          <span className="text-[10px] text-gray-500">
            {client.isSubscription ? "Plan Anual Suscrito" : "Cuenta Estándar"}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "ID y teléfono",
    render: (client) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="font-semibold">{client.code}</span>
        <span className="text-xs text-gray-500">{client.phone}</span>
      </div>
    ),
  },
  {
    header: "Saldo monetario",
    render: (client) => (
      <div className="flex flex-col whitespace-nowrap">
        <span
          className={`font-bold ${
            client.balance < 0
              ? "text-rose-600 dark:text-rose-400"
              : client.balance > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {currency.format(Math.abs(client.balance))}
          {client.balance < 0 ? " (Deuda)" : ""}
        </span>
        <span className="text-[10px] text-gray-500">
          {client.isSubscription
            ? "Reservado para mantenimientos"
            : "Cuenta corriente activa"}
        </span>
      </div>
    ),
  },
  {
    header: "EcoPuntos",
    render: (client) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-bold">
        <Coins size={16} className="text-amber-500" />
        {client.ecoPoints.toLocaleString("es-SV")} pts
      </span>
    ),
  },
];

const transactionColumns: Column<Transaction>[] = [
  {
    header: "Cliente",
    accessorKey: "clientName",
    className: "font-semibold",
  },
  {
    header: "Fecha",
    render: (transaction) => formatDate(transaction.date),
  },
  {
    header: "Tipo",
    render: (transaction) => (
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          transaction.type === "Saldo"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        }`}
      >
        {transaction.subType}
      </span>
    ),
  },
  {
    header: "Detalle",
    accessorKey: "description",
  },
  {
    header: "Monto / Puntos",
    accessorKey: "amount",
    className: "text-right font-bold",
    render: (transaction) => (
      <span
        className={
          transaction.isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }
      >
        {transaction.amount}
      </span>
    ),
  },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<WalletTab>("clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClients = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("es");
    if (!search) return CLIENTS;
    return CLIENTS.filter((client) =>
      [client.name, client.code, client.phone].some((value) =>
        value.toLocaleLowerCase("es").includes(search),
      ),
    );
  }, [searchTerm]);

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("es");
    if (!search) return TRANSACTIONS;
    return TRANSACTIONS.filter((transaction) =>
      [
        transaction.clientName,
        transaction.type,
        transaction.subType,
        transaction.description,
        transaction.amount,
      ].some((value) => value.toLocaleLowerCase("es").includes(search)),
    );
  }, [searchTerm]);

  const topClients = [...CLIENTS].sort((a, b) => b.ecoPoints - a.ecoPoints);
  const totalBalance = CLIENTS.reduce(
    (total, client) => total + client.balance,
    0,
  );
  const totalPoints = CLIENTS.reduce(
    (total, client) => total + client.ecoPoints,
    0,
  );

  const changeTab = (tab: WalletTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  return (
    <div className="flex w-full flex-col gap-6 p-4 font-sans sm:p-6">
      <header className="border-b border-gray-200/60 pb-4 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          Billetera &amp; EcoPuntos
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          Consulta saldos, cuentas de clientes e historial de movimientos.
        </p>
      </header>

      <section
        aria-label="Resumen de billetera"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          title="Clientes registrados"
          value={CLIENTS.length.toString()}
          badgeText="Cuentas"
          badgeType="neutral"
        />
        <KpiCard
          title="Saldo neto de cuentas"
          value={currency.format(totalBalance)}
          badgeText="Saldo"
          badgeType="positive"
        />
        <KpiCard
          title="EcoPuntos acumulados"
          value={totalPoints.toLocaleString("es-SV")}
          badgeText="Puntos"
          badgeType="warning"
        />
        <KpiCard
          title="Cuentas con plan anual"
          value={CLIENTS.filter((client) => client.isSubscription).length.toString()}
          badgeText="Activas"
          badgeType="positive"
        />
      </section>

      <nav
        aria-label="Secciones de billetera"
        className="flex items-center gap-2 overflow-x-auto border-b border-gray-200/80 pb-1 dark:border-gray-700"
      >
        <button
          type="button"
          aria-pressed={activeTab === "clients"}
          onClick={() => changeTab("clients")}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "clients"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Wallet size={16} />
          Clientes y cuentas
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "transactions"}
          onClick={() => changeTab("transactions")}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "transactions"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <History size={16} />
          Historial de transacciones
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "top"}
          onClick={() => changeTab("top")}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "top"
              ? "bg-[#5b642a] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Award size={16} />
          Clientes con más EcoPuntos
        </button>
      </nav>

      {activeTab !== "top" ? (
        <section className="flex min-w-0 flex-col gap-4">
          <div className="relative w-full max-w-xl">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <Input
              aria-label={
                activeTab === "clients"
                  ? "Buscar clientes"
                  : "Buscar transacciones"
              }
              placeholder={
                activeTab === "clients"
                  ? "Buscar cliente por nombre, ID o teléfono..."
                  : "Buscar en el historial..."
              }
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl pl-10"
            />
          </div>
          {activeTab === "clients" ? (
            <Table
              data={filteredClients}
              columns={clientColumns}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={5}
              entityName="clientes"
            />
          ) : (
            <Table
              data={filteredTransactions}
              columns={transactionColumns}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={5}
              entityName="movimientos"
            />
          )}
        </section>
      ) : (
        <section
          aria-label="Clientes con más EcoPuntos"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {topClients.map((client, index) => (
            <article
              key={client.id}
              className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#5b642a] text-xs font-bold text-white">
                #{index + 1}
              </span>
              <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5b642a] bg-[#ede7dc] text-lg font-bold text-[#5b642a]">
                {client.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {client.name}
              </h2>
              <span className="mb-4 text-xs text-gray-500">{client.code}</span>
              <div className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                <span className="text-xs font-medium text-gray-500">
                  Acumulado:
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                  <Coins size={16} />
                  {client.ecoPoints.toLocaleString("es-SV")} pts
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
