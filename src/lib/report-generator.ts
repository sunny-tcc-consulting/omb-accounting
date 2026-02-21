"use client";

import {
  Account,
  JournalEntry,
  JournalEntryLine,
  BalanceSheet,
  ProfitAndLoss,
  TrialBalance,
  GeneralLedger,
  ReportConfig,
  AccountType,
  AccountCategory,
} from "@/types/report";
import { Transaction } from "@/types";

// =============================================================================
// CHART OF ACCOUNTS - Default accounts for SME
// =============================================================================
export const DEFAULT_CHART_OF_ACCOUNTS: Omit<
  Account,
  "id" | "balance" | "createdAt" | "updatedAt"
>[] = [
  // ASSETS (1000-1999)
  {
    code: "1001",
    name: "Cash on Hand",
    type: "asset",
    category: "cash",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1002",
    name: "Business Checking Account",
    type: "asset",
    category: "bank",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1003",
    name: "Savings Account",
    type: "asset",
    category: "bank",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1101",
    name: "Accounts Receivable",
    type: "asset",
    category: "accounts_receivable",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1201",
    name: "Inventory",
    type: "asset",
    category: "inventory",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1301",
    name: "Prepaid Insurance",
    type: "asset",
    category: "prepaid",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1401",
    name: "Office Equipment",
    type: "asset",
    category: "fixed_assets",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1402",
    name: "Accumulated Depreciation - Equipment",
    type: "asset",
    category: "fixed_assets",
    currency: "CNY",
    isSubAccount: true,
    parentAccountId: "1401",
  },
  {
    code: "1501",
    name: "Furniture and Fixtures",
    type: "asset",
    category: "fixed_assets",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "1502",
    name: "Accumulated Depreciation - Furniture",
    type: "asset",
    category: "fixed_assets",
    currency: "CNY",
    isSubAccount: true,
    parentAccountId: "1501",
  },

  // LIABILITIES (2000-2999)
  {
    code: "2001",
    name: "Accounts Payable",
    type: "liability",
    category: "accounts_payable",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2101",
    name: "Accrued Wages",
    type: "liability",
    category: "accrued_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2102",
    name: "Accrued Expenses",
    type: "liability",
    category: "accrued_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2201",
    name: "Short-term Loan",
    type: "liability",
    category: "short_term_debt",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2301",
    name: "Long-term Loan",
    type: "liability",
    category: "long_term_debt",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2401",
    name: "Sales Tax Payable",
    type: "liability",
    category: "accounts_payable",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "2501",
    name: "Income Tax Payable",
    type: "liability",
    category: "taxes",
    currency: "CNY",
    isSubAccount: false,
  },

  // EQUITY (3000-3999)
  {
    code: "3001",
    name: "Owner's Capital",
    type: "equity",
    category: "owner_equity",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "3002",
    name: "Owner's Drawings",
    type: "equity",
    category: "owner_equity",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "3101",
    name: "Retained Earnings",
    type: "equity",
    category: "retained_earnings",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "3201",
    name: "Common Stock",
    type: "equity",
    category: "common_stock",
    currency: "CNY",
    isSubAccount: false,
  },

  // REVENUE (4000-4999)
  {
    code: "4001",
    name: "Sales Revenue",
    type: "revenue",
    category: "sales",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "4002",
    name: "Service Revenue",
    type: "revenue",
    category: "services",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "4100",
    name: "Other Income",
    type: "revenue",
    category: "other_income",
    currency: "CNY",
    isSubAccount: false,
  },

  // EXPENSES (5000-5999)
  {
    code: "5001",
    name: "Cost of Goods Sold",
    type: "expense",
    category: "cost_of_goods_sold",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6001",
    name: "Advertising Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6002",
    name: "Office Supplies Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6003",
    name: "Rent Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6004",
    name: "Salaries and Wages",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6005",
    name: "Utilities Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6006",
    name: "Insurance Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6007",
    name: "Telephone Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6008",
    name: "Travel Expense",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6009",
    name: "Professional Fees",
    type: "expense",
    category: "operating_expenses",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6100",
    name: "Depreciation Expense",
    type: "expense",
    category: "depreciation",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6200",
    name: "Interest Expense",
    type: "expense",
    category: "interest",
    currency: "CNY",
    isSubAccount: false,
  },
  {
    code: "6300",
    name: "Income Tax Expense",
    type: "expense",
    category: "taxes",
    currency: "CNY",
    isSubAccount: false,
  },
];

// =============================================================================
// JOURNAL ENTRY GENERATOR
// =============================================================================

