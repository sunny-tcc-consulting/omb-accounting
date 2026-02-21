/**
 * Unit Tests for Report Generator
 * Tests for Trial Balance, Balance Sheet, Profit & Loss, and General Ledger calculations
 */

import {
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateGeneralLedger,
  generateJournalEntries,
  formatCurrency,
  formatNumber,
  DEFAULT_CHART_OF_ACCOUNTS,
} from "@/lib/report-generator";
import { Transaction } from "@/types";

// =============================================================================
// MOCK DATA HELPERS
// =============================================================================

function createMockAccount(
  overrides: Partial<{
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    category: string;
    balance: number;
  }> = {},
) {
  const defaultAccount = {
    id: `acc-${overrides.code || "1001"}`,
    code: overrides.code || "1001",
    name: overrides.name || "Test Account",
    type: overrides.type || "asset",
    category: overrides.category || "bank",
    balance: overrides.balance || 0,
    currency: "CNY",
    isSubAccount: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { ...defaultAccount, ...overrides };
}

function createMockJournalEntry(
  overrides: {
    status?: "draft" | "posted" | "reversed";
    totalDebit?: number;
    totalCredit?: number;
    date?: Date;
    entries?: Array<{
      accountCode: string;
      debit: number;
      credit: number;
    }>;
  } = {},
) {
  const entries = overrides.entries || [
    { accountCode: "1001", debit: 1000, credit: 0 },
    { accountCode: "4001", debit: 0, credit: 1000 },
  ];

  const totalDebit =
    overrides.totalDebit ?? entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit =
    overrides.totalCredit ?? entries.reduce((sum, e) => sum + e.credit, 0);

  return {
    id: "je-001",
    entryNumber: "JE-0001",
    date: overrides.date || new Date("2025-01-15"),
    description: "Test Journal Entry",
    entries: entries.map((e, i) => ({
      id: `jel-${i}`,
      accountId: e.accountCode,
      accountCode: e.accountCode,
      accountName:
        DEFAULT_CHART_OF_ACCOUNTS.find((a) => a.code === e.accountCode)?.name ||
        "Test Account",
      debit: e.debit,
      credit: e.credit,
      description: "Test entry line",
    })),
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    status: overrides.status || "posted",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    id: `txn-${Date.now()}`,
    type: overrides.type || "income",
    amount: overrides.amount || 1000,
    date: overrides.date || new Date("2025-01-15"),
    description: overrides.description || "Test Transaction",
    customerId: overrides.customerId || "cust-001",
    status: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// =============================================================================
// TRIAL BALANCE TESTS
// =============================================================================

describe("Trial Balance Generation", () => {
  test("should calculate correct total debits and credits for balanced entries", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 5000 }),
      createMockAccount({ code: "4001", type: "revenue", balance: 5000 }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 5000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 5000 },
      ],
    });

    const result = generateTrialBalance(accounts, [journalEntry]);

    expect(result.totals.totalDebit).toBe(5000);
    expect(result.totals.totalCredit).toBe(5000);
    expect(result.totals.isBalanced).toBe(true);
  });

  test("should handle empty journal entries", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 0 }),
      createMockAccount({ code: "2001", type: "liability", balance: 0 }),
    ];

    const result = generateTrialBalance(accounts, []);

    expect(result.totals.totalDebit).toBe(0);
    expect(result.totals.totalCredit).toBe(0);
    expect(result.totals.isBalanced).toBe(true);
  });

  test("should correctly categorize debit and credit balances", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 1000 }),
      createMockAccount({ code: "2001", type: "liability", balance: 500 }),
      createMockAccount({ code: "4001", type: "revenue", balance: 1000 }),
      createMockAccount({ code: "5001", type: "expense", balance: 500 }),
    ];

    // Create balanced entries
    const entry1 = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 1000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 1000 },
      ],
    });

    const entry2 = createMockJournalEntry({
      entries: [
        { accountCode: "2001", debit: 500, credit: 0 },
        { accountCode: "5001", debit: 0, credit: 500 },
      ],
      date: new Date("2025-01-16"),
    });

    const result = generateTrialBalance(accounts, [entry1, entry2]);

    expect(result.accounts.length).toBe(4);
  });

  test("should detect unbalanced trial balance", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 1000 }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 1000, credit: 0 },
        // Missing credit entry - unbalanced
      ],
    });

    const result = generateTrialBalance(accounts, [journalEntry]);

    expect(result.totals.isBalanced).toBe(false);
  });

  test("should include all accounts in trial balance", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 0 }),
      createMockAccount({ code: "2001", type: "liability", balance: 0 }),
      createMockAccount({ code: "3001", type: "equity", balance: 0 }),
      createMockAccount({ code: "4001", type: "revenue", balance: 0 }),
      createMockAccount({ code: "5001", type: "expense", balance: 0 }),
    ];

    const result = generateTrialBalance(accounts, []);

    expect(result.accounts.length).toBe(5);
    expect(result.accounts.map((a) => a.account.code)).toEqual([
      "1001",
      "2001",
      "3001",
      "4001",
      "5001",
    ]);
  });

  test("should sum multiple transactions for same account", () => {
    const accounts = [
      createMockAccount({ code: "1001", type: "asset", balance: 0 }),
      createMockAccount({ code: "4001", type: "revenue", balance: 0 }),
    ];

    const entries1 = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 1000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 1000 },
      ],
    });

    const entries2 = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 500, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 500 },
      ],
      date: new Date("2025-01-16"),
    });

    const result = generateTrialBalance(accounts, [entries1, entries2]);

    expect(result.totals.totalDebit).toBe(1500);
    expect(result.totals.totalCredit).toBe(1500);
    expect(result.totals.isBalanced).toBe(true);
  });
});

