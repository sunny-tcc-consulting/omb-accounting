"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, Activity } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";

interface OverviewCardProps {
  refreshInterval?: number;
}

export function OverviewCard({ refreshInterval = 5000 }: OverviewCardProps) {
  const { getFinancialSummary, loading } = useData();
  const summary = getFinancialSummary(30);

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Income
            </span>
          </div>
          <span className="text-xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Expenses
            </span>
          </div>
          <span className="text-xl font-bold text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Net Income
            </span>
          </div>
          <span
            className={`text-xl font-bold ${
              summary.netIncome >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatCurrency(summary.netIncome)}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Income vs Expenses
            </span>
            <span
              className={`font-medium ${
                summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.netIncome >= 0 ? "+" : ""}
              {formatCurrency(summary.netIncome)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mt-2">
            <div
              className={`h-2.5 rounded-full ${
                summary.netIncome >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${Math.min((Math.abs(summary.netIncome) / (Math.max(summary.totalIncome, summary.totalExpenses) || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
