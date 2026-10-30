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
  return response.meta.total;
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const [customers, active, inactive, plans, roles, recentCustomers] = await Promise.all([
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