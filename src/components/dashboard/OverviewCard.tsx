"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, Activity } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface OverviewCardProps {
  refreshInterval?: number;
}

export function OverviewCard({ refreshInterval = 5000 }: OverviewCardProps) {
  const { getFinancialSummary, loading } = useData();
  const summary = getFinancialSummary(30);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      icon: DollarSign,
      label: "Total Income",
      value: summary.totalIncome,
      color: "green",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      icon: TrendingUp,
      label: "Total Expenses",
      value: summary.totalExpenses,
      color: "red",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      icon: Wallet,
      label: "Net Income",
      value: summary.netIncome,
      color: summary.netIncome >= 0 ? "blue" : "red",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          const colorClasses = {
            green: {
              bg: "bg-green-50 dark:bg-green-950/20",
              text: "text-green-600",
              darkText: "dark:text-green-400",
            },
            red: {
              bg: "bg-red-50 dark:bg-red-950/20",
              text: "text-red-600",
              darkText: "dark:text-red-400",
            },
            blue: {
              bg: "bg-blue-50 dark:bg-blue-950/20",
              text: "text-blue-600",
              darkText: "dark:text-blue-400",
            },
          };
          const colors = colorClasses[item.color as keyof typeof colorClasses];

          return (
            <div
              key={item.label}
              className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${item.borderColor} transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${colors.text} ${colors.darkText}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <span
                className={`text-xl font-bold ${colors.text} ${colors.darkText}`}
              >
                {formatCurrency(item.value)}
              </span>
            </div>
          );
        })}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Income vs Expenses
            </span>
            <span
              className={`font-medium ${
                summary.netIncome >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {summary.netIncome >= 0 ? "+" : ""}
              {formatCurrency(summary.netIncome)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mt-2">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                summary.netIncome >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: animated
                  ? `${Math.min((Math.abs(summary.netIncome) / (Math.max(summary.totalIncome, summary.totalExpenses) || 1)) * 100, 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
