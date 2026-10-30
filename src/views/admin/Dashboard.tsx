import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CircleAlert,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats, type AdminDashboardStats } from "../../services/dashboardService";

const EMPTY_STATS: AdminDashboardStats = {
  customers: { total: 0, active: 0, inactive: 0 },
  plans: 0,
  roles: 0,
  recentPlanDistribution: [],
};

const numberFormatter = new Intl.NumberFormat("es-SV");

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
    void getAdminDashboardStats()
      .then((response) => {
        setStats(response);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las estadísticas.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activePercentage = stats.customers.total
    ? Math.round((stats.customers.active / stats.customers.total) * 100)
    : 0;
  const recentPlanTotal = stats.recentPlanDistribution.reduce(
    (total, plan) => total + plan.count,
    0,
  );
  const pieColors = ["#6C7D38", "#B3C594", "#D6A84F", "#7C9BA6", "#9B8B72"];
  const pieGradient = stats.recentPlanDistribution.reduce(
    (gradient, plan, index) => {
      const start = gradient.end;
      const end = start + (plan.count / (recentPlanTotal || 1)) * 100;
      gradient.parts.push(`${pieColors[index % pieColors.length]} ${start}% ${end}%`);
      gradient.end = end;
      return gradient;
    },
    { parts: [] as string[], end: 0 },
  ).parts.join(", ");
  const slides = [
    {
      title: "Estado de clientes",
      description: "Distribución actual de la cartera registrada.",
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-[#2A3319] dark:text-gray-100">
                {numberFormatter.format(stats.customers.total)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                clientes registrados
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {activePercentage}% activos
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="bg-[#6C7D38]" style={{ width: `${activePercentage}%` }} />
            <div className="bg-amber-300 dark:bg-amber-600" style={{ width: `${100 - activePercentage}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span><b className="text-gray-800 dark:text-gray-200">{numberFormatter.format(stats.customers.active)}</b> activos</span>
            <span><b className="text-gray-800 dark:text-gray-200">{numberFormatter.format(stats.customers.inactive)}</b> inactivos</span>
          </div>
        </div>
      ),
      link: "/admin/clients",
      linkText: "Ver clientes",
    },
    {
      title: "Estructura de acceso",
      description: "Recursos disponibles para organizar la operación.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F4EFE6] p-4 dark:bg-gray-900">
            <ShieldCheck className="mb-5 text-[#6C7D38] dark:text-emerald-400" size={22} />
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(stats.roles)}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">roles configurados</p>
          </div>
          <div className="rounded-2xl bg-[#F4EFE6] p-4 dark:bg-gray-900">
            <Layers3 className="mb-5 text-[#6C7D38] dark:text-emerald-400" size={22} />
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(stats.plans)}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">planes disponibles</p>
          </div>
        </div>
      ),
      link: "/admin/roles",
      linkText: "Gestionar roles",
    },
  ];

  return (
    <div className="w-full p-4 font-sans sm:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200/60 pb-5 dark:border-gray-800 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#6C7D38] dark:text-emerald-400">Panel administrativo</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">Resumen general</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Una lectura rápida de la operación de Vergel.</p>
        </div>
        <button type="button" onClick={() => void loadStats()} disabled={isLoading} title="Actualizar estadísticas" className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-[#6C7D38] hover:text-[#6C7D38] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white sm:self-auto">
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <CircleAlert size={16} /> <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { title: "Clientes", value: stats.customers.total, icon: Users, tone: "text-[#6C7D38]" },
          { title: "Activos", value: stats.customers.active, icon: BriefcaseBusiness, tone: "text-emerald-600" },
          { title: "Roles", value: stats.roles, icon: ShieldCheck, tone: "text-sky-600" },
          { title: "Planes", value: stats.plans, icon: Layers3, tone: "text-amber-600" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return <div key={kpi.title} className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5"><Icon size={20} className={`mb-4 ${kpi.tone}`} /><p className="text-xs font-bold uppercase tracking-wider text-gray-400">{kpi.title}</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{isLoading ? "—" : numberFormatter.format(kpi.value)}</p></div>;
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><h2 className="font-bold text-gray-900 dark:text-gray-100">{slides[activeSlide].title}</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{slides[activeSlide].description}</p></div>
          <div className="flex items-center gap-1"><button type="button" title="Gráfica anterior" onClick={() => setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1))} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><ArrowLeft size={16} /></button><button type="button" title="Siguiente gráfica" onClick={() => setActiveSlide((current) => (current + 1) % slides.length)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><ArrowRight size={16} /></button></div>
        </div>
        {slides[activeSlide].content}
        <div className="mt-5 flex items-center justify-between"><div className="flex gap-1.5">{slides.map((slide, index) => <button key={slide.title} type="button" aria-label={`Mostrar ${slide.title}`} onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-6 bg-[#6C7D38]" : "w-1.5 bg-gray-300 dark:bg-gray-600"}`} />)}</div><Link to={slides[activeSlide].link} className="text-xs font-bold text-[#6C7D38] hover:underline dark:text-emerald-400">{slides[activeSlide].linkText}</Link></div>
      </section>

      <section className="rounded-3xl border border-gray-200/60 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">Planes asignados</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Clientes registrados durante los últimos tres meses.
          </p>
        </div>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">Cargando distribución...</div>
        ) : recentPlanTotal === 0 ? (
          <div className="flex h-48 items-center justify-center text-center text-sm text-gray-400">No hay asignaciones recientes para mostrar.</div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${pieGradient})` }}>
              <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-800">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(recentPlanTotal)}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">asignaciones</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:max-w-[190px]">
              {stats.recentPlanDistribution.map((plan, index) => (
                <div key={plan.name} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} /><span className="truncate">{plan.name}</span></span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(plan.count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-5 border-t border-gray-100 pt-4 text-[11px] leading-relaxed text-gray-400 dark:border-gray-700 dark:text-gray-500">
          El backend actual no expone compras históricas; la gráfica usa las asignaciones de plan disponibles en clientes registrados en el periodo.
        </p>
      </section>
      </div>
    </div>
  );
}
