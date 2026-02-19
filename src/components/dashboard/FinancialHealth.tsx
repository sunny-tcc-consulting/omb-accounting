"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialHealth() {
  const { getFinancialSummary, loading } = useData();
  const summary = getFinancialSummary(30);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate health score based on profit margin
  const healthScore = calculateHealthScore(summary.profitMargin);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Health Score
            </span>
          </div>
          <div
            className={`text-3xl font-bold ${
              healthScore >= 80
                ? "text-green-600"
                : healthScore >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {healthScore}/100
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Profit Margin
              </span>
              <span
                className={`font-semibold ${healthScore >= 80 ? "text-green-600" : healthScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
              >
                {formatPercentage(summary.profitMargin)}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore >= 80
                    ? "bg-green-500"
                    : healthScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <TrendingUp className="h-3 w-3" />
                <span>Income</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <TrendingDown className="h-3 w-3" />
                <span>Expenses</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p
              className={`text-sm font-medium ${
                healthScore >= 80
                  ? "text-green-600 dark:text-green-400"
                  : healthScore >= 60
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {getHealthMessage(summary.profitMargin)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateHealthScore(profitMargin: number): number {
  if (profitMargin >= 30) return 100;
  if (profitMargin >= 20) return 80;
  if (profitMargin >= 10) return 60;
  if (profitMargin >= 0) return 40;
  if (profitMargin >= -10) return 20;
  return 0;
}

function getHealthMessage(profitMargin: number): string {
  if (profitMargin >= 30) {
    return "Your financial health is excellent! Profit margin is at a high level.";
  }
  if (profitMargin >= 20) {
    return "Your financial health is good, profit margin is normal.";
  }
  if (profitMargin >= 10) {
    return "Your financial health is fair, profit margin is low.";
  }
  if (profitMargin >= 0) {
    return "Your financial health needs attention, profit margin is negative.";
  }
  if (profitMargin >= -10) {
    return "Your financial health is poor, need to take measures to improve.";
  }
  return "Your financial health is very dangerous, need to take immediate action.";
}
