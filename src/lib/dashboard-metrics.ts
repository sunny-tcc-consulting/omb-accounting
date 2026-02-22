/**
 * Dashboard Metrics Calculation Service (Mock/Simulation Version)
 * Part of Phase 4.5: Dashboard & Analytics
 *
 * This version uses simulated data when Prisma is not available.
 * Replace with real Prisma queries when database is configured.
 */

import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
} from "date-fns";

// Date range type
export interface DateRange {
  start: Date;
  end: Date;
}

// Dashboard metrics interface
export interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  expenses: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  profit: {
    current: number;
    previous: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
  accountsReceivable: {
    total: number;
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
  };
  accountsPayable: {
    total: number;
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
  };
}

// Get date range based on period
export function getDateRange(
  period: "month" | "quarter" | "year",
  date?: Date,
): {
  current: DateRange;
  previous: DateRange;
} {
  const now = date || new Date();

  let current: DateRange;
  let previous: DateRange;

  switch (period) {
    case "month":
      current = {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
      previous = {
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1)),
      };
      break;
    case "quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const currentQuarterStart = new Date(
        now.getFullYear(),
        currentQuarter * 3,
        1,
      );
      const currentQuarterEnd = endOfMonth(
        new Date(now.getFullYear(), currentQuarter * 3 + 2, 1),
      );

      const previousQuarterStart = new Date(
        now.getFullYear(),
        (currentQuarter - 1) * 3,
        1,
      );
      const previousQuarterEnd = endOfMonth(
        new Date(now.getFullYear(), (currentQuarter - 1) * 3 + 2, 1),
      );

      current = { start: currentQuarterStart, end: currentQuarterEnd };
      previous = { start: previousQuarterStart, end: previousQuarterEnd };
      break;
    case "year":
      current = {
        start: startOfYear(now),
        end: endOfMonth(now),
      };
      previous = {
        start: startOfYear(subMonths(now, 12)),
        end: endOfMonth(subMonths(now, 12)),
      };
      break;
    default:
      current = {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
      previous = {
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1)),
      };
  }

  return { current, previous };
}

// Generate random number within range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate deterministic but varying data based on period
function generateMockData(period: "month" | "quarter" | "year"): {
  revenue: number;
  expenses: number;
  ar: {
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
  };
  ap: {
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
  };
  cashFlow: { operating: number; investing: number; financing: number };
} {
  // Base values that vary by period
  const multiplier = period === "month" ? 1 : period === "quarter" ? 3 : 10;

  // Use current date to generate consistent "random" values
  const now = new Date();
  const seed = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();

  const revenue = (seed % 50000) + 20000 * multiplier;
  const expenses = (seed % 30000) + 10000 * multiplier;

  return {
    revenue,
    expenses,
    ar: {
      current: revenue * 0.6,
      overdue30: revenue * 0.2,
      overdue60: revenue * 0.12,
      overdue90: revenue * 0.08,
    },
    ap: {
      current: expenses * 0.5,
      overdue30: expenses * 0.25,
      overdue60: expenses * 0.15,
      overdue90: expenses * 0.1,
    },
    cashFlow: {
      operating: revenue * 0.8 - expenses * 0.9,
      investing: -randomInRange(5000, 15000) * (period === "month" ? 1 : 3),
      financing: randomInRange(-5000, 10000) * (period === "month" ? 1 : 3),
    },
  };
}

// Calculate trend
function calculateTrend(
  current: number,
  previous: number,
): {
  change: number;
  trend: "up" | "down" | "stable";
} {
  if (previous === 0) {
    return {
      change: current > 0 ? 100 : 0,
      trend: current > 0 ? "up" : "stable",
    };
  }

  const change = ((current - previous) / previous) * 100;
  let trend: "up" | "down" | "stable";

  if (change > 5) {
    trend = "up";
  } else if (change < -5) {
    trend = "down";
  } else {
    trend = "stable";
  }

  return { change: Math.round(change * 10) / 10, trend };
}