/**
 * Generate journal entries from transactions
 */
export function generateJournalEntries(
  transactions: Transaction[],
): JournalEntry[] {
  const entries: JournalEntry[] = [];
  const entryByDate: Map<string, JournalEntry> = new Map();

  transactions.forEach((transaction, index) => {
    const dateKey = transaction.date.toISOString().split("T")[0];

    if (!entryByDate.has(dateKey)) {
      const entry: JournalEntry = {
        id: `je-${Date.now()}-${index}`,
        entryNumber: `JE-${String(entries.length + 1).padStart(4, "0")}`,
        date: new Date(dateKey),
        description: `Daily transactions - ${dateKey}`,
        entries: [],
        totalDebit: 0,
        totalCredit: 0,
        isBalanced: false,
        status: "posted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      entryByDate.set(dateKey, entry);
      entries.push(entry);
    }

    const entry = entryByDate.get(dateKey)!;

    // Determine account based on transaction type
    const debitAccount = transaction.type === "income" ? "4001" : "6001"; // Simplified mapping
    const creditAccount = transaction.type === "income" ? "1002" : "2001";

    entry.entries.push({
      id: `jel-${Date.now()}-${index}-1`,
      accountId: debitAccount,
      accountCode: debitAccount,
      accountName: getAccountName(debitAccount),
      debit: transaction.amount,
      credit: 0,
      description: transaction.description,
    });

    entry.entries.push({
      id: `jel-${Date.now()}-${index}-2`,
      accountId: creditAccount,
      accountCode: creditAccount,
      accountName: getAccountName(creditAccount),
      debit: 0,
      credit: transaction.amount,
      description: transaction.description,
    });

    entry.totalDebit = entry.entries.reduce((sum, e) => sum + e.debit, 0);
    entry.totalCredit = entry.entries.reduce((sum, e) => sum + e.credit, 0);
    entry.isBalanced = Math.abs(entry.totalDebit - entry.totalCredit) < 0.01;
  });

  return entries;
}

function getAccountName(code: string): string {
  const account = DEFAULT_CHART_OF_ACCOUNTS.find((a) => a.code === code);
  return account?.name || "Unknown Account";
}

// =============================================================================
// TRIAL BALANCE
// =============================================================================

/**
 * Generate Trial Balance report
 */
export function generateTrialBalance(
  accounts: Account[],
  journalEntries: JournalEntry[],
): TrialBalance {
  // Calculate balances from journal entries
  const accountBalances = new Map<string, number>();

  journalEntries.forEach((entry) => {
    entry.entries.forEach((line) => {
      const currentBalance = accountBalances.get(line.accountId) || 0;
      const balanceChange = line.debit - line.credit;
      accountBalances.set(line.accountId, currentBalance + balanceChange);
    });
  });

  // Build trial balance items
  const trialBalanceItems = accounts.map((account) => {
    const balance = accountBalances.get(account.code) || account.balance;
    const isDebit = balance >= 0;

    return {
      account,
      debitBalance: isDebit ? balance : 0,
      creditBalance: isDebit ? 0 : Math.abs(balance),
    };
  });

  const totalDebit = trialBalanceItems.reduce(
    (sum, item) => sum + item.debitBalance,
    0,
  );
  const totalCredit = trialBalanceItems.reduce(
    (sum, item) => sum + item.creditBalance,
    0,
  );

  return {
    reportDate: new Date(),
    currency: "CNY",
    accounts: trialBalanceItems,
    totals: {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    },
  };
}

// =============================================================================
// GENERAL LEDGER
// =============================================================================

/**
 * Generate General Ledger for a specific account
 */
export function generateGeneralLedger(
  accountCode: string,
  journalEntries: JournalEntry[],
  startDate?: Date,
  endDate?: Date,
): GeneralLedger {
  const account = DEFAULT_CHART_OF_ACCOUNTS.find((a) => a.code === accountCode);

  if (!account) {
    throw new Error(`Account ${accountCode} not found`);
  }

  // Get all entries for this account within date range
  let entries = journalEntries
    .flatMap((entry) => entry.entries)
    .filter((line) => line.accountCode === accountCode);

  if (startDate) {
    entries = entries.filter((e) => e.debit >= 0); // Simplified - should filter by date
  }

  // Sort by date
  entries.sort((a, b) => new Date().getTime() - new Date().getTime());

  // Calculate running balance
  let runningBalance = 0;
  const transactions = entries.map((entry) => {
    runningBalance += entry.debit - entry.credit;
    return {
      date: new Date(), // Would come from journal entry
      entryNumber: entry.accountCode,
      description: entry.description || "",
      debit: entry.debit,
      credit: entry.credit,
      balance: runningBalance,
    };
  });

  return {
    account: {
      ...account,
      id: `acc-${accountCode}`,
      balance: runningBalance,
      currency: "CNY",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    transactions,
    openingBalance: 0,
    closingBalance: runningBalance,
  };
}

/**
 * Generate General Ledger for all accounts
 */
export function generateAllGeneralLedgers(
  accounts: Account[],
  journalEntries: JournalEntry[],
  filters?: {
    startDate?: Date;
    endDate?: Date;
  },
): GeneralLedger[] {
  // Filter journal entries by date range if provided
  const filteredEntries =
    filters?.startDate && filters?.endDate
      ? journalEntries.filter(
          (entry) =>
            entry.date >= filters.startDate && entry.date <= filters.endDate,
        )
      : journalEntries;

  return accounts.map((account) =>
    generateGeneralLedger(account.code, filteredEntries),
  );
}

// =============================================================================
// BALANCE SHEET
// =============================================================================

/**
 * Generate Balance Sheet report
 */
export function generateBalanceSheet(
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate: Date = new Date(),
): BalanceSheet {
  // Get posted entries up to asOfDate
  const postedEntries = journalEntries.filter(
    (e) => e.status === "posted" && e.date <= asOfDate,
  );

  // Calculate account balances
  const balances = new Map<string, number>();
  postedEntries.forEach((entry) => {
    entry.entries.forEach((line) => {
      const current = balances.get(line.accountCode) || 0;
      let change = 0;

      if (line.debit > 0) {
        // Debit increases assets, expenses; decreases liabilities, equity, revenue
        if (
          ["1000", "1400", "1500", "5000", "6000"].some((prefix) =>
            line.accountCode.startsWith(prefix),
          )
        ) {
          change = line.debit;
        } else {
          change = -line.debit;
        }
      }
      if (line.credit > 0) {
        // Credit increases liabilities, equity, revenue; decreases assets, expenses
        if (
          ["1000", "1400", "1500", "5000", "6000"].some((prefix) =>
            line.accountCode.startsWith(prefix),
          )
        ) {
          change = -line.credit;
        } else {
          change = line.credit;
        }
      }

      balances.set(line.accountCode, current + change);
    });
  });

  // Categorize accounts
  const currentAssets: Account[] = [];
  const nonCurrentAssets: Account[] = [];
  const currentLiabilities: Account[] = [];
  const nonCurrentLiabilities: Account[] = [];
  const equityItems: Account[] = [];

  accounts.forEach((account) => {
    const balance = balances.get(account.code) ?? account.balance;
    const fullAccount: Account = {
      ...account,
      id: `acc-${account.code}`,
      balance,
      currency: "CNY",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    switch (account.type) {
      case "asset":
        if (
          [
            "cash",
            "bank",
            "accounts_receivable",
            "inventory",
            "prepaid",
          ].includes(account.category)
        ) {
          currentAssets.push(fullAccount);
        } else {
          nonCurrentAssets.push(fullAccount);
        }
        break;
      case "liability":
        if (
          [
            "accounts_payable",
            "accrued_expenses",
            "short_term_debt",
            "taxes",
          ].includes(account.category)
        ) {
          currentLiabilities.push(fullAccount);
        } else {
          nonCurrentLiabilities.push(fullAccount);
        }
        break;
      case "equity":
        equityItems.push(fullAccount);
        break;
    }
  });

  const totalCurrentAssets = currentAssets.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const totalNonCurrentAssets = nonCurrentAssets.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = currentLiabilities.reduce(
    (sum, a) => sum + Math.abs(a.balance),
    0,
  );
  const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce(
    (sum, a) => sum + Math.abs(a.balance),
    0,
  );
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = equityItems.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    reportDate: asOfDate,
    currency: "CNY",
    assets: {
      currentAssets,
      nonCurrentAssets,
      totalAssets,
    },
    liabilities: {
      currentLiabilities,
      nonCurrentLiabilities,
      totalLiabilities,
    },
    equity: {
      items: equityItems,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
  };
}

// =============================================================================
// PROFIT AND LOSS (INCOME STATEMENT)
// =============================================================================

/**
 * Generate Profit and Loss report
 */
export function generateProfitAndLoss(
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate: Date,
  endDate: Date,
): ProfitAndLoss {
  // Get entries within date range
  const periodEntries = journalEntries.filter(
    (e) => e.status === "posted" && e.date >= startDate && e.date <= endDate,
  );

  // Calculate balances for revenue and expense accounts
  const revenueBalances = new Map<string, number>();
  const expenseBalances = new Map<string, number>();

  periodEntries.forEach((entry) => {
    entry.entries.forEach((line) => {
      const account = DEFAULT_CHART_OF_ACCOUNTS.find(
        (a) => a.code === line.accountCode,
      );
      if (!account) return;

      if (account.type === "revenue") {
        const current = revenueBalances.get(line.accountCode) || 0;
        revenueBalances.set(
          line.accountCode,
          current + line.credit - line.debit,
        );
      } else if (account.type === "expense") {
        const current = expenseBalances.get(line.accountCode) || 0;
        expenseBalances.set(
          line.accountCode,
          current + line.debit - line.credit,
        );
      }
    });
  });

  // Build revenue section
  const revenueItems = accounts
    .filter((a) => a.type === "revenue")
    .map((account) => {
      const balance = revenueBalances.get(account.code) ?? account.balance;
      return {
        ...account,
        id: `acc-${account.code}`,
        balance: Math.abs(balance),
        currency: "CNY",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  const totalRevenue = revenueItems.reduce((sum, a) => sum + a.balance, 0);

  // Build COGS section
  const cogsItems = accounts
    .filter((a) => a.category === "cost_of_goods_sold")
    .map((account) => {
      const balance = expenseBalances.get(account.code) ?? account.balance;
      return {
        ...account,
        id: `acc-${account.code}`,
        balance: Math.abs(balance),
        currency: "CNY",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  const totalCOGS = cogsItems.reduce((sum, a) => sum + a.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;

  // Build operating expenses section
  const operatingExpenses = accounts
    .filter((a) => a.category === "operating_expenses")
    .map((account) => {
      const balance = expenseBalances.get(account.code) ?? account.balance;
      return {
        ...account,
        id: `acc-${account.code}`,
        balance: Math.abs(balance),
        currency: "CNY",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  const totalOperatingExpenses = operatingExpenses.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const operatingIncome = grossProfit - totalOperatingExpenses;

  // Other income
  const otherIncomeItems = accounts
    .filter((a) => a.category === "other_income")
    .map((account) => ({
      ...account,
      id: `acc-${account.code}`,
      balance: Math.abs(revenueBalances.get(account.code) ?? account.balance),
      currency: "CNY",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

  const totalOtherIncome = otherIncomeItems.reduce(
    (sum, a) => sum + a.balance,
    0,
  );

  // Other expenses
  const otherExpensesItems = accounts
    .filter(
      (a) =>
        ["interest", "depreciation", "taxes"].includes(a.category) &&
        a.type === "expense",
    )
    .map((account) => {
      const balance = expenseBalances.get(account.code) ?? account.balance;
      return {
        ...account,
        id: `acc-${account.code}`,
        balance: Math.abs(balance),
        currency: "CNY",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  const totalOtherExpenses = otherExpensesItems.reduce(
    (sum, a) => sum + a.balance,
    0,
  );
  const incomeBeforeTax =
    operatingIncome + totalOtherIncome - totalOtherExpenses;

  // Income tax (simplified - 25% of taxable income)
  const incomeTax = Math.max(0, incomeBeforeTax * 0.25);
  const netIncome = incomeBeforeTax - incomeTax;

  return {
    startDate,
    endDate,
    currency: "CNY",
    revenue: {
      items: revenueItems,
      total: totalRevenue,
    },
    costOfGoodsSold: {
      items: cogsItems,
      total: totalCOGS,
    },
    grossProfit,
    operatingExpenses: {
      items: operatingExpenses,
      total: totalOperatingExpenses,
    },
    operatingIncome,
    otherIncome: {
      items: otherIncomeItems,
      total: totalOtherIncome,
    },
    otherExpenses: {
      items: otherExpensesItems,
      total: totalOtherExpenses,
    },
    incomeBeforeTax,
    incomeTax,
    netIncome,
  };
}

// =============================================================================
// REPORT EXPORT UTILITIES
// =============================================================================

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "CNY",
): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Generate report configuration
 */
export function generateReportConfig(
  companyName: string,
  companyAddress: string,
  taxId: string,
): ReportConfig {
  return {
    companyName,
    companyAddress,
    taxId,
    reportTitle: "Financial Statement",
    preparedBy: "OMB Accounting System",
    approvedBy: "",
    printDate: new Date(),
  };
}
