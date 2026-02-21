/**
 * Unit Tests for PDF Generator
 * Tests for PDF generation of Trial Balance, Balance Sheet, P&L, and General Ledger
 */

// Mock jsPDF before imports
jest.mock("jspdf", () => {
  const mockDoc = {
    text: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setFont: jest.fn(),
    setDrawColor: jest.fn(),
    line: jest.fn(),
    setPage: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    getBlob: jest.fn().mockReturnValue(new Blob()),
    output: jest.fn().mockReturnValue(new Blob()),
    lastAutoTable: { finalY: 100 },
    internal: {
      pages: ["", "1", "2"],
    },
  };

  const MockjsPDF = jest.fn().mockImplementation(() => mockDoc);
  return {
    __esModule: true,
    default: MockjsPDF,
  };
});

jest.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import {
  TrialBalancePDF,
  BalanceSheetPDF,
  ProfitAndLossPDF,
  GeneralLedgerPDF,
  getReportConfig,
} from "@/lib/pdf-generator";
import {
  TrialBalance,
  BalanceSheet,
  ProfitAndLoss,
  GeneralLedger,
  Account,
} from "@/types/report";

// =============================================================================
// MOCK DATA HELPERS
// =============================================================================

function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
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
    ...overrides,
  };
}

function createMockTrialBalance(): TrialBalance {
  return {
    reportDate: new Date("2025-01-31"),
    currency: "CNY",
    accounts: [
      {
        account: createMockAccount({
          code: "1001",
          name: "Cash on Hand",
          type: "asset",
          balance: 10000,
        }),
        debitBalance: 10000,
        creditBalance: 0,
      },
      {
        account: createMockAccount({
          code: "4001",
          name: "Sales Revenue",
          type: "revenue",
          balance: 10000,
        }),
        debitBalance: 0,
        creditBalance: 10000,
      },
    ],
    totals: {
      totalDebit: 10000,
      totalCredit: 10000,
      isBalanced: true,
    },
  };
}

function createMockBalanceSheet(): BalanceSheet {
  return {
    reportDate: new Date("2025-01-31"),
    currency: "CNY",
    assets: {
      currentAssets: [
        createMockAccount({
          code: "1001",
          name: "Cash on Hand",
          type: "asset",
          category: "cash",
          balance: 10000,
        }),
        createMockAccount({
          code: "1002",
          name: "Bank Account",
          type: "asset",
          category: "bank",
          balance: 20000,
        }),
      ],
      nonCurrentAssets: [
        createMockAccount({
          code: "1401",
          name: "Office Equipment",
          type: "asset",
          category: "fixed_assets",
          balance: 5000,
        }),
      ],
      totalAssets: 35000,
    },
    liabilities: {
      currentLiabilities: [
        createMockAccount({
          code: "2001",
          name: "Accounts Payable",
          type: "liability",
          category: "accounts_payable",
          balance: 5000,
        }),
      ],
      nonCurrentLiabilities: [],
      totalLiabilities: 5000,
    },
    equity: {
      items: [
        createMockAccount({
          code: "3001",
          name: "Owner's Capital",
          type: "equity",
          category: "owner_equity",
          balance: 30000,
        }),
      ],
      totalEquity: 30000,
    },
    totalLiabilitiesAndEquity: 35000,
    isBalanced: true,
  };
}

function createMockProfitAndLoss(): ProfitAndLoss {
  return {
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-31"),
    currency: "CNY",
    revenue: {
      items: [
        createMockAccount({
          code: "4001",
          name: "Sales Revenue",
          type: "revenue",
          category: "sales",
          balance: 50000,
        }),
        createMockAccount({
          code: "4002",
          name: "Service Revenue",
          type: "revenue",
          category: "services",
          balance: 10000,
        }),
      ],
      total: 60000,
    },
    costOfGoodsSold: {
      items: [
        createMockAccount({
          code: "5001",
          name: "Cost of Goods Sold",
          type: "expense",
          category: "cost_of_goods_sold",
          balance: 20000,
        }),
      ],
      total: 20000,
    },
    grossProfit: 40000,
    operatingExpenses: {
      items: [
        createMockAccount({
          code: "6001",
          name: "Salaries and Wages",
          type: "expense",
          category: "operating_expenses",
          balance: 10000,
        }),
        createMockAccount({
          code: "6003",
          name: "Rent Expense",
          type: "expense",
          category: "operating_expenses",
          balance: 5000,
        }),
      ],
      total: 15000,
    },
    operatingIncome: 25000,
    otherIncome: {
      items: [],
      total: 0,
    },
    otherExpenses: {
      items: [
        createMockAccount({
          code: "6300",
          name: "Income Tax Expense",
          type: "expense",
          category: "taxes",
          balance: 6250,
        }),
      ],
      total: 6250,
    },
    incomeBeforeTax: 25000,
    incomeTax: 6250,
    netIncome: 18750,
  };
}