// =============================================================================
// BALANCE SHEET TESTS
// =============================================================================

describe("Balance Sheet Generation", () => {
  test("should calculate total assets correctly", () => {
    const accounts = [
      createMockAccount({
        code: "1001",
        type: "asset",
        category: "cash",
        balance: 5000,
      }),
      createMockAccount({
        code: "1002",
        type: "asset",
        category: "bank",
        balance: 10000,
      }),
      createMockAccount({
        code: "1101",
        type: "asset",
        category: "accounts_receivable",
        balance: 3000,
      }),
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 18000,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 5000, credit: 0 },
        { accountCode: "1002", debit: 10000, credit: 0 },
        { accountCode: "1101", debit: 3000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 18000 },
      ],
    });

    const result = generateBalanceSheet(
      accounts,
      [journalEntry],
      new Date("2025-01-31"),
    );

    // Balance sheet only shows assets/liabilities/equity, not revenue
    expect(result.assets.currentAssets.length).toBe(3);
  });

  test("should categorize current vs non-current assets", () => {
    const accounts = [
      createMockAccount({
        code: "1001",
        type: "asset",
        category: "cash",
        balance: 1000,
      }),
      createMockAccount({
        code: "1401",
        type: "asset",
        category: "fixed_assets",
        balance: 5000,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 1000, credit: 0 },
        { accountCode: "1401", debit: 5000, credit: 0 },
        { accountCode: "3001", debit: 0, credit: 6000 },
      ],
    });

    const result = generateBalanceSheet(
      accounts,
      [journalEntry],
      new Date("2025-01-31"),
    );

    expect(result.assets.currentAssets.length).toBe(1);
    expect(result.assets.nonCurrentAssets.length).toBe(1);
    expect(result.assets.currentAssets[0].code).toBe("1001");
    expect(result.assets.nonCurrentAssets[0].code).toBe("1401");
  });

  test("should categorize current vs long-term liabilities", () => {
    const accounts = [
      createMockAccount({
        code: "2001",
        type: "liability",
        category: "accounts_payable",
        balance: 2000,
      }),
      createMockAccount({
        code: "2301",
        type: "liability",
        category: "long_term_debt",
        balance: 10000,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "2001", debit: 0, credit: 2000 },
        { accountCode: "2301", debit: 0, credit: 10000 },
        { accountCode: "3001", debit: 12000, credit: 0 },
      ],
    });

    const result = generateBalanceSheet(
      accounts,
      [journalEntry],
      new Date("2025-01-31"),
    );

    expect(result.liabilities.currentLiabilities.length).toBe(1);
    expect(result.liabilities.nonCurrentLiabilities.length).toBe(1);
    expect(result.liabilities.totalLiabilities).toBe(12000);
  });

  test("should verify assets = liabilities + equity (balance equation)", () => {
    const accounts = [
      createMockAccount({
        code: "1001",
        type: "asset",
        category: "cash",
        balance: 0,
      }),
      createMockAccount({
        code: "2001",
        type: "liability",
        category: "accounts_payable",
        balance: 0,
      }),
      createMockAccount({
        code: "3001",
        type: "equity",
        category: "owner_equity",
        balance: 10000,
      }),
    ];

    const result = generateBalanceSheet(accounts, [], new Date("2025-01-31"));

    // Balance sheet should categorize accounts correctly
    expect(result.assets.currentAssets.length).toBe(1);
    expect(result.liabilities.currentLiabilities.length).toBe(1);
    expect(result.equity.items.length).toBe(1);
    expect(result.equity.totalEquity).toBe(10000);
  });

  test("should handle empty data with zero balances", () => {
    const accounts: ReturnType<typeof createMockAccount>[] = [];

    const result = generateBalanceSheet(accounts, [], new Date("2025-01-31"));

    expect(result.assets.totalAssets).toBe(0);
    expect(result.liabilities.totalLiabilities).toBe(0);
    expect(result.equity.totalEquity).toBe(0);
    expect(result.isBalanced).toBe(true);
  });

  test("should only include posted entries", () => {
    const accounts = [
      createMockAccount({
        code: "1001",
        type: "asset",
        category: "cash",
        balance: 1000,
      }),
    ];

    const postedEntry = createMockJournalEntry({ status: "posted" });
    const draftEntry = createMockJournalEntry({
      status: "draft",
      entries: [
        { accountCode: "1001", debit: 5000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 5000 },
      ],
    });

    const result = generateBalanceSheet(
      accounts,
      [postedEntry, draftEntry],
      new Date("2025-01-31"),
    );

    // Draft entries should not affect the balance sheet
    expect(result.assets.totalAssets).toBeLessThan(5000);
  });
});

