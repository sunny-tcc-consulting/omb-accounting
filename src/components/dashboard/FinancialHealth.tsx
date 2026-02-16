'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
    <Card>
      <CardHeader>
        <CardTitle>Financial Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Health Score</span>
          </div>
          <span
            className={`text-2xl font-bold ${
              healthScore >= 80
                ? 'text-green-600'
                : healthScore >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {healthScore}/100
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-medium">{formatPercentage(summary.profitMargin)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore >= 80
                    ? 'bg-green-500'
                    : healthScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <p
              className={`text-sm ${
                healthScore >= 80
                  ? 'text-green-600'
                  : healthScore >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
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
    return 'Your financial health is excellent! Profit margin is at a high level.';
  }
  if (profitMargin >= 20) {
    return 'Your financial health is good, profit margin is normal.';
  }
  if (profitMargin >= 10) {
    return 'Your financial health is fair, profit margin is low.';
  }
  if (profitMargin >= 0) {
    return 'Your financial health needs attention, profit margin is negative.';
  }
  if (profitMargin >= -10) {
    return 'Your financial health is poor, need to take measures to improve.';
  }
  return 'Your financial health is very dangerous, need to take immediate action.';
}
