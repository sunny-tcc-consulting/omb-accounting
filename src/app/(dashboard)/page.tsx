"use client";

import { lazy, Suspense, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";

// Lazy load heavy chart components for better performance
const OverviewCard = lazy(() =>
  import("@/components/dashboard/OverviewCard").then((module) => ({
    default: module.OverviewCard,
  })),
);
const RevenueChart = lazy(() =>
  import("@/components/dashboard/charts").then((module) => ({
    default: module.RevenueChart,
  })),
);
const ExpenseBreakdown = lazy(() =>
  import("@/components/dashboard/charts").then((module) => ({
    default: module.ExpenseBreakdown,
  })),
);
const TransactionTrend = lazy(() =>
  import("@/components/dashboard/charts").then((module) => ({
    default: module.TransactionTrend,
  })),
);
const RecentTransactionsChart = lazy(() =>
  import("@/components/dashboard/charts").then((module) => ({
    default: module.RecentTransactionsChart,
  })),
);
const FinancialHealthChart = lazy(() =>
  import("@/components/dashboard/charts").then((module) => ({
    default: module.FinancialHealthChart,
  })),
);

// Skeleton loader for Suspense
function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { refreshTransactions } = useData();

  // Memoize dashboard data to prevent unnecessary re-renders
  const dashboardData = useMemo(
    () => ({
      totalRevenue: 125430,
      totalExpenses: 75680,
      netIncome: 49750,
      profitMargin: 39.7,
      lastUpdated: new Date(),
    }),
    [],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  };

  const totalRevenue = 125430; // This would come from real data
  const totalExpenses = 75680;

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p
            className="text-gray-600 dark:text-gray-400 mt-1"
            suppressHydrationWarning
          >
            Financial overview and insights • Last updated:{" "}
            <span suppressHydrationWarning>
              {new Date().toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 lg:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={
              showFilters
                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : ""
            }
          >
            <Filter className="h-4 w-4" />
          </Button>
          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>
      </div>

      {/* Filter Bar (Expandable) */}
      {showFilters && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This month</option>
                  <option>Last month</option>
                  <option>Custom range...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction Type
                </label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                  <option>All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                  <option>All categories</option>
                  <option>Sales</option>
                  <option>Services</option>
                  <option>Refunds</option>
                  <option>Rent</option>
                  <option>Supplies</option>
                  <option>Utilities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900">
                  <option>All amounts</option>
                  <option>Under $100</option>
                  <option>$100 - $500</option>
                  <option>$500 - $1000</option>
                  <option>Over $1000</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${dashboardData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ↑ 12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${dashboardData.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              ↑ 8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Net Income
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${dashboardData.netIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {dashboardData.profitMargin}% profit margin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Health Score
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  85/100
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Excellent condition
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Widgets Grid - Responsive with improved layout */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 auto-rows-min">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <ExpenseBreakdown />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TransactionTrend />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <RecentTransactionsChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <FinancialHealthChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OverviewCard />
        </Suspense>
      </div>

      {/* Additional Dashboard Widget Row (could add more here later) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Placeholder for future widgets */}
      </div>
    </div>
  );
}
