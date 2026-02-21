// Financial Report Types for Audit

// Account Types
export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

// Account Categories
export type AccountCategory =
  | "cash"
  | "bank"
  | "accounts_receivable"
  | "inventory"
  | "prepaid"
  | "fixed_assets"
  | "accounts_payable"
  | "accrued_expenses"
  | "short_term_debt"
  | "long_term_debt"
  | "owner_equity"
  | "retained_earnings"
  | "common_stock"
  | "sales"
  | "services"
  | "other_income"
  | "cost_of_goods_sold"
  | "operating_expenses"
  | "depreciation"
  | "interest"
  | "taxes";

// Chart of Accounts
export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance: number;
  currency: string;
  parentAccountId?: string;
  isSubAccount: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Entry
export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  entries: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: "draft" | "posted" | "reversed";
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

// Balance Sheet
export interface BalanceSheet {
  reportDate: Date;
  currency: string;
  assets: {
    currentAssets: Account[];
    nonCurrentAssets: Account[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: Account[];
    nonCurrentLiabilities: Account[];
    totalLiabilities: number;
  };
  equity: {
    items: Account[];
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

// Profit and Loss (Income Statement)
export interface ProfitAndLoss {
  startDate: Date;
  endDate: Date;
  currency: string;
  revenue: {
    items: Account[];
    total: number;
  };
  costOfGoodsSold: {
    items: Account[];
    total: number;
  };
  grossProfit: number;
  operatingExpenses: {
    items: Account[];
    total: number;
  };
  operatingIncome: number;
  otherIncome: {
    items: Account[];
    total: number;
  };
  otherExpenses: {
    items: Account[];
    total: number;
  };
  incomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

// Trial Balance
export interface TrialBalance {
  reportDate: Date;
  currency: string;
  accounts: {
    account: Account;
    debitBalance: number;
    creditBalance: number;
  }[];
  totals: {
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  };
}

// General Ledger
export interface GeneralLedger {
  account: Account;
  transactions: {
    date: Date;
    entryNumber: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
  openingBalance: number;
  closingBalance: number;
}

// Cash Flow Statement
export interface CashFlowStatement {
  startDate: Date;
  endDate: Date;
  currency: string;
  operatingActivities: {
    items: {
      description: string;
      amount: number;
    }[];
    netCash: number;
  };
  investingActivities: {
    items: {
      description: string;
      amount: number;
    }[];
    netCash: number;
  };
  financingActivities: {
    items: {
      description: string;
      amount: number;
    }[];
    netCash: number;
  };
  netChangeInCash: number;
  beginningCashBalance: number;
  endingCashBalance: number;
}

// Report Filters
export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  currency?: string;
  accountType?: AccountType;
  status?: "draft" | "posted" | "reversed";
}

// Report Configuration
export interface ReportConfig {
  companyName: string;
  companyAddress: string;
  taxId: string;
  reportTitle: string;
  preparedBy: string;
  approvedBy: string;
  printDate: Date;
}
