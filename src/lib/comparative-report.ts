/**
 * Comparative Report Calculator
 *
 * Calculates comparisons between current and previous periods.
 * Used for: Trial Balance, Balance Sheet, Profit & Loss
 */

import {
  Account,
  AccountType,
  TrialBalance,
  BalanceSheet,
  ProfitAndLoss,
  GeneralLedger,
} from "@/types/report";
import {
  AccountComparison,
  TrialBalanceComparison,
  BalanceSheetComparison,
  ProfitAndLossComparison,
  GeneralLedgerComparison,
  ComparisonPeriod,
} from "@/types/comparative-report";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate period dates based on comparison type
 */
export function getPreviousPeriodDates(
  comparisonType: ComparisonPeriod,
  currentEndDate: Date,
): { startDate: Date; endDate: Date } {
  const endDate = new Date(currentEndDate);
  let startDate: Date;

  switch (comparisonType) {
    case "previous_month":
      startDate = new Date(currentEndDate);
      startDate.setMonth(startDate.getMonth() - 1);
      // Adjust for same day count
      const monthDiff = endDate.getDate() - startDate.getDate();
      if (monthDiff > 0) {
        startDate.setDate(startDate.getDate() + monthDiff);
      }
      break;

    case "previous_quarter":
      startDate = new Date(currentEndDate);
      startDate.setMonth(startDate.getMonth() - 3);
      // Adjust for same day count
      const quarterDiff = endDate.getDate() - startDate.getDate();
      if (quarterDiff > 0) {
        startDate.setDate(startDate.getDate() + quarterDiff);
      }
      break;

    case "previous_year":
      startDate = new Date(currentEndDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      // Adjust for same day count
      const yearDiff = endDate.getDate() - startDate.getDate();
      if (yearDiff > 0) {
        startDate.setDate(startDate.getDate() + yearDiff);
      }
      break;

    default:
      startDate = new Date(currentEndDate);
      startDate.setMonth(startDate.getMonth() - 1);
  }

  // Reset time to start of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Get previous period as-of date for Balance Sheet
 */
export function getPreviousAsOfDate(
  comparisonType: ComparisonPeriod,
  currentAsOfDate: Date,
): Date {
  const asOfDate = new Date(currentAsOfDate);

  switch (comparisonType) {
    case "previous_month":
      asOfDate.setMonth(asOfDate.getMonth() - 1);
      break;
    case "previous_quarter":
      asOfDate.setMonth(asOfDate.getMonth() - 3);
      break;
    case "previous_year":
      asOfDate.setFullYear(asOfDate.getFullYear() - 1);
      break;
    default:
      asOfDate.setMonth(asOfDate.getMonth() - 1);
  }

  return asOfDate;
}

/**
 * Calculate trend from current and previous values
 */
export function calculateTrend(
  current: number,
  previous: number,
): "up" | "down" | "unchanged" {
  if (Math.abs(current - previous) < 0.01) {
    return "unchanged";
  }
  return current > previous ? "up" : "down";
}

/**
 * Calculate percentage difference
 */
export function calculatePercentageDifference(
  current: number,
  previous: number,
): number {
  if (Math.abs(previous) < 0.01) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Create account comparison from current and previous data
 */
export function createAccountComparison(
  account: Account,
  currentBalance: number,
  previousBalance: number,
): AccountComparison {
  const absoluteDifference = currentBalance - previousBalance;
  const percentageDifference = calculatePercentageDifference(
    currentBalance,
    previousBalance,
  );
  const trend = calculateTrend(currentBalance, previousBalance);

  return {
    account: {
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
    },
    currentBalance,
    previousBalance,
    absoluteDifference,
    percentageDifference,
    trend,
  };
}

// ============================================================================
// Trial Balance Comparison
// ============================================================================

/**
 * Generate comparison data for Trial Balance
 *
 * Note: In a real system, this would query historical balances.
 * For demo purposes, we simulate previous period data.
 */
export function generateTrialBalanceComparison(
  currentTrialBalance: TrialBalance,
  accounts: Account[],
  comparisonType: ComparisonPeriod,
  asOfDate: Date = new Date(),
): TrialBalanceComparison {
  // Generate simulated previous period data
  const previousPeriod = getPreviousPeriodDates(comparisonType, asOfDate);

  // Calculate previous balances (simulated with random variation)
  const previousDebits = accounts
    .filter((acc) => isDebitAccount(acc.type))
    .map((acc) => ({
      ...acc,
      balance: acc.balance * (0.7 + Math.random() * 0.6), // 70%-130% of current
    }));

  const previousCredits = accounts
    .filter((acc) => isCreditAccount(acc.type))
    .map((acc) => ({
      ...acc,
      balance: acc.balance * (0.7 + Math.random() * 0.6),
    }));

  const previousTotalDebit = previousDebits.reduce(
    (sum, acc) => sum + acc.balance,
    0,
  );
  const previousTotalCredit = previousCredits.reduce(
    (sum, acc) => sum + acc.balance,
    0,
  );

  // Create account comparisons
  const accountComparisons: AccountComparison[] = accounts.map((account) => {
    const currentEntry = currentTrialBalance.accounts.find(
      (e) => e.account.code === account.code,
    );
    const currentBalance =
      currentEntry?.debitBalance || currentEntry?.creditBalance || 0;
    const previousBalance = account.balance * (0.7 + Math.random() * 0.6);

    return createAccountComparison(account, currentBalance, previousBalance);
  });

  return {
    accounts: accountComparisons,
    totalDebit: {
      current: currentTrialBalance.totals.totalDebit,
      previous: previousTotalDebit,
      difference: currentTrialBalance.totals.totalDebit - previousTotalDebit,
      percentage: calculatePercentageDifference(
        currentTrialBalance.totals.totalDebit,
        previousTotalDebit,
      ),
    },
    totalCredit: {
      current: currentTrialBalance.totals.totalCredit,
      previous: previousTotalCredit,
      difference: currentTrialBalance.totals.totalCredit - previousTotalCredit,
      percentage: calculatePercentageDifference(
        currentTrialBalance.totals.totalCredit,
        previousTotalCredit,
      ),
    },
    isBalanced: {
      current: currentTrialBalance.totals.isBalanced,
      previous: Math.abs(previousTotalDebit - previousTotalCredit) < 0.01,
    },
    periodInfo: {
      currentPeriod: {
        startDate: new Date(
          new Date(currentTrialBalance.reportDate).setMonth(
            new Date(currentTrialBalance.reportDate).getMonth() - 1,
          ),
        ),
        endDate: currentTrialBalance.reportDate,
      },
      previousPeriod,
      comparisonType,
    },
  };
}

// ============================================================================
// Balance Sheet Comparison
// ============================================================================

/**
 * Generate comparison data for Balance Sheet
 */
export function generateBalanceSheetComparison(
  currentBalanceSheet: BalanceSheet,
  accounts: Account[],
  comparisonType: ComparisonPeriod,
  asOfDate: Date = new Date(),
): BalanceSheetComparison {
  const previousAsOfDate = getPreviousAsOfDate(comparisonType, asOfDate);

  // Generate previous period balances with variation
  const previousCurrentAssetsTotal =
    currentBalanceSheet.assets.currentAssets.reduce(
      (sum, a) => sum + a.balance,
      0,
    ) *
    (0.75 + Math.random() * 0.5);
  const previousNonCurrentAssetsTotal =
    currentBalanceSheet.assets.nonCurrentAssets.reduce(
      (sum, a) => sum + a.balance,
      0,
    ) *
    (0.75 + Math.random() * 0.5);
  const previousTotalAssets =
    previousCurrentAssetsTotal + previousNonCurrentAssetsTotal;

  const previousCurrentLiabilitiesTotal =
    currentBalanceSheet.liabilities.currentLiabilities.reduce(
      (sum, a) => sum + a.balance,
      0,
    ) *
    (0.75 + Math.random() * 0.5);
  const previousNonCurrentLiabilitiesTotal =
    currentBalanceSheet.liabilities.nonCurrentLiabilities.reduce(
      (sum, a) => sum + a.balance,
      0,
    ) *
    (0.75 + Math.random() * 0.5);
  const previousTotalLiabilities =
    previousCurrentLiabilitiesTotal + previousNonCurrentLiabilitiesTotal;

  const previousEquityTotal =
    currentBalanceSheet.equity.items.reduce((sum, a) => sum + a.balance, 0) *
    (0.75 + Math.random() * 0.5);

  // Create account comparisons for current assets
  const currentAssetComparisons = currentBalanceSheet.assets.currentAssets.map(
    (account) => {
      const previousBalance = account.balance * (0.75 + Math.random() * 0.5);
      return createAccountComparison(account, account.balance, previousBalance);
    },
  );

  // Create account comparisons for non-current assets
  const nonCurrentAssetComparisons =
    currentBalanceSheet.assets.nonCurrentAssets.map((account) => {
      const previousBalance = account.balance * (0.75 + Math.random() * 0.5);
      return createAccountComparison(account, account.balance, previousBalance);
    });

  // Create account comparisons for current liabilities
  const currentLiabilityComparisons =
    currentBalanceSheet.liabilities.currentLiabilities.map((account) => {
      const previousBalance = account.balance * (0.75 + Math.random() * 0.5);
      return createAccountComparison(account, account.balance, previousBalance);
    });

  // Create account comparisons for non-current liabilities
  const nonCurrentLiabilityComparisons =
    currentBalanceSheet.liabilities.nonCurrentLiabilities.map((account) => {
      const previousBalance = account.balance * (0.75 + Math.random() * 0.5);
      return createAccountComparison(account, account.balance, previousBalance);
    });

  // Create account comparisons for equity
  const equityComparisons = currentBalanceSheet.equity.items.map((account) => {
    const previousBalance = account.balance * (0.75 + Math.random() * 0.5);
    return createAccountComparison(account, account.balance, previousBalance);
  });

  const totalCurrentAssets = currentBalanceSheet.assets.currentAssets.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const totalNonCurrentAssets =
    currentBalanceSheet.assets.nonCurrentAssets.reduce(
      (sum, a) => sum + a.balance,
      0,
    );
  const totalCurrentLiabilities =
    currentBalanceSheet.liabilities.currentLiabilities.reduce(
      (sum, a) => sum + a.balance,
      0,
    );
  const totalNonCurrentLiabilities =
    currentBalanceSheet.liabilities.nonCurrentLiabilities.reduce(
      (sum, a) => sum + a.balance,
      0,
    );

  return {
    assets: {
      currentAssets: {
        accounts: currentAssetComparisons,
        total: totalCurrentAssets,
        previousTotal: previousCurrentAssetsTotal,
        difference: totalCurrentAssets - previousCurrentAssetsTotal,
        percentage: calculatePercentageDifference(
          totalCurrentAssets,
          previousCurrentAssetsTotal,
        ),
      },
      nonCurrentAssets: {
        accounts: nonCurrentAssetComparisons,
        total: totalNonCurrentAssets,
        previousTotal: previousNonCurrentAssetsTotal,
        difference: totalNonCurrentAssets - previousNonCurrentAssetsTotal,
        percentage: calculatePercentageDifference(
          totalNonCurrentAssets,
          previousNonCurrentAssetsTotal,
        ),
      },
      totalAssets: currentBalanceSheet.assets.totalAssets,
      previousTotalAssets,
      difference: currentBalanceSheet.assets.totalAssets - previousTotalAssets,
      percentage: calculatePercentageDifference(
        currentBalanceSheet.assets.totalAssets,
        previousTotalAssets,
      ),
    },
    liabilities: {
      currentLiabilities: {
        accounts: currentLiabilityComparisons,
        total: totalCurrentLiabilities,
        previousTotal: previousCurrentLiabilitiesTotal,
        difference: totalCurrentLiabilities - previousCurrentLiabilitiesTotal,
        percentage: calculatePercentageDifference(
          totalCurrentLiabilities,
          previousCurrentLiabilitiesTotal,
        ),
      },
      nonCurrentLiabilities: {
        accounts: nonCurrentLiabilityComparisons,
        total: totalNonCurrentLiabilities,
        previousTotal: previousNonCurrentLiabilitiesTotal,
        difference:
          totalNonCurrentLiabilities - previousNonCurrentLiabilitiesTotal,
        percentage: calculatePercentageDifference(
          totalNonCurrentLiabilities,
          previousNonCurrentLiabilitiesTotal,
        ),
      },
      totalLiabilities: currentBalanceSheet.liabilities.totalLiabilities,
      previousTotalLiabilities,
      difference:
        currentBalanceSheet.liabilities.totalLiabilities -
        previousTotalLiabilities,
      percentage: calculatePercentageDifference(
        currentBalanceSheet.liabilities.totalLiabilities,
        previousTotalLiabilities,
      ),
    },
    equity: {
      accounts: equityComparisons,
      total: currentBalanceSheet.equity.totalEquity,
      previousTotal: previousEquityTotal,
      difference: currentBalanceSheet.equity.totalEquity - previousEquityTotal,
      percentage: calculatePercentageDifference(
        currentBalanceSheet.equity.totalEquity,
        previousEquityTotal,
      ),
    },
    periodInfo: {
      currentAsOfDate: asOfDate,
      previousAsOfDate,
      comparisonType,
    },
  };
}

// ============================================================================
// Profit & Loss Comparison
// ============================================================================

/**
 * Generate comparison data for Profit & Loss
 */
export function generateProfitAndLossComparison(
  currentPL: ProfitAndLoss,
  accounts: Account[],
  comparisonType: ComparisonPeriod,
  endDate: Date = new Date(),
): ProfitAndLossComparison {
  const previousPeriod = getPreviousPeriodDates(comparisonType, endDate);

  // Generate previous period data with variation
  const previousRevenueTotal =
    currentPL.revenue.total * (0.7 + Math.random() * 0.6);
  const previousCOGSTotal =
    currentPL.costOfGoodsSold.total * (0.7 + Math.random() * 0.6);
  const previousGrossProfit = previousRevenueTotal - previousCOGSTotal;
  const previousOperatingExpensesTotal =
    currentPL.operatingExpenses.total * (0.7 + Math.random() * 0.6);
  const previousNetIncome =
    previousGrossProfit - previousOperatingExpensesTotal;

  // Create account comparisons for revenue
  const revenueComparisons = currentPL.revenue.items.map((account) => {
    const previousBalance = account.balance * (0.7 + Math.random() * 0.6);
    return createAccountComparison(account, account.balance, previousBalance);
  });

  // Create account comparisons for COGS
  const cogsComparisons = currentPL.costOfGoodsSold.items.map((account) => {
    const previousBalance = account.balance * (0.7 + Math.random() * 0.6);
    return createAccountComparison(account, account.balance, previousBalance);
  });

  // Create account comparisons for operating expenses
  const expenseComparisons = currentPL.operatingExpenses.items.map(
    (account) => {
      const previousBalance = account.balance * (0.7 + Math.random() * 0.6);
      return createAccountComparison(account, account.balance, previousBalance);
    },
  );

  return {
    revenue: {
      accounts: revenueComparisons,
      total: currentPL.revenue.total,
      previousTotal: previousRevenueTotal,
      difference: currentPL.revenue.total - previousRevenueTotal,
      percentage: calculatePercentageDifference(
        currentPL.revenue.total,
        previousRevenueTotal,
      ),
    },
    costOfGoodsSold: {
      accounts: cogsComparisons,
      total: currentPL.costOfGoodsSold.total,
      previousTotal: previousCOGSTotal,
      difference: currentPL.costOfGoodsSold.total - previousCOGSTotal,
      percentage: calculatePercentageDifference(
        currentPL.costOfGoodsSold.total,
        previousCOGSTotal,
      ),
    },
    grossProfit: {
      current: currentPL.grossProfit,
      previous: previousGrossProfit,
      difference: currentPL.grossProfit - previousGrossProfit,
      percentage: calculatePercentageDifference(
        currentPL.grossProfit,
        previousGrossProfit,
      ),
    },
    operatingExpenses: {
      accounts: expenseComparisons,
      total: currentPL.operatingExpenses.total,
      previousTotal: previousOperatingExpensesTotal,
      difference:
        currentPL.operatingExpenses.total - previousOperatingExpensesTotal,
      percentage: calculatePercentageDifference(
        currentPL.operatingExpenses.total,
        previousOperatingExpensesTotal,
      ),
    },
    netIncome: {
      current: currentPL.netIncome,
      previous: previousNetIncome,
      difference: currentPL.netIncome - previousNetIncome,
      percentage: calculatePercentageDifference(
        currentPL.netIncome,
        previousNetIncome,
      ),
      trend:
        currentPL.netIncome > previousNetIncome
          ? "profit"
          : currentPL.netIncome < previousNetIncome
            ? "loss"
            : "unchanged",
    },
    periodInfo: {
      currentPeriod: {
        startDate: currentPL.startDate,
        endDate: currentPL.endDate,
      },
      previousPeriod,
      comparisonType,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function isDebitAccount(type: AccountType): boolean {
  return ["asset", "expense"].includes(type);
}

function isCreditAccount(type: AccountType): boolean {
  return ["liability", "equity", "revenue"].includes(type);
}

// ============================================================================
// Utility Exports for UI Components
// ============================================================================

export function getTrendArrow(
  trend: "up" | "down" | "same" | "positive" | "negative",
): "up" | "down" | "same" {
  if (trend === "up" || trend === "positive") return "up";
  if (trend === "down" || trend === "negative") return "down";
  return "same";
}

export function getTrendColor(
  trend: "up" | "down" | "same" | "positive" | "negative",
): string {
  if (trend === "up" || trend === "positive") return "text-green-600";
  if (trend === "down" || trend === "negative") return "text-red-600";
  return "text-gray-400";
}
