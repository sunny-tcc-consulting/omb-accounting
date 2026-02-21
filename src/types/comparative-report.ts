/**
 * Comparative Report Types
 *
 * Provides comparison data between current and previous periods.
 * Used for: Trial Balance, Balance Sheet, Profit & Loss
 */

import { Account, AccountType, AccountCategory } from "./report";

// ============================================================================
// Period Types
// ============================================================================

export type ComparisonPeriod =
  | "previous_month"
  | "previous_quarter"
  | "previous_year"
  | "custom";

export interface PeriodInfo {
  id: ComparisonPeriod;
  label: string;
  description: string;
}

export const COMPARISON_PERIODS: PeriodInfo[] = [
  {
    id: "previous_month",
    label: "Previous Month",
    description: "Compare with last month",
  },
  {
    id: "previous_quarter",
    label: "Previous Quarter",
    description: "Compare with last quarter",
  },
  {
    id: "previous_year",
    label: "Previous Year",
    description: "Compare with same period last year",
  },
];

// ============================================================================
// Account Comparison
// ============================================================================

export interface AccountComparison {
  account: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    category: AccountCategory;
  };
  currentBalance: number;
  previousBalance: number;
  absoluteDifference: number;
  percentageDifference: number;
  trend: "up" | "down" | "unchanged";
}

// ============================================================================
// Trial Balance Comparison
// ============================================================================

export interface TrialBalanceComparison {
  accounts: AccountComparison[];
  totalDebit: {
    current: number;
    previous: number;
    difference: number;
    percentage: number;
  };
  totalCredit: {
    current: number;
    previous: number;
    difference: number;
    percentage: number;
  };
  isBalanced: {
    current: boolean;
    previous: boolean;
  };
  periodInfo: {
    currentPeriod: { startDate: Date; endDate: Date };
    previousPeriod: { startDate: Date; endDate: Date };
    comparisonType: ComparisonPeriod;
  };
}

// ============================================================================
// Balance Sheet Comparison
// ============================================================================

export interface BalanceSheetComparison {
  assets: {
    currentAssets: {
      accounts: AccountComparison[];
      total: number;
      previousTotal: number;
      difference: number;
      percentage: number;
    };
    nonCurrentAssets: {
      accounts: AccountComparison[];
      total: number;
      previousTotal: number;
      difference: number;
      percentage: number;
    };
    totalAssets: number;
    previousTotalAssets: number;
    difference: number;
    percentage: number;
  };
  liabilities: {
    currentLiabilities: {
      accounts: AccountComparison[];
      total: number;
      previousTotal: number;
      difference: number;
      percentage: number;
    };
    nonCurrentLiabilities: {
      accounts: AccountComparison[];
      total: number;
      previousTotal: number;
      difference: number;
      percentage: number;
    };
    totalLiabilities: number;
    previousTotalLiabilities: number;
    difference: number;
    percentage: number;
  };
  equity: {
    accounts: AccountComparison[];
    total: number;
    previousTotal: number;
    difference: number;
    percentage: number;
  };
  periodInfo: {
    currentAsOfDate: Date;
    previousAsOfDate: Date;
    comparisonType: ComparisonPeriod;
  };
}

// ============================================================================
// Profit & Loss Comparison
// ============================================================================

export interface ProfitAndLossComparison {
  revenue: {
    accounts: AccountComparison[];
    total: number;
    previousTotal: number;
    difference: number;
    percentage: number;
  };
  costOfGoodsSold: {
    accounts: AccountComparison[];
    total: number;
    previousTotal: number;
    difference: number;
    percentage: number;
  };
  grossProfit: {
    current: number;
    previous: number;
    difference: number;
    percentage: number;
  };
  operatingExpenses: {
    accounts: AccountComparison[];
    total: number;
    previousTotal: number;
    difference: number;
    percentage: number;
  };
  netIncome: {
    current: number;
    previous: number;
    difference: number;
    percentage: number;
    trend: "profit" | "loss" | "unchanged";
  };
  periodInfo: {
    currentPeriod: { startDate: Date; endDate: Date };
    previousPeriod: { startDate: Date; endDate: Date };
    comparisonType: ComparisonPeriod;
  };
}

// ============================================================================
// General Ledger Comparison
// ============================================================================

export interface GeneralLedgerComparison {
  account: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    category: AccountCategory;
  };
  transactions: {
    date: Date;
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
    previousRunningBalance: number;
    balanceChange: number;
  }[];
  periodInfo: {
    currentPeriod: { startDate: Date; endDate: Date };
    previousPeriod: { startDate: Date; endDate: Date };
    comparisonType: ComparisonPeriod;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ComparisonState {
  isEnabled: boolean;
  selectedPeriod: ComparisonPeriod;
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_COMPARISON_STATE: ComparisonState = {
  isEnabled: false,
  selectedPeriod: "previous_month",
  isLoading: false,
  error: null,
};
