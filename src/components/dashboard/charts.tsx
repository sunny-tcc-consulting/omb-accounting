"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  DollarSign,
} from "lucide-react";

// =============================================================================
// STATIC DATA - Memoized to prevent recreation on re-renders
// =============================================================================
const monthlyRevenue = [
  { name: "Jan", revenue: 45000, expenses: 28000 },
  { name: "Feb", revenue: 52000, expenses: 31000 },
  { name: "Mar", revenue: 48000, expenses: 29000 },
  { name: "Apr", revenue: 61000, expenses: 35000 },
  { name: "May", revenue: 55000, expenses: 32000 },
  { name: "Jun", revenue: 68000, expenses: 38000 },
];

const incomeExpenseDistribution = [
  { name: "Sales", value: 45000, color: "#10b981" },
  { name: "Services", value: 28000, color: "#3b82f6" },
  { name: "Rent", value: 15000, color: "#f59e0b" },
  { name: "Supplies", value: 8000, color: "#ef4444" },
  { name: "Utilities", value: 5000, color: "#8b5cf6" },
];

const transactionTrend = [
  { date: "Mon", transactions: 12 },
  { date: "Tue", transactions: 18 },
  { date: "Wed", transactions: 15 },
  { date: "Thu", transactions: 22 },
  { date: "Fri", transactions: 28 },
  { date: "Sat", transactions: 8 },
  { date: "Sun", transactions: 5 },
];

const quickStatsData = [
  {
    label: "Total Revenue",
    value: "$125,430",
    change: "+12%",
    icon: TrendingUp,
    color: "green",
  },
  {
    label: "Total Expenses",
    value: "$75,680",
    change: "+8%",
    icon: TrendingDown,
    color: "red",
  },
  {
    label: "Net Income",
    value: "$49,750",
    change: "39.7%",
    icon: Wallet,
    color: "blue",
  },
  {
    label: "Health Score",
    value: "85/100",
    change: "Excellent",
    icon: Activity,
    color: "green",
  },
] as const;

const recentTransactionsData = [
  { name: "ABC Corp", type: "income" as const, amount: 12500, date: "Today" },
  { name: "XYZ Ltd", type: "income" as const, amount: 8400, date: "Yesterday" },
  {
    name: "Utility Bill",
    type: "expense" as const,
    amount: 2300,
    date: "Yesterday",
  },
  {
    name: "Service Fee",
    type: "income" as const,
    amount: 5600,
    date: "2 days ago",
  },
  {
    name: "Office Supplies",
    type: "expense" as const,
    amount: 1200,
    date: "3 days ago",
  },
];

const financialMetricsData = [
  {
    label: "Revenue Growth",
    value: 85,
    color: "from-green-400 to-green-600",
    textColor: "text-green-600",
    change: "+12.5%",
  },
  {
    label: "Expense Control",
    value: 92,
    color: "from-blue-400 to-blue-600",
    textColor: "text-blue-600",
    change: "-8.2%",
  },
  {
    label: "Cash Flow",
    value: 88,
    color: "from-purple-400 to-purple-600",
    textColor: "text-purple-600",
    change: "+18.3%",
  },
  {
    label: "Profit Margin",
    value: 85,
    color: "from-emerald-400 to-emerald-600",
    textColor: "text-emerald-600",
    change: "+5.2%",
  },
];

// Color styles memoized
const colorStyles = {
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    bgDark: "dark:bg-green-950/30",
    textDark: "dark:text-green-400",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    bgDark: "dark:bg-red-950/30",
    textDark: "dark:text-red-400",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    bgDark: "dark:bg-blue-950/30",
    textDark: "dark:text-blue-400",
  },
} as const;

// =============================================================================
// HELPER COMPONENTS - Memoized
// ==============================================================================
const RevenueChartInner = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Revenue Overview
        </CardTitle>
        <CardDescription>
          Monthly revenue and expenses (Last 6 months)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyRevenue}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="name"
              className="text-xs text-gray-500 dark:text-gray-400"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              className="text-xs text-gray-500 dark:text-gray-400"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number | undefined) => [
                `$${(value || 0).toLocaleString()}`,
                "Amount",
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              name="Revenue"
              animationDuration={animated ? 1500 : 0}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              name="Expenses"
              animationDuration={animated ? 1500 : 0}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const ExpenseBreakdownInner = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-amber-600" />
          Expense Breakdown
        </CardTitle>
        <CardDescription>Top expense categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={incomeExpenseDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent! * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={animated ? 1500 : 0}
              animationEasing="ease-out"
            >
              {incomeExpenseDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(
                value: number | undefined,
                name: string | undefined,
              ) => [`$${(value || 0).toLocaleString()}`, name || ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const TransactionTrendInner = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Transaction Trend
        </CardTitle>
        <CardDescription>Daily transactions (This week)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transactionTrend}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              className="text-xs text-gray-500 dark:text-gray-400"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              className="text-xs text-gray-500 dark:text-gray-400"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number | undefined) => [
                `${value || 0} transactions`,
                "Count",
              ]}
            />
            <Bar
              dataKey="transactions"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              animationDuration={animated ? 1500 : 0}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const QuickStatsInner = () => {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {quickStatsData.map((stat) => {
        const Icon = stat.icon;
        const colors = colorStyles[stat.color as keyof typeof colorStyles];
        return (
          <Card
            key={stat.label}
            className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p
                    className={`text-2xl font-bold ${colors.text} ${colors.textDark}`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${colors.bg} ${colors.bgDark} rounded-lg flex items-center justify-center`}
                >
                  <Icon
                    className={`h-6 w-6 ${colors.text} ${colors.textDark}`}
                  />
                </div>
              </div>
              <p className={`text-xs ${colors.text} ${colors.textDark} mt-2`}>
                {stat.label === "Net Income"
                  ? `${stat.change} profit margin`
                  : stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const RecentTransactionsChartInner = () => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 pb-4">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-purple-600" />
          Recent Transactions
        </CardTitle>
        <CardDescription>Latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactionsData.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${transaction.type === "income" ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}
                >
                  {transaction.type === "income" ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {transaction.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </p>
                </div>
              </div>
              <p
                className={`font-semibold transition-colors duration-200 ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {transaction.type === "income" ? "+" : "-"}$
                {transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const FinancialHealthChartInner = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Financial Health Score
        </CardTitle>
        <CardDescription>Health metrics over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {financialMetricsData.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
                <span className={`text-sm font-bold ${metric.textColor}`}>
                  {metric.change}
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: animated ? `${metric.value}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// EXPORTS - Memoized with React.memo for performance
// =============================================================================
export const RevenueChart = memo(RevenueChartInner);
export const ExpenseBreakdown = memo(ExpenseBreakdownInner);
export const TransactionTrend = memo(TransactionTrendInner);
export const QuickStats = memo(QuickStatsInner);
export const RecentTransactionsChart = memo(RecentTransactionsChartInner);
export const FinancialHealthChart = memo(FinancialHealthChartInner);
