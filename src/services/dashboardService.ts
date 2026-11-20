import { getAppointments } from "./appointmentService";
import { getAuditLogs } from "./auditService";
import { getCustomers } from "./customerService";
import { getQuotes } from "./quoteService";
import { getRoles } from "./roleService";
import { getSubscriptionPlans } from "./subscriptionPlanService";

export interface AdminDashboardStats {
  customers: {
    total: number;
    active: number;
    inactive: number;
  };
  plans: number;
  roles: number;
  recentPlanDistribution: Array<{
    name: string;
    count: number;
  }>;
}

export interface QuoteDashboardStats {
  monthlyQuotes: number;
  monthlyAmount: number;
  approvalRate: number;
  pending: number;
}

export interface CounterDashboardStats {
  income: number;
  expenses: number;
  accountsReceivable: number;
  quotesIssued: number;
}

export interface AuditorDashboardStats {
  monthlyMovements: number;
  auditedIncome: number;
  pendingReview: number;
  discrepancies: number;
}

export interface TechnicalDashboardStats {
  todayVisits: number;
  completedMonth: number;
  pendingVisits: number;
}

const getCustomerTotal = async (status?: string): Promise<number> => {
  const response = await getCustomers({ status, limit: 1 });
  return response.meta.total;
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const [
    customers,
    active,
    inactive,
    plans,
    roles,
    recentCustomers,
  ] = await Promise.all([
    getCustomerTotal(),
    getCustomerTotal("active"),
    getCustomerTotal("inactive"),
    getSubscriptionPlans().catch(() => []),
    getRoles().catch(() => []),
    getCustomers({
      desde: formatDate(threeMonthsAgo),
      hasta: formatDate(today),
      limit: 1000,
    }).catch(() => null),
  ]);

  const distribution = new Map<string, number>();
  recentCustomers?.data.forEach((customer) => {
    const planName = customer.currentPlanName || "Sin plan";
    distribution.set(planName, (distribution.get(planName) ?? 0) + 1);
  });

  return {
    customers: { total: customers, active, inactive },
    plans: plans.length,
    roles: roles.length,
    recentPlanDistribution: Array.from(distribution, ([name, count]) => ({
      name,
      count,
    })).sort((first, second) => second.count - first.count),
  };
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getQuoteDashboardStats = async (): Promise<QuoteDashboardStats> => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const response = await getQuotes({ limit: 1000 });
  const monthly = response.data.filter((quote) => {
    const created = quote.createdAt ? new Date(quote.createdAt) : null;
    return created && created >= monthStart && created <= today;
  });
  const paid = monthly.filter((quote) => quote.status === "paid").length;

  return {
    monthlyQuotes: monthly.length,
    monthlyAmount: monthly.reduce((total, quote) => total + quote.total, 0),
    approvalRate: monthly.length ? Math.round((paid / monthly.length) * 100) : 0,
    pending: response.data.filter((quote) => quote.status === "pending").length,
  };
};

export const getCounterDashboardStats = async (): Promise<CounterDashboardStats> => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const quotes = await getQuotes({ limit: 1000 }).catch(() => null);
  const data = quotes?.data ?? [];
  const monthly = data.filter((quote) => {
    const created = quote.createdAt ? new Date(quote.createdAt) : null;
    return created && created >= monthStart && created <= today;
  });

  return {
    income: monthly.filter((quote) => quote.status === "paid").reduce((total, quote) => total + quote.total, 0),
    expenses: 0,
    accountsReceivable: monthly.filter((quote) => quote.status === "pending").reduce((total, quote) => total + quote.total, 0),
    quotesIssued: monthly.length,
  };
};

export const getAuditorDashboardStats = async (): Promise<AuditorDashboardStats> => {
  const today = new Date();
  const monthStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const to = formatDate(today);
  const movements = await getAuditLogs({ start_date: monthStart, end_date: to, limit: 100 }).catch(() => null);
  const logs = movements?.data ?? [];

  return {
    monthlyMovements: movements?.meta?.total ?? logs.length,
    auditedIncome: 0,
    pendingReview: logs.filter((log) => log.action === "denied").length,
    discrepancies: logs.filter((log) => log.action === "denied" || log.action === "delete").length,
  };
};

export const getTechnicalDashboardStats = async (): Promise<TechnicalDashboardStats> => {
  const today = new Date();
  const todayText = formatDate(today);
  const monthStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));

  let employeeId: number | undefined;
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") ?? "null") as { employee_id?: number; employee?: { id?: number } } | null;
    employeeId = storedUser?.employee_id ?? storedUser?.employee?.id;
  } catch {
    employeeId = undefined;
  }

  const appointments = await getAppointments({ all: true }).catch(() => ({ data: [] }));
  const assigned = employeeId
    ? appointments.data.filter((appointment) => appointment.employeeId === employeeId)
    : appointments.data;

  const todayVisits = assigned.filter((appointment) => appointment.appointmentDate === todayText);
  const monthVisits = assigned.filter((appointment) => {
    const date = appointment.appointmentDate;
    return date >= monthStart && date <= todayText;
  });
  const pendingStatuses = new Set(["pending", "confirmed"]);

  return {
    todayVisits: todayVisits.length,
    completedMonth: monthVisits.filter((appointment) => appointment.status === "completed").length,
    pendingVisits: todayVisits.filter((appointment) => pendingStatuses.has(appointment.status)).length,
  };
};