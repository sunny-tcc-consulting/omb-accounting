'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function OverviewCard() {
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
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Total Income</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Total Expenses</span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Net Income</span>
          </div>
          <span
            className={`text-lg font-bold ${
              summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(summary.netIncome)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