function createMockGeneralLedger(): GeneralLedger {
  return {
    account: createMockAccount({
      code: "1001",
      name: "Cash on Hand",
      type: "asset",
      category: "cash",
      balance: 15000,
    }),
    transactions: [
      {
        date: new Date("2025-01-05"),
        entryNumber: "JE-0001",
        description: "Initial capital contribution",
        debit: 10000,
        credit: 0,
        balance: 10000,
      },
      {
        date: new Date("2025-01-10"),
        entryNumber: "JE-0002",
        description: "Office supplies purchase",
        debit: 500,
        credit: 0,
        balance: 9500,
      },
      {
        date: new Date("2025-01-15"),
        entryNumber: "JE-0003",
        description: "Sales revenue received",
        debit: 0,
        credit: 0,
        balance: 15000,
      },
    ],
    openingBalance: 0,
    closingBalance: 15000,
  };
}

function createMockConfig() {
  return {
    companyName: "Test Company",
    companyAddress: "123 Test Street",
    taxId: "TEST-123",
    reportTitle: "Test Report",
    preparedBy: "Test System",
    approvedBy: "Test Manager",
    printDate: new Date("2025-01-31"),
  };
}

// =============================================================================
// CONFIG TESTS
// =============================================================================

describe("PDF Generator Configuration", () => {
  test("should create valid report config", () => {
    const config = getReportConfig();

    expect(config.companyName).toBe("OMB Accounting");
    expect(config.preparedBy).toBe("OMB Accounting System");
    expect(config.printDate).toBeInstanceOf(Date);
  });

  test("should accept custom config", () => {
    const customConfig = createMockConfig();

    expect(customConfig.companyName).toBe("Test Company");
    expect(customConfig.taxId).toBe("TEST-123");
    expect(customConfig.approvedBy).toBe("Test Manager");
  });
});

// =============================================================================
// TRIAL BALANCE PDF TESTS
// =============================================================================

