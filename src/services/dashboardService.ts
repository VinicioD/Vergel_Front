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

export interface AuditorDashboardStats {
  monthlyMovements: number;
  auditedIncome: number;
  pendingReview: number;
  discrepancies: number;
}

export interface CounterDashboardStats {
  income: number;
  expenses: number;
  accountsReceivable: number;
  quotesIssued: number;
}

export interface QuoteDashboardStats {
  monthlyQuotes: number;
  monthlyAmount: number;
  approvalRate: number;
  pending: number;
}

export interface TechnicalDashboardStats {
  todayVisits: number;
  completedMonth: number;
  pendingVisits: number;
}

const getCustomerTotal = async (status?: string): Promise<number> => {
  const response = await getCustomers({ status, limit: 1 });
  return response.meta?.total ?? response.data.length;
};

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

export const getAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const [
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      plansResponse,
      rolesResponse,
      recentCustomers,
    ] = await Promise.all([
      getCustomerTotal().catch(() => 0),
      getCustomerTotal("active").catch(() => 0),
      getCustomerTotal("inactive").catch(() => 0),
      getSubscriptionPlans().catch(() => []),
      getRoles({ limit: 1 }).catch(() => null),
      getCustomers({
        desde: formatDate(threeMonthsAgo),
        hasta: formatDate(today),
        limit: 100,
      }).catch(() => null),
    ]);

    const plansCount = Array.isArray(plansResponse)
      ? plansResponse.length
      : Array.isArray((plansResponse as { data?: unknown[] })?.data)
        ? (plansResponse as { data: unknown[] }).data.length
        : 0;

    const rolesCount = rolesResponse
      ? (rolesResponse.meta?.total ?? rolesResponse.data.length)
      : 0;

    const distribution = new Map<string, number>();
    recentCustomers?.data.forEach((customer) => {
      const planName = customer.currentPlanName || "Sin plan";
      distribution.set(planName, (distribution.get(planName) ?? 0) + 1);
    });

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
      },
      plans: plansCount,
      roles: rolesCount,
      recentPlanDistribution: Array.from(distribution, ([name, count]) => ({
        name,
        count,
      })).sort((first, second) => second.count - first.count),
    };
  };

export const getAuditorDashboardStats =
  async (): Promise<AuditorDashboardStats> => {
    const now = new Date();
    const startOfMonth = formatDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    const today = formatDate(now);

    const paidQuotes = await getQuotes({
      status: "paid",
      desde: startOfMonth,
      hasta: today,
      limit: 100,
    }).catch(() => null);

    const auditedIncome = (paidQuotes?.data ?? []).reduce(
      (sum, quote) => sum + (Number.isFinite(quote.total) ? quote.total : 0),
      0,
    );

    return {
      monthlyMovements: paidQuotes?.meta?.total ?? paidQuotes?.data.length ?? 0,
      auditedIncome,
      pendingReview: 0,
      discrepancies: 0,
    };
  };

export const getCounterDashboardStats =
  async (): Promise<CounterDashboardStats> => {
    const now = new Date();
    const startOfMonth = formatDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    const today = formatDate(now);

    const [paidMonthResponse, pendingAllResponse, issuedMonthResponse] =
      await Promise.all([
        getQuotes({
          status: "paid",
          desde: startOfMonth,
          hasta: today,
          limit: 100,
        }).catch(() => null),
        getQuotes({
          status: "pending",
          limit: 100,
        }).catch(() => null),
        getQuotes({
          desde: startOfMonth,
          hasta: today,
          limit: 1,
        }).catch(() => null),
      ]);

    const income = (paidMonthResponse?.data ?? []).reduce(
      (sum, quote) => sum + (Number.isFinite(quote.total) ? quote.total : 0),
      0,
    );

    const accountsReceivable = (pendingAllResponse?.data ?? []).reduce(
      (sum, quote) => sum + (Number.isFinite(quote.total) ? quote.total : 0),
      0,
    );

    return {
      income,
      expenses: 0,
      accountsReceivable,
      quotesIssued:
        issuedMonthResponse?.meta?.total ??
        issuedMonthResponse?.data.length ??
        0,
    };
  };

export const getQuoteDashboardStats =
  async (): Promise<QuoteDashboardStats> => {
    const now = new Date();
    const startOfMonth = formatDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    const today = formatDate(now);

    const [monthQuotesResponse, pendingQuotesResponse] = await Promise.all([
      getQuotes({
        desde: startOfMonth,
        hasta: today,
        limit: 100,
      }).catch(() => null),
      getQuotes({
        status: "pending",
        limit: 1,
      }).catch(() => null),
    ]);

    const monthQuotes = monthQuotesResponse?.data ?? [];
    const monthlyQuotes =
      monthQuotesResponse?.meta?.total ?? monthQuotes.length;
    const monthlyAmount = monthQuotes.reduce(
      (sum, quote) => sum + (Number.isFinite(quote.total) ? quote.total : 0),
      0,
    );
    const paidInMonth = monthQuotes.filter(
      (quote) => quote.status === "paid",
    ).length;
    const approvalRate =
      monthQuotes.length > 0
        ? Math.round((paidInMonth / monthQuotes.length) * 100)
        : 0;

    return {
      monthlyQuotes,
      monthlyAmount,
      approvalRate,
      pending:
        pendingQuotesResponse?.meta?.total ??
        pendingQuotesResponse?.data.length ??
        0,
    };
  };

export const getTechnicalDashboardStats =
  async (): Promise<TechnicalDashboardStats> => {
    return {
      todayVisits: 0,
      completedMonth: 0,
      pendingVisits: 0,
    };
  };
