import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CircleAlert,
  FileText,
  Layers3,
  Percent,
  RefreshCw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "../../services/dashboardService";

const EMPTY_STATS: AdminDashboardStats = {
  customers: { total: 0, active: 0, inactive: 0 },
  plans: 0,
  roles: 0,
  recentPlanDistribution: [],
};

const numberFormatter = new Intl.NumberFormat("es-SV");
const pieColors = ["#6C7D38", "#B3C594", "#D6A84F", "#7C9BA6", "#9B8B72"];

const QUICK_LINKS = [
  { label: "Cotizaciones", to: "/admin/quotes", icon: FileText },
  { label: "Movimientos", to: "/admin/movements", icon: WalletCards },
  { label: "Tarifas", to: "/admin/rates", icon: Percent },
  { label: "Colaboradores", to: "/admin/users", icon: Users },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      setStats(await getAdminDashboardStats());
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las estadísticas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void getAdminDashboardStats()
      .then((response) => {
        if (!active) return;
        setStats(response);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las estadísticas.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activePercentage = stats.customers.total
    ? Math.round((stats.customers.active / stats.customers.total) * 100)
    : 0;
  const inactivePercentage = stats.customers.total
    ? Math.max(0, 100 - activePercentage)
    : 0;

  const recentPlanTotal = stats.recentPlanDistribution.reduce(
    (total, plan) => total + plan.count,
    0,
  );
  const avgPerPlan =
    stats.plans > 0 ? (recentPlanTotal / stats.plans).toFixed(1) : "0.0";

  const pieGradient = stats.recentPlanDistribution
    .reduce(
      (gradient, plan, index) => {
        const start = gradient.end;
        const end = start + (plan.count / (recentPlanTotal || 1)) * 100;
        gradient.parts.push(
          `${pieColors[index % pieColors.length]} ${start}% ${end}%`,
        );
        gradient.end = end;
        return gradient;
      },
      { parts: [] as string[], end: 0 },
    )
    .parts.join(", ");

  const kpis = [
    {
      title: "Clientes totales",
      value: stats.customers.total,
      meta: `${numberFormatter.format(stats.customers.inactive)} inactivos`,
      icon: Users,
      tone: "text-[#6C7D38] bg-[#6C7D38]/10 dark:text-emerald-400 dark:bg-emerald-950/50",
    },
    {
      title: "Clientes activos",
      value: stats.customers.active,
      meta: `${activePercentage}% de retención`,
      icon: BriefcaseBusiness,
      tone: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950/50",
    },
    {
      title: "Planes activos",
      value: stats.plans,
      meta: `${avgPerPlan} asignaciones/plan`,
      icon: Layers3,
      tone: "text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/50",
    },
    {
      title: "Roles del sistema",
      value: stats.roles,
      meta: "Perfiles configurados",
      icon: ShieldCheck,
      tone: "text-sky-700 bg-sky-100/80 dark:text-sky-300 dark:bg-sky-950/50",
    },
  ];

  const slides = [
    {
      title: "Salud de la cartera",
      description: "Proporción entre clientes activos e inactivos.",
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-[#2A3319] dark:text-gray-100">
                {numberFormatter.format(stats.customers.total)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                clientes en el sistema
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {activePercentage}% activos
            </span>
          </div>

          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="bg-[#6C7D38] transition-all duration-300"
              style={{ width: `${activePercentage}%` }}
            />
            <div
              className="bg-amber-300 transition-all duration-300 dark:bg-amber-600"
              style={{ width: `${inactivePercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-[#F4EFE6] p-3 dark:bg-gray-900">
              <span className="text-gray-500 dark:text-gray-400">Activos</span>
              <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-gray-100">
                {numberFormatter.format(stats.customers.active)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F4EFE6] p-3 dark:bg-gray-900">
              <span className="text-gray-500 dark:text-gray-400">
                Inactivos
              </span>
              <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-gray-100">
                {numberFormatter.format(stats.customers.inactive)}
              </p>
            </div>
          </div>
        </div>
      ),
      link: "/admin/clients",
      linkText: "Ir a clientes",
    },
    {
      title: "Adopción reciente de planes",
      description: "Resumen de suscripciones en los últimos tres meses.",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl bg-[#F4EFE6] p-4 dark:bg-gray-900">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total asignaciones recientes
              </p>
              <p className="mt-0.5 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {numberFormatter.format(recentPlanTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Promedio por plan
              </p>
              <p className="mt-0.5 text-xl font-bold text-[#6C7D38] dark:text-emerald-400">
                {avgPerPlan}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Revisa qué planes concentran más clientes nuevos y ajusta tus
            campañas o tarifas según la demanda.
          </p>
        </div>
      ),
      link: "/admin/plans",
      linkText: "Ver planes",
    },
  ];

  return (
    <div className="w-full p-4 font-sans sm:p-6">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200/60 pb-5 dark:border-gray-800 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#6C7D38] dark:text-emerald-400">
            Panel administrativo
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Resumen general
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Estado de la cartera, planes y accesos rápidos de Vergel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          title="Actualizar estadísticas"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-[#6C7D38] hover:text-[#6C7D38] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white sm:self-auto"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <CircleAlert size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tone}`}
                >
                  <Icon size={20} />
                </span>
                {isLoading ? (
                  <span className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {kpi.meta}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {kpi.title}
              </p>
              {isLoading ? (
                <div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ) : (
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {numberFormatter.format(kpi.value)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gráficas */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col justify-between rounded-3xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">
                  {slides[activeSlide].title}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {slides[activeSlide].description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Tarjeta anterior"
                  onClick={() =>
                    setActiveSlide((current) =>
                      current === 0 ? slides.length - 1 : current - 1,
                    )
                  }
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  title="Siguiente tarjeta"
                  onClick={() =>
                    setActiveSlide((current) => (current + 1) % slides.length)
                  }
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4 py-2 animate-pulse">
                <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/60" />
                  <div className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/60" />
                </div>
              </div>
            ) : (
              slides[activeSlide].content
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700/60">
            <div className="flex gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Mostrar ${slide.title}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeSlide
                      ? "w-6 bg-[#6C7D38]"
                      : "w-1.5 bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <Link
              to={slides[activeSlide].link}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6C7D38] hover:underline dark:text-emerald-400"
            >
              {slides[activeSlide].linkText}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-3xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div>
            <div className="mb-5">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                Planes asignados
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Clientes registrados durante los últimos tres meses.
              </p>
            </div>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center gap-6 animate-pulse">
                <div className="h-40 w-40 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ) : recentPlanTotal === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 px-4 text-center text-sm text-gray-400 dark:border-gray-700">
                No hay asignaciones recientes para mostrar.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <div
                  className="relative h-40 w-40 shrink-0 rounded-full"
                  style={{ background: `conic-gradient(${pieGradient})` }}
                >
                  <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-800">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {numberFormatter.format(recentPlanTotal)}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      asignaciones
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 sm:max-w-[210px]">
                  {stats.recentPlanDistribution.map((plan, index) => {
                    const share = recentPlanTotal
                      ? Math.round((plan.count / recentPlanTotal) * 100)
                      : 0;
                    return (
                      <div
                        key={plan.name}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                pieColors[index % pieColors.length],
                            }}
                          />
                          <span className="truncate">{plan.name}</span>
                        </span>
                        <span className="shrink-0 font-bold text-gray-900 dark:text-gray-100">
                          {numberFormatter.format(plan.count)}{" "}
                          <span className="font-normal text-gray-400">
                            ({share}%)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-400 dark:border-gray-700 dark:text-gray-500">
            Distribución calculada a partir de los planes vinculados a clientes
            registrados en el periodo reciente.
          </p>
        </section>
      </div>

      {/* Accesos rápidos */}
      <section className="rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Accesos rápidos
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-2xl border border-gray-200/70 bg-gray-50/70 px-4 py-3 text-xs font-semibold text-gray-700 transition hover:border-[#6C7D38] hover:bg-[#6C7D38]/5 hover:text-[#2A3319] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:border-emerald-500/50 dark:hover:text-white sm:text-sm"
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={17}
                    className="shrink-0 text-[#6C7D38] dark:text-emerald-400"
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <ArrowUpRight size={15} className="shrink-0 text-gray-400" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
