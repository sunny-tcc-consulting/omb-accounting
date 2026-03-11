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
import { useTranslation } from "@/contexts/I18nContext";

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
            className={`text-lg font-bold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {" "}
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

export function DashboardContent() {
  const { t } = useTranslation();
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
        setError(data.error || t("dashboard.failedToLoadMetrics"));
      }
    } catch (err) {
      setError(t("dashboard.failedToConnect"));
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border p-5 bg-gray-100 h-32"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.retry")}
        </button>
      </div>
    );
  }

  // No metrics yet (empty database)
  if (!metrics) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-600 mb-2">{t("common.noData")}</p>
        <p className="text-sm text-blue-500">{t("dashboard.startCreating")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title={t("dashboard.revenue")}
          value={formatCurrency(metrics.revenue.current)}
          trend={metrics.revenue.trend}
          trendValue={metrics.revenue.change}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title={t("dashboard.expenses")}
          value={formatCurrency(metrics.expenses.current)}
          trend={metrics.expenses.trend === "up" ? "down" : "up"}
          trendValue={metrics.expenses.change}
          icon={CreditCard}
          color="red"
        />
        <MetricCard
          title={t("dashboard.profit")}
          value={formatCurrency(metrics.profit.current)}
          trend={metrics.profit.trend}
          trendValue={metrics.profit.change}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title={t("dashboard.netCashFlow")}
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
            {t("dashboard.cashFlowBreakdown")}
          </h2>
          <div className="grid gap-3">
            <CashFlowCard
              category={t("dashboard.operatingActivities")}
              amount={metrics.cashFlow.operating}
              icon={DollarSign}
              color="bg-green-500"
            />
            <CashFlowCard
              category={t("dashboard.investingActivities")}
              amount={metrics.cashFlow.investing}
              icon={TrendingUp}
              color="bg-blue-500"
            />
            <CashFlowCard
              category={t("dashboard.financingActivities")}
              amount={metrics.cashFlow.financing}
              icon={CreditCard}
              color="bg-purple-500"
            />
          </div>
        </div>
        {/* Aging Summary */}
        <div className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("dashboard.financialHealth")}
          </h2>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">
                {t("dashboard.profit")} {t("dashboard.profitMargin")}
              </p>
              <p className="text-2xl font-bold text-green-700">
                {" "}
                {metrics.revenue.current > 0
                  ? (
                      (metrics.profit.current / metrics.revenue.current) *
                      100
                    ).toFixed(1)
                  : "0"}{" "}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                {t("dashboard.netCashFlow")}
              </p>
              <p
                className={`text-2xl font-bold ${
                  metrics.cashFlow.net >= 0 ? "text-blue-700" : "text-red-700"
                }`}
              >
                {" "}
                {formatCurrency(metrics.cashFlow.net)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <AgingCard
          title={t("dashboard.accountsReceivableAging")}
          current={metrics.accountsReceivable.current}
          overdue30={metrics.accountsReceivable.overdue30}
          overdue60={metrics.accountsReceivable.overdue60}
          overdue90={metrics.accountsReceivable.overdue90}
        />
        <AgingCard
          title={t("dashboard.accountsPayableAging")}
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
            {t("dashboard.previousPeriod")}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.revenue")}</span>
              <span className="font-medium">
                {" "}
                {formatCurrency(metrics.revenue.previous)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.expenses")}</span>
              <span className="font-medium">
                {" "}
                {formatCurrency(metrics.expenses.previous)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">{t("dashboard.profit")}</span>
              <span className="font-medium">
                {" "}
                {formatCurrency(metrics.profit.previous)}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {t("dashboard.currentPeriod")}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.revenue")}</span>
              <span className="font-medium">
                {" "}
                {formatCurrency(metrics.revenue.current)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.expenses")}</span>
              <span className="font-medium">
                {" "}
                {formatCurrency(metrics.expenses.current)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">{t("dashboard.profit")}</span>
              <span
                className={`font-medium ${
                  metrics.profit.current >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {" "}
                {formatCurrency(metrics.profit.current)}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {t("dashboard.change")}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.revenue")}</span>
              <span
                className={`font-medium ${
                  metrics.revenue.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {" "}
                {metrics.revenue.trend === "up" ? "+" : ""}
                {metrics.revenue.change}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("dashboard.expenses")}</span>
              <span
                className={`font-medium ${
                  metrics.expenses.trend === "down"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {" "}
                {metrics.expenses.trend === "up" ? "+" : ""}
                {metrics.expenses.change}%
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">{t("dashboard.profit")}</span>
              <span
                className={`font-medium ${
                  metrics.profit.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {" "}
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
