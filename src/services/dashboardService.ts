import { getCustomers } from "./customerService";
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
