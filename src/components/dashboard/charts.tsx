"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Wallet, Activity, DollarSign, Calendar } from "lucide-react";

// Mock data for charts
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

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue and expenses (Last 6 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
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
              formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, "Amount"]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExpenseBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
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
              label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
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
              formatter={(value: number | undefined, name: string | undefined) => [`$${(value || 0).toLocaleString()}`, name || ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TransactionTrend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Trend</CardTitle>
        <CardDescription>Daily transactions (This week)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transactionTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
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
              formatter={(value: number | undefined) => [`${value || 0} transactions`, "Count"]}
            />
            <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">$125,430</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">$75,680</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">↑ 8% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Income</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$49,750</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">39.7% profit margin</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">85/100</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Excellent condition</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function RecentTransactionsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "ABC Corp", type: "income", amount: 12500, date: "Today" },
            { name: "XYZ Ltd", type: "income", amount: 8400, date: "Yesterday" },
            { name: "Utility Bill", type: "expense", amount: 2300, date: "Yesterday" },
            { name: "Service Fee", type: "income", amount: 5600, date: "2 days ago" },
            { name: "Office Supplies", type: "expense", amount: 1200, date: "3 days ago" },
          ].map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === "income"
                      ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <DollarSign className="h-5 w-5" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <p
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                ${transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialHealthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Score</CardTitle>
        <CardDescription>Health metrics over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue Growth</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">+12.5%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expense Control</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">-8.2%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash Flow</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">+18.3%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: "88%" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit Margin</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">+5.2%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
