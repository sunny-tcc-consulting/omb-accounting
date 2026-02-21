"use client";

import React, { useState, useMemo } from "react";
import {
  ComparisonPeriod,
  COMPARISON_PERIODS,
  ComparisonState,
  DEFAULT_COMPARISON_STATE,
  AccountComparison,
  TrialBalanceComparison,
  BalanceSheetComparison,
  ProfitAndLossComparison,
} from "@/types/comparative-report";
import {
  generateTrialBalanceComparison,
  generateBalanceSheetComparison,
  generateProfitAndLossComparison,
} from "@/lib/comparative-report";
import {
  TrialBalance,
  BalanceSheet,
  ProfitAndLoss,
  Account,
} from "@/types/report";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================================================
// Period Selector Component
// ============================================================================

interface PeriodSelectorProps {
  value: ComparisonPeriod;
  onChange: (period: ComparisonPeriod) => void;
  disabled?: boolean;
}

export function PeriodSelector({
  value,
  onChange,
  disabled = false,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMPARISON_PERIODS.map((period) => (
        <button
          key={period.id}
          onClick={() => onChange(period.id)}
          disabled={disabled}
          className={`
            px-4 py-2 text-sm rounded-lg transition-all
            ${
              value === period.id
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Trend Indicator Component
// ============================================================================

interface TrendIndicatorProps {
  trend: "up" | "down" | "unchanged";
  value: number;
  isPercentage?: boolean;
  reverseForExpenses?: boolean;
}

export function TrendIndicator({
  trend,
  value,
  isPercentage = false,
  reverseForExpenses = false,
}: TrendIndicatorProps) {
  // For expenses, "up" (more spending) should be shown as negative (red)
  const isPositiveTrend = reverseForExpenses
    ? trend === "down"
    : trend === "up";

  const colorClass =
    trend === "unchanged"
      ? "text-gray-500"
      : isPositiveTrend
        ? "text-green-600"
        : "text-red-600";

  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;

  return (
    <span className={`inline-flex items-center gap-1 ${colorClass}`}>
      <Icon className="w-4 h-4" />
      {isPercentage ? `${value.toFixed(1)}%` : formatCurrency(value)}
    </span>
  );
}

// ============================================================================
// Comparison Table Component
// ============================================================================

interface ComparisonTableProps {
  title: string;
  accounts: AccountComparison[];
  currentTotal: number;
  previousTotal: number;
}

export function ComparisonTable({
  title,
  accounts,
  currentTotal,
  previousTotal,
}: ComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Account</th>
                <th className="text-right py-2 px-2">Current</th>
                <th className="text-right py-2 px-2">Previous</th>
                <th className="text-right py-2 px-2">Difference</th>
                <th className="text-center py-2 px-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.account.id} className="border-b last:border-0">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        {account.account.code}
                      </span>
                      <span>{account.account.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-2 font-medium">
                    {formatCurrency(account.currentBalance)}
                  </td>
                  <td className="text-right py-2 px-2 text-gray-500">
                    {formatCurrency(account.previousBalance)}
                  </td>
                  <td className="text-right py-2 px-2">
                    <TrendIndicator
                      trend={account.trend}
                      value={account.absoluteDifference}
                    />
                  </td>
                  <td className="text-center py-2 px-2">
                    <TrendIndicator
                      trend={account.trend}
                      value={account.percentageDifference}
                      isPercentage
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold bg-gray-50">
                <td className="py-3 px-2">Total</td>
                <td className="text-right py-3 px-2">
                  {formatCurrency(currentTotal)}
                </td>
                <td className="text-right py-3 px-2">
                  {formatCurrency(previousTotal)}
                </td>
                <td className="text-right py-3 px-2">
                  <TrendIndicator
                    trend={calculateTrend(currentTotal, previousTotal)}
                    value={currentTotal - previousTotal}
                  />
                </td>
                <td className="text-center py-3 px-2">
                  <TrendIndicator
                    trend={calculateTrend(currentTotal, previousTotal)}
                    value={
                      ((currentTotal - previousTotal) /
                        Math.abs(previousTotal || 1)) *
                      100
                    }
                    isPercentage
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Total Comparison Component
// ============================================================================

interface TotalComparisonProps {
  title: string;
  current: number;
  previous: number;
  reverseForExpenses?: boolean;
}

export function TotalComparison({
  title,
  current,
  previous,
  reverseForExpenses = false,
}: TotalComparisonProps) {
  const difference = current - previous;
  const percentage =
    previous !== 0 ? (difference / Math.abs(previous)) * 100 : 0;
  const trend = calculateTrend(current, previous);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Period</p>
            <p className="text-2xl font-bold">{formatCurrency(current)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Previous Period</p>
            <p className="text-2xl font-bold text-gray-600">
              {formatCurrency(previous)}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Change</span>
            <TrendIndicator
              trend={trend}
              value={difference}
              reverseForExpenses={reverseForExpenses}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Percentage</span>
            <TrendIndicator
              trend={trend}
              value={percentage}
              isPercentage
              reverseForExpenses={reverseForExpenses}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Trial Balance Comparison View
// ============================================================================

interface TrialBalanceComparisonViewProps {
  comparison: TrialBalanceComparison;
}

export function TrialBalanceComparisonView({
  comparison,
}: TrialBalanceComparisonViewProps) {
  const totalDebitTrend = calculateTrend(
    comparison.totalDebit.current,
    comparison.totalDebit.previous,
  );
  const totalCreditTrend = calculateTrend(
    comparison.totalCredit.current,
    comparison.totalCredit.previous,
  );

  return (
    <div className="space-y-6">
      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Comparison Period</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Current Period</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.currentPeriod.startDate)} -{" "}
              {formatDate(comparison.periodInfo.currentPeriod.endDate)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Previous Period</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.previousPeriod.startDate)} -{" "}
              {formatDate(comparison.periodInfo.previousPeriod.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Debit (Current)</p>
            <p className="text-xl font-bold">
              {formatCurrency(comparison.totalDebit.current)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Debit (Previous)</p>
            <p className="text-xl font-bold text-gray-600">
              {formatCurrency(comparison.totalDebit.previous)}
            </p>
            <TrendIndicator
              trend={totalDebitTrend}
              value={comparison.totalDebit.difference}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Credit (Current)</p>
            <p className="text-xl font-bold">
              {formatCurrency(comparison.totalCredit.current)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Credit (Previous)</p>
            <p className="text-xl font-bold text-gray-600">
              {formatCurrency(comparison.totalCredit.previous)}
            </p>
            <TrendIndicator
              trend={totalCreditTrend}
              value={comparison.totalCredit.difference}
            />
          </CardContent>
        </Card>
      </div>

      {/* Balance Status */}
      <div
        className={`p-4 rounded-lg ${
          comparison.isBalanced.current && comparison.isBalanced.previous
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {comparison.isBalanced.current && comparison.isBalanced.previous ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-red-600">✗</span>
          )}
          <span
            className={
              comparison.isBalanced.current && comparison.isBalanced.previous
                ? "text-green-800 font-medium"
                : "text-red-800 font-medium"
            }
          >
            {comparison.isBalanced.current && comparison.isBalanced.previous
              ? "Trial Balance is Balanced (both periods)"
              : "Trial Balance is NOT Balanced"}
          </span>
        </div>
      </div>

      {/* Account Comparison Table */}
      <ComparisonTable
        title="Account Comparison"
        accounts={comparison.accounts.filter(
          (acc) => Math.abs(acc.currentBalance) > 0.01,
        )}
        currentTotal={comparison.totalDebit.current}
        previousTotal={comparison.totalDebit.previous}
      />
    </div>
  );
}

// ============================================================================
// Balance Sheet Comparison View
// ============================================================================

interface BalanceSheetComparisonViewProps {
  comparison: BalanceSheetComparison;
}

export function BalanceSheetComparisonView({
  comparison,
}: BalanceSheetComparisonViewProps) {
  return (
    <div className="space-y-6">
      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Comparison Period</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Current As-of Date</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.currentAsOfDate)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Previous As-of Date</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.previousAsOfDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Assets Comparison */}
      <ComparisonTable
        title="Current Assets"
        accounts={comparison.assets.currentAssets.accounts}
        currentTotal={comparison.assets.currentAssets.total}
        previousTotal={comparison.assets.currentAssets.previousTotal}
      />

      <ComparisonTable
        title="Non-Current Assets"
        accounts={comparison.assets.nonCurrentAssets.accounts}
        currentTotal={comparison.assets.nonCurrentAssets.total}
        previousTotal={comparison.assets.nonCurrentAssets.previousTotal}
      />

      {/* Liabilities Comparison */}
      <ComparisonTable
        title="Current Liabilities"
        accounts={comparison.liabilities.currentLiabilities.accounts}
        currentTotal={comparison.liabilities.currentLiabilities.total}
        previousTotal={comparison.liabilities.currentLiabilities.previousTotal}
      />

      <ComparisonTable
        title="Non-Current Liabilities"
        accounts={comparison.liabilities.nonCurrentLiabilities.accounts}
        currentTotal={comparison.liabilities.nonCurrentLiabilities.total}
        previousTotal={
          comparison.liabilities.nonCurrentLiabilities.previousTotal
        }
      />

      {/* Equity Comparison */}
      <ComparisonTable
        title="Equity"
        accounts={comparison.equity.accounts}
        currentTotal={comparison.equity.total}
        previousTotal={comparison.equity.previousTotal}
      />

      {/* Balance Check */}
      <div
        className={`p-4 rounded-lg ${
          Math.abs(
            comparison.assets.totalAssets -
              (comparison.liabilities.totalLiabilities +
                comparison.equity.total),
          ) < 0.01
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <span
            className={
              Math.abs(
                comparison.assets.totalAssets -
                  (comparison.liabilities.totalLiabilities +
                    comparison.equity.total),
              ) < 0.01
                ? "text-green-800 font-medium"
                : "text-red-800 font-medium"
            }
          >
            {Math.abs(
              comparison.assets.totalAssets -
                (comparison.liabilities.totalLiabilities +
                  comparison.equity.total),
            ) < 0.01
              ? "✓ Balance Sheet is Balanced (Assets = Liabilities + Equity)"
              : "✗ Balance Sheet does NOT balance"}
          </span>
          <span className="text-sm text-gray-600">
            Assets: {formatCurrency(comparison.assets.totalAssets)} | L+E:{" "}
            {formatCurrency(
              comparison.liabilities.totalLiabilities + comparison.equity.total,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Profit & Loss Comparison View
// ============================================================================

interface ProfitAndLossComparisonViewProps {
  comparison: ProfitAndLossComparison;
}

export function ProfitAndLossComparisonView({
  comparison,
}: ProfitAndLossComparisonViewProps) {
  return (
    <div className="space-y-6">
      {/* Period Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Comparison Period</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Current Period</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.currentPeriod.startDate)} -{" "}
              {formatDate(comparison.periodInfo.currentPeriod.endDate)}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Previous Period</p>
            <p className="font-medium">
              {formatDate(comparison.periodInfo.previousPeriod.startDate)} -{" "}
              {formatDate(comparison.periodInfo.previousPeriod.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Comparison */}
      <ComparisonTable
        title="Revenue"
        accounts={comparison.revenue.accounts}
        currentTotal={comparison.revenue.total}
        previousTotal={comparison.revenue.previousTotal}
      />

      {/* COGS Comparison */}
      <ComparisonTable
        title="Cost of Goods Sold"
        accounts={comparison.costOfGoodsSold.accounts}
        currentTotal={comparison.costOfGoodsSold.total}
        previousTotal={comparison.costOfGoodsSold.previousTotal}
      />

      {/* Gross Profit Comparison */}
      <TotalComparison
        title="Gross Profit"
        current={comparison.grossProfit.current}
        previous={comparison.grossProfit.previous}
      />

      {/* Operating Expenses Comparison */}
      <ComparisonTable
        title="Operating Expenses"
        accounts={comparison.operatingExpenses.accounts}
        currentTotal={comparison.operatingExpenses.total}
        previousTotal={comparison.operatingExpenses.previousTotal}
      />

      {/* Net Income Comparison */}
      <TotalComparison
        title="Net Income"
        current={comparison.netIncome.current}
        previous={comparison.netIncome.previous}
      />
    </div>
  );
}

// ============================================================================
// Main Comparative Report Component
// ============================================================================

interface ComparativeReportProps {
  reportType: "trial-balance" | "balance-sheet" | "profit-loss";
  currentTrialBalance?: TrialBalance;
  currentBalanceSheet?: BalanceSheet;
  currentProfitAndLoss?: ProfitAndLoss;
  accounts: {
    id: string;
    code: string;
    name: string;
    type: string;
    category: string;
    balance: number;
  }[];
  onRefresh?: () => void;
}

export function ComparativeReport({
  reportType,
  currentTrialBalance,
  currentBalanceSheet,
  currentProfitAndLoss,
  accounts,
  onRefresh,
}: ComparativeReportProps) {
  const [comparisonState, setComparisonState] = useState<ComparisonState>(
    DEFAULT_COMPARISON_STATE,
  );

  // Generate comparison data
  const comparisonData = useMemo(() => {
    if (!comparisonState.isEnabled) return null;

    switch (reportType) {
      case "trial-balance":
        if (!currentTrialBalance) return null;
        return generateTrialBalanceComparison(
          currentTrialBalance,
          accounts as Account[],
          comparisonState.selectedPeriod,
        );

      case "balance-sheet":
        if (!currentBalanceSheet) return null;
        return generateBalanceSheetComparison(
          currentBalanceSheet,
          accounts as Account[],
          comparisonState.selectedPeriod,
        );

      case "profit-loss":
        if (!currentProfitAndLoss) return null;
        return generateProfitAndLossComparison(
          currentProfitAndLoss,
          accounts as Account[],
          comparisonState.selectedPeriod,
        );

      default:
        return null;
    }
  }, [
    reportType,
    currentTrialBalance,
    currentBalanceSheet,
    currentProfitAndLoss,
    accounts,
    comparisonState,
  ]);

  const toggleComparison = () => {
    setComparisonState((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };

  const handlePeriodChange = (period: ComparisonPeriod) => {
    setComparisonState((prev) => ({
      ...prev,
      selectedPeriod: period,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Toggle Comparison */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comparative Report</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={comparisonState.isEnabled ? "default" : "outline"}
            onClick={toggleComparison}
            className="flex items-center gap-2"
          >
            {comparisonState.isEnabled ? (
              <>
                <Minus className="w-4 h-4" />
                Hide Comparison
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Compare with Previous
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comparison Controls */}
      {comparisonState.isEnabled && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compare with
            </label>
            <PeriodSelector
              value={comparisonState.selectedPeriod}
              onChange={handlePeriodChange}
            />
          </div>

          {/* Comparison Data */}
          {comparisonData && (
            <div className="mt-4">
              {reportType === "trial-balance" && comparisonData && (
                <TrialBalanceComparisonView
                  comparison={comparisonData as TrialBalanceComparison}
                />
              )}
              {reportType === "balance-sheet" && comparisonData && (
                <BalanceSheetComparisonView
                  comparison={comparisonData as BalanceSheetComparison}
                />
              )}
              {reportType === "profit-loss" && comparisonData && (
                <ProfitAndLossComparisonView
                  comparison={comparisonData as ProfitAndLossComparison}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateTrend(
  current: number,
  previous: number,
): "up" | "down" | "unchanged" {
  if (Math.abs(current - previous) < 0.01) {
    return "unchanged";
  }
  return current > previous ? "up" : "down";
}

// Re-export comparison generation functions for use in the component
export {
  generateTrialBalanceComparison,
  generateBalanceSheetComparison,
  generateProfitAndLossComparison,
  getPreviousPeriodDates,
  getPreviousAsOfDate,
  calculateTrend,
  calculatePercentageDifference,
  createAccountComparison,
} from "@/lib/comparative-report";

// Re-export types
export type {
  AccountComparison,
  TrialBalanceComparison,
  BalanceSheetComparison,
  ProfitAndLossComparison,
  ComparisonPeriod,
  ComparisonState,
  PeriodInfo,
} from "@/types/comparative-report";