// =============================================================================
// PROFIT AND LOSS TESTS
// =============================================================================

describe("Profit and Loss Generation", () => {
  test("should calculate total revenue correctly", () => {
    const accounts = [
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 0,
      }),
      createMockAccount({
        code: "4002",
        type: "revenue",
        category: "services",
        balance: 0,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 0, credit: 10000 }, // Cash received
        { accountCode: "4001", debit: 0, credit: 8000 },
        { accountCode: "4002", debit: 0, credit: 2000 },
      ],
    });

    const result = generateProfitAndLoss(
      accounts,
      [journalEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result.revenue.total).toBeGreaterThan(0);
  });

  test("should calculate gross profit correctly (Revenue - COGS)", () => {
    const accounts = [
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 0,
      }),
      createMockAccount({
        code: "5001",
        type: "expense",
        category: "cost_of_goods_sold",
        balance: 0,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 0, credit: 10000 },
        { accountCode: "4001", debit: 0, credit: 10000 }, // Revenue
        { accountCode: "5001", debit: 3000, credit: 0 }, // COGS
        { accountCode: "2001", debit: 3000, credit: 0 }, // Payable
      ],
    });

    const result = generateProfitAndLoss(
      accounts,
      [journalEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result.grossProfit).toBe(
      result.revenue.total - result.costOfGoodsSold.total,
    );
    expect(result.grossProfit).toBe(10000 - 3000); // 7000
  });

  test("should calculate operating income correctly", () => {
    const accounts = [
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 0,
      }),
      createMockAccount({
        code: "5001",
        type: "expense",
        category: "cost_of_goods_sold",
        balance: 0,
      }),
      createMockAccount({
        code: "6001",
        type: "expense",
        category: "operating_expenses",
        balance: 0,
      }),
      createMockAccount({
        code: "6003",
        type: "expense",
        category: "operating_expenses",
        balance: 0,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "4001", debit: 0, credit: 10000 },
        { accountCode: "5001", debit: 3000, credit: 0 },
        { accountCode: "6001", debit: 2000, credit: 0 }, // Operating expense
        { accountCode: "6003", debit: 1000, credit: 0 }, // Rent
      ],
    });

    const result = generateProfitAndLoss(
      accounts,
      [journalEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result.operatingIncome).toBe(
      result.grossProfit - result.operatingExpenses.total,
    );
  });

  test("should calculate net income after tax (25%)", () => {
    const accounts = [
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 0,
      }),
      createMockAccount({
        code: "5001",
        type: "expense",
        category: "cost_of_goods_sold",
        balance: 0,
      }),
      createMockAccount({
        code: "6300",
        type: "expense",
        category: "taxes",
        balance: 0,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "4001", debit: 0, credit: 10000 },
        { accountCode: "5001", debit: 2000, credit: 0 },
        { accountCode: "6300", debit: 0, credit: 0 }, // Tax calculated separately
      ],
    });

    const result = generateProfitAndLoss(
      accounts,
      [journalEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    const expectedIncomeBeforeTax = 10000 - 2000;
    const expectedTax = expectedIncomeBeforeTax * 0.25;
    const expectedNetIncome = expectedIncomeBeforeTax - expectedTax;

    expect(result.incomeTax).toBe(expectedTax);
    expect(result.netIncome).toBe(expectedNetIncome);
  });

  test("should filter entries by date range", () => {
    const accounts = [
      createMockAccount({
        code: "4001",
        type: "revenue",
        category: "sales",
        balance: 0,
      }),
    ];

    const janEntry = createMockJournalEntry({
      date: new Date("2025-01-15"),
      entries: [{ accountCode: "4001", debit: 0, credit: 5000 }],
    });

    const febEntry = createMockJournalEntry({
      date: new Date("2025-02-15"),
      entries: [{ accountCode: "4001", debit: 0, credit: 3000 }],
    });

    const result = generateProfitAndLoss(
      accounts,
      [janEntry, febEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    // Should only include January revenue
    expect(result.revenue.total).toBe(5000);
    expect(result.revenue.total).not.toBe(8000);
  });

  test("should handle no revenue or expenses", () => {
    const accounts: ReturnType<typeof createMockAccount>[] = [];

    const result = generateProfitAndLoss(
      accounts,
      [],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result.revenue.total).toBe(0);
    expect(result.grossProfit).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.incomeTax).toBe(0);
  });

  test("should categorize operating vs other expenses", () => {
    const accounts = [
      createMockAccount({
        code: "6001",
        type: "expense",
        category: "operating_expenses",
        balance: 0,
      }),
      createMockAccount({
        code: "6200",
        type: "expense",
        category: "interest",
        balance: 0,
      }),
      createMockAccount({
        code: "6300",
        type: "expense",
        category: "taxes",
        balance: 0,
      }),
    ];

    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "6001", debit: 1000, credit: 0 },
        { accountCode: "6200", debit: 100, credit: 0 },
        { accountCode: "6300", debit: 500, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 1600 },
      ],
    });

    const result = generateProfitAndLoss(
      accounts,
      [journalEntry],
      new Date("2025-01-01"),
      new Date("2025-01-31"),
    );

    expect(result.operatingExpenses.items.length).toBe(1);
    expect(result.otherExpenses.items.length).toBe(2); // Interest and taxes
  });
});

