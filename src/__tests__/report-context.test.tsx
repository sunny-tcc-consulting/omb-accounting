import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportProvider, useReport } from "@/contexts/ReportContext";

// Mock the report-generator to avoid complex calculations in tests
jest.mock("@/lib/report-generator", () => ({
  DEFAULT_CHART_OF_ACCOUNTS: [
    {
      code: "1001",
      name: "Cash",
      type: "asset",
      category: "current_assets",
      isSubAccount: false,
    },
    {
      code: "2001",
      name: "Accounts Payable",
      type: "liability",
      category: "current_liabilities",
      isSubAccount: false,
    },
    {
      code: "4001",
      name: "Sales Revenue",
      type: "revenue",
      category: "operating_revenue",
      isSubAccount: false,
    },
  ],
  generateJournalEntries: jest.fn(),
  generateTrialBalance: jest.fn(() => ({
    accounts: [],
    totals: { totalDebit: 0, totalCredit: 0, isBalanced: true },
  })),
  generateBalanceSheet: jest.fn(() => ({
    assets: { currentAssets: [], totalAssets: 0 },
    liabilities: { currentLiabilities: [], totalLiabilities: 0 },
    equity: { items: [], totalEquity: 0 },
    totalLiabilitiesAndEquity: 0,
    isBalanced: true,
  })),
  generateProfitAndLoss: jest.fn(() => ({
    revenue: { items: [], total: 0 },
    costOfGoodsSold: { items: [], total: 0 },
    grossProfit: 0,
    operatingExpenses: { items: [], total: 0 },
    operatingIncome: 0,
    netIncome: 0,
  })),
  generateAllGeneralLedgers: jest.fn(() => []),
}));

jest.mock("@/lib/mock-data", () => ({
  generateTransactions: jest.fn(() => []),
}));

// Test component to access context
function TestReportComponent() {
  const context = useReport();
  if (!context) return <div>Error: Context not found</div>;
  const { accounts, generateTrialBalance } = context;
  return (
    <div>
      <h1>Report Integration Test</h1>
      <div data-testid="accounts-count">{accounts.length}</div>
      <button onClick={() => generateTrialBalance()} data-testid="generate-tb">
        Generate TB
      </button>
    </div>
  );
}

describe("ReportContext Integration Tests", () => {
  it("provides report context to children", () => {
    render(
      <ReportProvider>
        <TestReportComponent />
      </ReportProvider>,
    );
    expect(screen.getByText("Report Integration Test")).toBeInTheDocument();
  });

  it("initializes with default chart of accounts", () => {
    render(
      <ReportProvider>
        <TestReportComponent />
      </ReportProvider>,
    );
    expect(screen.getByTestId("accounts-count").textContent).toBe("3");
  });

  it("throws error when useReport is used outside provider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestReportComponent />)).toThrow(
      "useReport must be used within a ReportProvider",
    );
    errorSpy.mockRestore();
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { generateTrialBalance } = require("@/lib/report-generator");
  it("generates trial balance on button click", () => {
    const { getByTestId } = render(
      <ReportProvider>
        <TestReportComponent />
      </ReportProvider>,
    );
    fireEvent.click(getByTestId("generate-tb"));
    expect(generateTrialBalance).toHaveBeenCalledTimes(1);
  });
});