describe("Trial Balance PDF Generation", () => {
  test("should create PDF instance without error", () => {
    const trialBalance = createMockTrialBalance();
    const config = createMockConfig();

    expect(() => {
      const pdf = new TrialBalancePDF(trialBalance, config);
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle empty trial balance", () => {
    const emptyTrialBalance: TrialBalance = {
      reportDate: new Date(),
      currency: "CNY",
      accounts: [],
      totals: {
        totalDebit: 0,
        totalCredit: 0,
        isBalanced: true,
      },
    };

    expect(() => {
      const pdf = new TrialBalancePDF(emptyTrialBalance, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle unbalanced trial balance", () => {
    const unbalancedTrialBalance: TrialBalance = {
      reportDate: new Date(),
      currency: "CNY",
      accounts: [
        {
          account: createMockAccount({
            code: "1001",
            type: "asset",
            balance: 1000,
          }),
          debitBalance: 1000,
          creditBalance: 0,
        },
      ],
      totals: {
        totalDebit: 1000,
        totalCredit: 0,
        isBalanced: false,
      },
    };

    expect(() => {
      const pdf = new TrialBalancePDF(
        unbalancedTrialBalance,
        createMockConfig(),
      );
      pdf.generate();
    }).not.toThrow();
  });

  test("should generate PDF blob without error", () => {
    const trialBalance = createMockTrialBalance();
    const pdf = new TrialBalancePDF(trialBalance, createMockConfig());
    pdf.generate();

    expect(() => pdf.getBlob()).not.toThrow();
  });
});

// =============================================================================
// BALANCE SHEET PDF TESTS
// =============================================================================

describe("Balance Sheet PDF Generation", () => {
  test("should create PDF instance without error", () => {
    const balanceSheet = createMockBalanceSheet();
    const config = createMockConfig();

    expect(() => {
      const pdf = new BalanceSheetPDF(balanceSheet, config);
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle empty balance sheet", () => {
    const emptyBalanceSheet: BalanceSheet = {
      reportDate: new Date(),
      currency: "CNY",
      assets: {
        currentAssets: [],
        nonCurrentAssets: [],
        totalAssets: 0,
      },
      liabilities: {
        currentLiabilities: [],
        nonCurrentLiabilities: [],
        totalLiabilities: 0,
      },
      equity: {
        items: [],
        totalEquity: 0,
      },
      totalLiabilitiesAndEquity: 0,
      isBalanced: true,
    };

    expect(() => {
      const pdf = new BalanceSheetPDF(emptyBalanceSheet, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle unbalanced balance sheet", () => {
    const unbalancedBalanceSheet: BalanceSheet = {
      reportDate: new Date(),
      currency: "CNY",
      assets: {
        currentAssets: [
          createMockAccount({ code: "1001", type: "asset", balance: 10000 }),
        ],
        nonCurrentAssets: [],
        totalAssets: 10000,
      },
      liabilities: {
        currentLiabilities: [],
        nonCurrentLiabilities: [],
        totalLiabilities: 0,
      },
      equity: {
        items: [],
        totalEquity: 5000,
      },
      totalLiabilitiesAndEquity: 5000,
      isBalanced: false,
    };

    expect(() => {
      const pdf = new BalanceSheetPDF(
        unbalancedBalanceSheet,
        createMockConfig(),
      );
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle large number of accounts", () => {
    const largeBalanceSheet: BalanceSheet = {
      reportDate: new Date(),
      currency: "CNY",
      assets: {
        currentAssets: Array.from({ length: 15 }, (_, i) =>
          createMockAccount({
            code: `100${i}`,
            type: "asset",
            balance: 1000 * (i + 1),
          }),
        ),
        nonCurrentAssets: Array.from({ length: 5 }, (_, i) =>
          createMockAccount({
            code: `140${i}`,
            type: "asset",
            category: "fixed_assets",
            balance: 5000 * (i + 1),
          }),
        ),
        totalAssets: 0,
      },
      liabilities: {
        currentLiabilities: Array.from({ length: 10 }, (_, i) =>
          createMockAccount({
            code: `200${i}`,
            type: "liability",
            balance: 500 * (i + 1),
          }),
        ),
        nonCurrentLiabilities: [],
        totalLiabilities: 0,
      },
      equity: {
        items: [
          createMockAccount({ code: "3001", type: "equity", balance: 50000 }),
        ],
        totalEquity: 50000,
      },
      totalLiabilitiesAndEquity: 50000,
      isBalanced: true,
    };
    largeBalanceSheet.assets.totalAssets =
      largeBalanceSheet.assets.currentAssets.reduce(
        (sum, a) => sum + a.balance,
        0,
      ) +
      largeBalanceSheet.assets.nonCurrentAssets.reduce(
        (sum, a) => sum + a.balance,
        0,
      );
    largeBalanceSheet.liabilities.totalLiabilities =
      largeBalanceSheet.liabilities.currentLiabilities.reduce(
        (sum, a) => sum + Math.abs(a.balance),
        0,
      );

    expect(() => {
      const pdf = new BalanceSheetPDF(largeBalanceSheet, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });
});

// =============================================================================
// PROFIT AND LOSS PDF TESTS
// =============================================================================

describe("Profit and Loss PDF Generation", () => {
  test("should create PDF instance without error", () => {
    const profitAndLoss = createMockProfitAndLoss();
    const config = createMockConfig();

    expect(() => {
      const pdf = new ProfitAndLossPDF(profitAndLoss, config);
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle empty profit and loss", () => {
    const emptyPL: ProfitAndLoss = {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
      currency: "CNY",
      revenue: { items: [], total: 0 },
      costOfGoodsSold: { items: [], total: 0 },
      grossProfit: 0,
      operatingExpenses: { items: [], total: 0 },
      operatingIncome: 0,
      otherIncome: { items: [], total: 0 },
      otherExpenses: { items: [], total: 0 },
      incomeBeforeTax: 0,
      incomeTax: 0,
      netIncome: 0,
    };

    expect(() => {
      const pdf = new ProfitAndLossPDF(emptyPL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle loss scenario", () => {
    const lossPL: ProfitAndLoss = {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
      currency: "CNY",
      revenue: {
        items: [
          createMockAccount({ code: "4001", type: "revenue", balance: 10000 }),
        ],
        total: 10000,
      },
      costOfGoodsSold: {
        items: [
          createMockAccount({ code: "5001", type: "expense", balance: 5000 }),
        ],
        total: 5000,
      },
      grossProfit: 5000,
      operatingExpenses: {
        items: [
          createMockAccount({ code: "6001", type: "expense", balance: 15000 }),
        ],
        total: 15000,
      },
      operatingIncome: -10000,
      otherIncome: { items: [], total: 0 },
      otherExpenses: { items: [], total: 0 },
      incomeBeforeTax: -10000,
      incomeTax: 0,
      netIncome: -10000,
    };

    expect(() => {
      const pdf = new ProfitAndLossPDF(lossPL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle zero tax scenario", () => {
    const zeroTaxPL: ProfitAndLoss = {
      ...createMockProfitAndLoss(),
      incomeBeforeTax: -5000,
      incomeTax: 0,
      netIncome: -5000,
    };

    expect(() => {
      const pdf = new ProfitAndLossPDF(zeroTaxPL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });
});

// =============================================================================
// GENERAL LEDGER PDF TESTS
// =============================================================================

describe("General Ledger PDF Generation", () => {
  test("should create PDF instance without error", () => {
    const generalLedger = createMockGeneralLedger();
    const config = createMockConfig();

    expect(() => {
      const pdf = new GeneralLedgerPDF(generalLedger, config);
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle empty transactions", () => {
    const emptyGL: GeneralLedger = {
      account: createMockAccount({ code: "1001", type: "asset" }),
      transactions: [],
      openingBalance: 0,
      closingBalance: 0,
    };

    expect(() => {
      const pdf = new GeneralLedgerPDF(emptyGL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle many transactions", () => {
    const manyTransactionsGL: GeneralLedger = {
      account: createMockAccount({
        code: "1001",
        type: "asset",
        balance: 50000,
      }),
      transactions: Array.from({ length: 50 }, (_, i) => ({
        date: new Date(2025, 0, 1 + i),
        entryNumber: `JE-${String(i + 1).padStart(4, "0")}`,
        description: `Transaction ${i + 1} - Test entry with description`,
        debit: Math.random() > 0.5 ? 1000 : 0,
        credit: Math.random() > 0.5 ? 1000 : 0,
        balance: 50000 + (Math.random() - 0.5) * 10000,
      })),
      openingBalance: 0,
      closingBalance: 50000,
    };

    expect(() => {
      const pdf = new GeneralLedgerPDF(manyTransactionsGL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });
});

// =============================================================================
// PDF INSTANCE CREATION TESTS
// =============================================================================

describe("PDF Export Functions", () => {
  test("should create TrialBalancePDF instance", () => {
    const trialBalance = createMockTrialBalance();
    expect(() => {
      const pdf = new TrialBalancePDF(trialBalance, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should create BalanceSheetPDF instance", () => {
    const balanceSheet = createMockBalanceSheet();
    expect(() => {
      const pdf = new BalanceSheetPDF(balanceSheet, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should create ProfitAndLossPDF instance", () => {
    const profitAndLoss = createMockProfitAndLoss();
    expect(() => {
      const pdf = new ProfitAndLossPDF(profitAndLoss, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should create GeneralLedgerPDF instance", () => {
    const generalLedger = createMockGeneralLedger();
    expect(() => {
      const pdf = new GeneralLedgerPDF(generalLedger, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe("PDF Generator Edge Cases", () => {
  test("should handle negative balances", () => {
    const trialBalance: TrialBalance = {
      reportDate: new Date(),
      currency: "CNY",
      accounts: [
        {
          account: createMockAccount({
            code: "2001",
            type: "liability",
            balance: -5000,
          }),
          debitBalance: 0,
          creditBalance: 5000,
        },
      ],
      totals: {
        totalDebit: 0,
        totalCredit: 5000,
        isBalanced: false,
      },
    };

    expect(() => {
      const pdf = new TrialBalancePDF(trialBalance, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle very large numbers", () => {
    const largeBalanceSheet = createMockBalanceSheet();
    largeBalanceSheet.assets.currentAssets[0].balance = 999999999;
    largeBalanceSheet.assets.totalAssets = 999999999;

    expect(() => {
      const pdf = new BalanceSheetPDF(largeBalanceSheet, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle zero balances", () => {
    const zeroPL: ProfitAndLoss = {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
      currency: "CNY",
      revenue: { items: [], total: 0 },
      costOfGoodsSold: { items: [], total: 0 },
      grossProfit: 0,
      operatingExpenses: { items: [], total: 0 },
      operatingIncome: 0,
      otherIncome: { items: [], total: 0 },
      otherExpenses: { items: [], total: 0 },
      incomeBeforeTax: 0,
      incomeTax: 0,
      netIncome: 0,
    };

    expect(() => {
      const pdf = new ProfitAndLossPDF(zeroPL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle accounts with special characters in name", () => {
    const account = createMockAccount({
      code: "1001",
      name: "Cash & Equivalents (RMB/USD)",
      type: "asset",
    });

    const trialBalance: TrialBalance = {
      reportDate: new Date(),
      currency: "CNY",
      accounts: [
        {
          account,
          debitBalance: 1000,
          creditBalance: 0,
        },
      ],
      totals: {
        totalDebit: 1000,
        totalCredit: 0,
        isBalanced: false,
      },
    };

    expect(() => {
      const pdf = new TrialBalancePDF(trialBalance, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });

  test("should handle long descriptions", () => {
    const longGL: GeneralLedger = {
      account: createMockAccount({ code: "1001", type: "asset" }),
      transactions: [
        {
          date: new Date(),
          entryNumber: "JE-0001",
          description:
            "This is a very long transaction description that might cause overflow issues in PDF rendering but should be handled gracefully by the autoTable truncation",
          debit: 1000,
          credit: 0,
          balance: 1000,
        },
      ],
      openingBalance: 0,
      closingBalance: 1000,
    };

    expect(() => {
      const pdf = new GeneralLedgerPDF(longGL, createMockConfig());
      pdf.generate();
    }).not.toThrow();
  });
});