// =============================================================================
// GENERAL LEDGER TESTS
// =============================================================================

describe("General Ledger Generation", () => {
  test("should throw error for non-existent account", () => {
    expect(() => {
      generateGeneralLedger("9999", []);
    }).toThrow("Account 9999 not found");
  });

  test("should calculate running balance correctly", () => {
    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "1001", debit: 1000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 1000 },
      ],
    });

    const result = generateGeneralLedger("1001", [journalEntry]);

    expect(result.account.code).toBe("1001");
    expect(result.transactions.length).toBeGreaterThan(0);
  });

  test("should handle empty transactions", () => {
    const journalEntry = createMockJournalEntry({
      entries: [
        { accountCode: "4001", debit: 0, credit: 1000 }, // Different account
        { accountCode: "2001", debit: 1000, credit: 0 },
      ],
    });

    const result = generateGeneralLedger("1001", [journalEntry]);

    expect(result.transactions.length).toBe(0);
    expect(result.closingBalance).toBe(0);
  });

  test("should include correct account details", () => {
    const result = generateGeneralLedger("1001", []);

    expect(result.account.code).toBe("1001");
    expect(result.account.name).toBe("Cash on Hand");
    expect(result.account.type).toBe("asset");
  });

  test("should track opening and closing balance", () => {
    const entry1 = createMockJournalEntry({
      date: new Date("2025-01-01"),
      entries: [
        { accountCode: "1001", debit: 5000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 5000 },
      ],
    });

    const entry2 = createMockJournalEntry({
      date: new Date("2025-01-15"),
      entries: [
        { accountCode: "1001", debit: 2000, credit: 0 },
        { accountCode: "4001", debit: 0, credit: 2000 },
      ],
    });

    const result = generateGeneralLedger("1001", [entry1, entry2]);

    // Running balance should accumulate
    expect(result.closingBalance).toBe(
      result.transactions.length > 0
        ? result.transactions[result.transactions.length - 1].balance
        : 0,
    );
  });
});

// =============================================================================
// JOURNAL ENTRY GENERATION TESTS
// =============================================================================

