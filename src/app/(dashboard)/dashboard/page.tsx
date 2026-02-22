/**
 * Dashboard Page - Main Analytics Dashboard
 * Part of Phase 4.5: Dashboard & Analytics
 */

"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/dashboard-metrics";

// Metric Card Component
function MetricCard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  icon: React.ElementType;
  color: "green" | "red" | "blue" | "purple";
}) {
  const colorClasses = {
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
  };

  const iconColorClasses = {
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${iconColorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trendValue !== 0 && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : trend === "down" ? (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            ) : null}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

// Cash Flow Card Component
function CashFlowCard({
  category,
  amount,
  icon: Icon,
  color,
}: {
  category: string;
  amount: number;
  icon: React.ElementType;
  color: string;
}) {
  const isPositive = amount >= 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{category}</p>
          <p
            className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            $
            {Math.abs(amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Aging Card Component
function AgingCard({
  title,
  current,
  overdue30,
  overdue60,
  overdue90,
}: {
  title: string;
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
}) {
  const total = current + overdue30 + overdue60 + overdue90;
  const maxAmount = Math.max(current, overdue30, overdue60, overdue90, 1);

  const barWidth = (amount: number) => Math.max((amount / maxAmount) * 100, 5);

  return (
    <div className="p-4 rounded-lg bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      <p className="text-xl font-bold text-gray-900 mb-3">
        ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Current</span>
            <span>${current.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${barWidth(current)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>1-30 Days</span>
            <span>${overdue30.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full"
              style={{ width: `${barWidth(overdue30)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>31-60 Days</span>
            <span>${overdue60.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${barWidth(overdue60)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>60+ Days</span>
            <span>${overdue90.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${barWidth(overdue90)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/dashboard/metrics?period=${period}&type=all`,
      );
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || "Failed to load metrics");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border p-5 bg-gray-100 h-32"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="animate-pulse rounded-xl border p-5 bg-gray-100 h-64" />
          <div className="animate-pulse rounded-xl border p-5 bg-gray-100 h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No metrics yet (empty database)
  if (!metrics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-600 mb-2">No data available yet</p>
          <p className="text-sm text-blue-500">
            Start creating invoices and transactions to see your dashboard
            metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {(["month", "quarter", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMetrics}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Revenue"
          value={formatCurrency(metrics.revenue.current)}
          trend={metrics.revenue.trend}
          trendValue={metrics.revenue.change}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Expenses"
          value={formatCurrency(metrics.expenses.current)}
          trend={metrics.expenses.trend === "up" ? "down" : "up"}
          trendValue={metrics.expenses.change}
          icon={CreditCard}
          color="red"
        />
        <MetricCard
          title="Profit"
          value={formatCurrency(metrics.profit.current)}
          trend={metrics.profit.trend}
          trendValue={metrics.profit.change}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Net Cash Flow"
          value={formatCurrency(metrics.cashFlow.net)}
          trend={metrics.cashFlow.net >= 0 ? "up" : "down"}
          trendValue={0}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Cash Flow Section */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <div className="md:col-span-2 rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cash Flow Breakdown
          </h2>
          <div className="grid gap-3">
            <CashFlowCard
              category="Operating Activities"
              amount={metrics.cashFlow.operating}
              icon={DollarSign}
              color="bg-green-500"
            />
            <CashFlowCard
              category="Investing Activities"
              amount={metrics.cashFlow.investing}
              icon={TrendingUp}
              color="bg-blue-500"
            />
            <CashFlowCard
              category="Financing Activities"
              amount={metrics.cashFlow.financing}
              icon={CreditCard}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Aging Summary */}
        <div className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Profit Margin</p>
              <p className="text-2xl font-bold text-green-700">
                {metrics.revenue.current > 0
                  ? (
                      (metrics.profit.current / metrics.revenue.current) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Net Cash Flow</p>
              <p
                className={`text-2xl font-bold ${metrics.cashFlow.net >= 0 ? "text-blue-700" : "text-red-700"}`}
              >
                {formatCurrency(metrics.cashFlow.net)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <AgingCard
          title="Accounts Receivable Aging"
          current={metrics.accountsReceivable.current}
          overdue30={metrics.accountsReceivable.overdue30}
          overdue60={metrics.accountsReceivable.overdue60}
          overdue90={metrics.accountsReceivable.overdue90}
        />
        <AgingCard
          title="Accounts Payable Aging"
          current={metrics.accountsPayable.current}
          overdue30={metrics.accountsPayable.overdue30}
          overdue60={metrics.accountsPayable.overdue60}
          overdue90={metrics.accountsPayable.overdue90}
        />
      </div>

      {/* Period Comparison */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Previous Period
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">
                {formatCurrency(metrics.revenue.previous)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expenses</span>
              <span className="font-medium">
                {formatCurrency(metrics.expenses.previous)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Profit</span>
              <span className="font-medium">
                {formatCurrency(metrics.profit.previous)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Current Period
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium">
                {formatCurrency(metrics.revenue.current)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expenses</span>
              <span className="font-medium">
                {formatCurrency(metrics.expenses.current)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Profit</span>
              <span
                className={`font-medium ${metrics.profit.current >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(metrics.profit.current)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Change</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span
                className={`font-medium ${metrics.revenue.trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {metrics.revenue.trend === "up" ? "+" : ""}
                {metrics.revenue.change}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expenses</span>
              <span
                className={`font-medium ${metrics.expenses.trend === "down" ? "text-green-600" : "text-red-600"}`}
              >
                {metrics.expenses.trend === "up" ? "+" : ""}
                {metrics.expenses.change}%
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Profit</span>
              <span
                className={`font-medium ${metrics.profit.trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {metrics.profit.trend === "up" ? "+" : ""}
                {metrics.profit.change}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