// Main function to get dashboard metrics
export async function getDashboardMetrics(
  period: "month" | "quarter" | "year" = "month",
): Promise<DashboardMetrics> {
  // Generate mock data for current and previous periods
  const currentData = generateMockData(period);
  const previousData = generateMockData(period);

  const currentRevenue = currentData.revenue;
  const currentExpenses = currentData.expenses;
  const previousRevenue = previousData.revenue;
  const previousExpenses = previousData.expenses;

  const revenueTrend = calculateTrend(currentRevenue, previousRevenue);
  const expensesTrend = calculateTrend(currentExpenses, previousExpenses);

  const currentProfit = currentRevenue - currentExpenses;
  const previousProfit = previousRevenue - previousExpenses;
  const profitTrend = calculateTrend(currentProfit, previousProfit);

  const netCashFlow =
    currentData.cashFlow.operating +
    currentData.cashFlow.investing +
    currentData.cashFlow.financing;

  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      ...revenueTrend,
    },
    expenses: {
      current: currentExpenses,
      previous: previousExpenses,
      ...expensesTrend,
    },
    profit: {
      current: currentProfit,
      previous: previousProfit,
      ...profitTrend,
    },
    cashFlow: {
      operating: currentData.cashFlow.operating,
      investing: currentData.cashFlow.investing,
      financing: currentData.cashFlow.financing,
      net: netCashFlow,
    },
    accountsReceivable: {
      total:
        currentData.ar.current +
        currentData.ar.overdue30 +
        currentData.ar.overdue60 +
        currentData.ar.overdue90,
      current: currentData.ar.current,
      overdue30: currentData.ar.overdue30,
      overdue60: currentData.ar.overdue60,
      overdue90: currentData.ar.overdue90,
    },
    accountsPayable: {
      total:
        currentData.ap.current +
        currentData.ap.overdue30 +
        currentData.ap.overdue60 +
        currentData.ap.overdue90,
      current: currentData.ap.current,
      overdue30: currentData.ap.overdue30,
      overdue60: currentData.ap.overdue60,
      overdue90: currentData.ap.overdue90,
    },
  };
}

// Revenue by month for charts
export async function getRevenueByMonth(months: number = 12): Promise<
  Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>
> {
  const result = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthData = generateMockData("month");

    result.push({
      month: format(monthDate, "MMM yyyy"),
      revenue: monthData.revenue,
      expenses: monthData.expenses,
      profit: monthData.revenue - monthData.expenses,
    });
  }

  return result;
}

// Expense breakdown by category
export async function getExpenseByCategory(dateRange: DateRange): Promise<
  Array<{
    category: string;
    amount: number;
    percentage: number;
  }>
> {
  const categories = [
    { name: "Payroll", base: 0.4 },
    { name: "Rent & Utilities", base: 0.15 },
    { name: "Marketing", base: 0.12 },
    { name: "Software & Tools", base: 0.08 },
    { name: "Travel", base: 0.07 },
    { name: "Office Supplies", base: 0.05 },
    { name: "Professional Services", base: 0.08 },
    { name: "Other", base: 0.05 },
  ];

  const totalExpenses = randomInRange(15000, 25000);

  return categories
    .map((cat) => ({
      category: cat.name,
      amount: Math.round(totalExpenses * cat.base),
      percentage: Math.round(cat.base * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Top customers by revenue
export async function getTopCustomers(limit: number = 10): Promise<
  Array<{
    id: string;
    name: string;
    totalRevenue: number;
    invoiceCount: number;
  }>
> {
  const customerNames = [
    "Acme Corporation",
    "TechStart Inc.",
    "Global Solutions Ltd",
    "Innovation Labs",
    "Digital Dynamics",
    "Smart Systems Co.",
    "Cloud Nine Tech",
    "Data Driven Inc.",
    "Future Vision Ltd",
    "Prime Partners",
  ];

  return customerNames
    .slice(0, limit)
    .map((name, index) => ({
      id: `cust-${index + 1}`,
      name,
      totalRevenue: randomInRange(5000, 50000),
      invoiceCount: randomInRange(3, 15),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Financial ratios
export async function getFinancialRatios(): Promise<{
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  grossMargin: number;
  netMargin: number;
}> {
  const currentData = generateMockData("month");

  const revenue = currentData.revenue;
  const expenses = currentData.expenses;
  const ar = currentData.ar;
  const ap = currentData.ap;

  const currentRatio =
    (ar.current + ar.overdue30) / (ap.current + ap.overdue30 || 1);
  const quickRatio = ar.current / (ap.current + ap.overdue30 || 1);
  const grossMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const netMargin =
    revenue > 0 ? ((revenue - expenses * 1.1) / revenue) * 100 : 0;
  const debtToEquity =
    (ap.current + ap.overdue30 + ap.overdue60 + ap.overdue90) /
    (ar.current + ar.overdue30 + ar.overdue60 + ar.overdue90 || 1);

  return {
    currentRatio: Math.round(currentRatio * 100) / 100,
    quickRatio: Math.round(quickRatio * 100) / 100,
    debtToEquity: Math.round(debtToEquity * 100) / 100,
    grossMargin: Math.round(grossMargin * 10) / 10,
    netMargin: Math.round(netMargin * 10) / 10,
  };
}

// Customer analytics
export async function getCustomerAnalytics(): Promise<{
  total: number;
  active: number;
  newThisMonth: number;
  topCustomers: Array<{ id: string; name: string; revenue: number }>;
}> {
  const topCustomers = await getTopCustomers(5);

  return {
    total: randomInRange(50, 200),
    active: randomInRange(40, 150),
    newThisMonth: randomInRange(5, 20),
    topCustomers: topCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      revenue: c.totalRevenue,
    })),
  };
}