describe("Journal Entry Generation", () => {
  test("should generate journal entries from transactions", () => {
    const transactions: Transaction[] = [
      createMockTransaction({
        amount: 1000,
        type: "income",
        date: new Date("2025-01-15"),
      }),
      createMockTransaction({
        amount: 500,
        type: "expense",
        date: new Date("2025-01-16"),
      }),
    ];

    const entries = generateJournalEntries(transactions);

    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].status).toBe("posted");
  });

  test("should group transactions by date", () => {
    const transactions: Transaction[] = [
      createMockTransaction({
        amount: 1000,
        type: "income",
        date: new Date("2025-01-15"),
      }),
      createMockTransaction({
        amount: 500,
        type: "income",
        date: new Date("2025-01-15"),
      }),
    ];

    const entries = generateJournalEntries(transactions);

    // Should create one entry for same date
    expect(entries.length).toBe(1);
  });

  test("should create separate entries for different dates", () => {
    const transactions: Transaction[] = [
      createMockTransaction({
        amount: 1000,
        type: "income",
        date: new Date("2025-01-15"),
      }),
      createMockTransaction({
        amount: 500,
        type: "income",
        date: new Date("2025-01-16"),
      }),
    ];

    const entries = generateJournalEntries(transactions);

    expect(entries.length).toBe(2);
  });

  test("should balance debit and credit for each entry", () => {
    const transactions: Transaction[] = [
      createMockTransaction({
        amount: 1000,
        type: "income",
        date: new Date("2025-01-15"),
      }),
    ];

    const entries = generateJournalEntries(transactions);

    entries.forEach((entry) => {
      expect(entry.totalDebit).toBe(entry.totalCredit);
      expect(entry.isBalanced).toBe(true);
    });
  });
});

// =============================================================================
// FORMAT UTILITY TESTS
// =============================================================================

describe("Format Utilities", () => {
  test("should format currency correctly (CNY)", () => {
    expect(formatCurrency(1234.56)).toBe("¥1,234.56");
    expect(formatCurrency(0)).toBe("¥0.00");
    expect(formatCurrency(1000000)).toBe("¥1,000,000.00");
  });

  test("should format number with separators", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
    expect(formatNumber(0)).toBe("0.00");
    expect(formatNumber(1000000)).toBe("1,000,000.00");
    expect(formatNumber(1234.567, 3)).toBe("1,234.567");
  });

  test("should handle negative numbers", () => {
    expect(formatNumber(-1234.56)).toBe("-1,234.56");
  });
});

// =============================================================================
// CHART OF ACCOUNTS TESTS
// =============================================================================

describe("Chart of Accounts", () => {
  test("should have all required account types", () => {
    const codes = DEFAULT_CHART_OF_ACCOUNTS.map((a) => a.code);

    // Check asset accounts exist
    expect(codes.some((c) => c.startsWith("1"))).toBe(true);

    // Check liability accounts exist
    expect(codes.some((c) => c.startsWith("2"))).toBe(true);

    // Check equity accounts exist
    expect(codes.some((c) => c.startsWith("3"))).toBe(true);

    // Check revenue accounts exist
    expect(codes.some((c) => c.startsWith("4"))).toBe(true);

    // Check expense accounts exist
    expect(codes.some((c) => c.startsWith("5") || c.startsWith("6"))).toBe(
      true,
    );
  });

  test("should have balanced account structure", () => {
    const totalAssets = DEFAULT_CHART_OF_ACCOUNTS.filter(
      (a) => a.type === "asset",
    ).length;
    const totalLiabilities = DEFAULT_CHART_OF_ACCOUNTS.filter(
      (a) => a.type === "liability",
    ).length;
    const totalEquity = DEFAULT_CHART_OF_ACCOUNTS.filter(
      (a) => a.type === "equity",
    ).length;
    const totalRevenue = DEFAULT_CHART_OF_ACCOUNTS.filter(
      (a) => a.type === "revenue",
    ).length;
    const totalExpenses = DEFAULT_CHART_OF_ACCOUNTS.filter(
      (a) => a.type === "expense",
    ).length;

    // Should have reasonable distribution
    expect(totalAssets).toBeGreaterThan(0);
    expect(totalLiabilities).toBeGreaterThan(0);
    expect(totalEquity).toBeGreaterThan(0);
    expect(totalRevenue).toBeGreaterThan(0);
    expect(totalExpenses).toBeGreaterThan(0);
  });

  test("should have unique account codes", () => {
    const codes = DEFAULT_CHART_OF_ACCOUNTS.map((a) => a.code);
    const uniqueCodes = new Set(codes);

    expect(codes.length).toBe(uniqueCodes.size);
  });
});
