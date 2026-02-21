# OMB Accounting - Reports Developer Guide

## Overview

This guide provides technical documentation for developers working with the Reports module. It covers architecture, data structures, API usage, and extension points.

---

## Architecture Overview

### Components

```
src/
├── app/(dashboard)/reports/
│   └── page.tsx                    # Main reports page
├── components/
│   └── reports/
│       ├── DateRangePicker.tsx     # Date range component
│       ├── PnLStatement.tsx        # P&L statement component
│       ├── BalanceSheet.tsx        # Balance sheet component
│       ├── TrialBalance.tsx        # Trial balance component
│       ├── GeneralLedger.tsx       # General ledger component
│       └── CashFlowStatement.tsx   # Cash flow statement component
├── contexts/
│   └── ReportContext.tsx           # Report state management
├── lib/
│   └── report-generator.ts         # Report generation logic
├── types/
│   └── report.ts                   # TypeScript type definitions
└── __tests__/
    ├── report-context.test.tsx     # Integration tests
    └── pdf-generator.test.tsx      # PDF generation tests
```

### Data Flow

```
User Input (Date Range) → ReportContext → Report Generator → UI Component → PDF Export
```

---

## Data Structures

### Report Types

#### 1. TrialBalance

```typescript
interface TrialBalance {
  accounts: {
    code: string;
    name: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  asOfDate: Date;
}
```

#### 2. BalanceSheet

```typescript
interface BalanceSheet {
  date: Date;
  currency: string;
  assets: {
    current: BalanceSheetSection;
    nonCurrent: BalanceSheetSection;
  };
  liabilities: {
    current: BalanceSheetSection;
    nonCurrent: BalanceSheetSection;
  };
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface BalanceSheetSection {
  name: string;
  total: number;
  items: {
    name: string;
    amount: number;
  }[];
}
```

#### 3. ProfitAndLoss

```typescript
interface ProfitAndLoss {
  startDate: Date;
  endDate: Date;
  currency: string;
  revenue: {
    total: number;
    items: {
      name: string;
      amount: number;
    }[];
  };
  expenses: {
    total: number;
    items: {
      name: string;
      amount: number;
    }[];
  };
  netIncome: number;
}
```

#### 4. GeneralLedger

```typescript
interface GeneralLedger {
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
```

#### 5. CashFlowStatement

```typescript
interface CashFlowStatement {
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
```

### ReportFilters

```typescript
interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  // Additional filters can be added here
}
```

---

## ReportContext API

### Context Provider

The `ReportContext` provides state management and report generation functions.

```typescript
const {
  accounts,
  journalEntries,
  transactions,
  generateTrialBalance,
  generateBalanceSheet,
  generateProfitAndLoss,
  generateGeneralLedgers,
  generateCashFlowStatement,
  filters,
  setFilters,
  loading,
} = useReport();
```

### Report Generation Functions

#### generateTrialBalance()

```typescript
generateTrialBalance: () => TrialBalance;
```

**Parameters**: None
**Returns**: TrialBalance object
**Description**: Generates trial balance for current date

#### generateBalanceSheet()

```typescript
generateBalanceSheet: (asOfDate?: Date) => BalanceSheet;
```

**Parameters**:

- `asOfDate` (optional): Date to generate balance sheet for

**Returns**: BalanceSheet object
**Description**: Generates balance sheet for specified date

#### generateProfitAndLoss()

```typescript
generateProfitAndLoss: (startDate: Date, endDate: Date) => ProfitAndLoss;
```

**Parameters**:

- `startDate`: Start date for period
- `endDate`: End date for period

**Returns**: ProfitAndLoss object
**Description**: Generates P&L statement for specified period

#### generateGeneralLedgers()

```typescript
generateGeneralLedgers: (startDate?: Date, endDate?: Date) => GeneralLedger[];
```

**Parameters**:

- `startDate` (optional): Start date for period
- `endDate` (optional): End date for period

**Returns**: GeneralLedger array
**Description**: Generates general ledger for all accounts in date range

#### generateCashFlowStatement()

```typescript
generateCashFlowStatement: (startDate: Date, endDate: Date) =>
  CashFlowStatement;
```

**Parameters**:

- `startDate`: Start date for period
- `endDate`: End date for period

**Returns**: CashFlowStatement object
**Description**: Generates cash flow statement for specified period

---

## Report Generator Functions

### generateTrialBalance()

Located in: `src/lib/report-generator.ts`

```typescript
export function generateTrialBalance(
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate?: Date,
): TrialBalance;
```

**Algorithm**:

1. Filter journal entries by as-of date
2. Calculate balances for each account
3. Group by account type (assets, liabilities, equity, revenue, expenses)
4. Sum debits and credits
5. Return trial balance structure

**Example**:

```typescript
const trialBalance = generateTrialBalance(
  accounts,
  journalEntries,
  new Date("2026-02-15"),
);
```

---

### generateBalanceSheet()

Located in: `src/lib/report-generator.ts`

```typescript
export function generateBalanceSheet(
  accounts: Account[],
  journalEntries: JournalEntry[],
  asOfDate: Date,
): BalanceSheet;
```

**Algorithm**:

1. Filter journal entries by as-of date
2. Calculate account balances
3. Group accounts by category (current/non-current)
4. Calculate totals for each section
5. Verify: Total Assets = Total Liabilities + Total Equity

**Example**:

```typescript
const balanceSheet = generateBalanceSheet(
  accounts,
  journalEntries,
  new Date("2026-02-15"),
);
```

---

### generateProfitAndLoss()

Located in: `src/lib/report-generator.ts`

```typescript
export function generateProfitAndLoss(
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate: Date,
  endDate: Date,
): ProfitAndLoss;
```

**Algorithm**:

1. Filter journal entries by date range
2. Separate accounts by type (revenue vs. expenses)
3. Sum revenue and expenses
4. Calculate net income
5. Return P&L structure

**Example**:

```typescript
const pnl = generateProfitAndLoss(
  accounts,
  journalEntries,
  new Date("2026-02-01"),
  new Date("2026-02-28"),
);
```

---

### generateAllGeneralLedgers()

Located in: `src/lib/report-generator.ts`

```typescript
export function generateAllGeneralLedgers(
  accounts: Account[],
  journalEntries: JournalEntry[],
  filters?: {
    startDate?: Date;
    endDate?: Date;
  },
): GeneralLedger[];
```

**Algorithm**:

1. Filter journal entries by date range if provided
2. Generate ledger for each account
3. Calculate running balances
4. Return array of ledgers

**Example**:

```typescript
const ledgers = generateAllGeneralLedgers(accounts, journalEntries, {
  startDate: new Date("2026-02-01"),
  endDate: new Date("2026-02-28"),
});
```

---

### generateCashFlowStatement()

Located in: `src/lib/report-generator.ts`

```typescript
export function generateCashFlowStatement(
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate: Date,
  endDate: Date,
): CashFlowStatement;
```

**Algorithm (Indirect Method)**:

1. Filter journal entries by date range
2. Calculate account balances
3. **Operating Activities**:
   - Net income (from P&L calculation)
   - Add back depreciation
   - Adjust for working capital changes (receivables, payables, inventory)
4. **Investing Activities**:
   - Fixed asset purchases/sales
5. **Financing Activities**:
   - Debt proceeds/repayments
   - Equity distributions
6. Calculate net change and ending balance

**Example**:

```typescript
const cashFlow = generateCashFlowStatement(
  accounts,
  journalEntries,
  new Date("2026-02-01"),
  new Date("2026-02-28"),
);
```

---

## Adding a New Report Type

### Step 1: Define the Type

Add the new interface to `src/types/report.ts`:

```typescript
export interface MyNewReport {
  startDate: Date;
  endDate: Date;
  currency: string;
  data: {
    items: {
      name: string;
      amount: number;
    }[];
    total: number;
  };
}
```

### Step 2: Implement the Generator

Add the function to `src/lib/report-generator.ts`:

```typescript
export function generateMyNewReport(
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate: Date,
  endDate: Date,
): MyNewReport {
  // Filter entries
  const filteredEntries = journalEntries.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate,
  );

  // Calculate data
  const data = {
    items: filteredEntries.map((entry) => ({
      name: entry.description,
      amount: entry.entries.reduce(
        (sum, line) => sum + line.credit - line.debit,
        0,
      ),
    })),
    total: filteredEntries.reduce((sum, entry) => {
      return (
        sum + entry.entries.reduce((s, line) => s + line.credit - line.debit, 0)
      );
    }, 0),
  };

  return {
    startDate,
    endDate,
    currency: "CNY",
    data,
  };
}
```

### Step 3: Add to ReportContext

Update `src/contexts/ReportContext.tsx`:

```typescript
// Import
import { MyNewReport } from "@/types/report";
import { generateMyNewReport } from "@/lib/report-generator";

// Add to context
const myNewReport = useMemo(
  () => generateMyNewReport(accounts, journalEntries, new Date(startDate), new Date(endDate)),
  [accounts, journalEntries, startDate, endDate],
);

// Return in value
return (
  <ReportContext.Provider value={{
    // ... existing values
    generateMyNewReport,
    myNewReport,
  }}>
    {children}
  </ReportContext.Provider>
);
```

### Step 4: Add UI Component

Create `src/components/reports/MyNewReport.tsx`:

```typescript
export function MyNewReport() {
  const { myNewReport, loading } = useReport();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My New Report</CardTitle>
        <CardDescription>
          {new Date(myNewReport.startDate).toLocaleDateString("zh-CN")} to{" "}
          {new Date(myNewReport.endDate).toLocaleDateString("zh-CN")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Render report data */}
      </CardContent>
    </Card>
  );
}
```

### Step 5: Add to Reports Page

Update `src/app/(dashboard)/reports/page.tsx`:

```typescript
// Import
import { MyNewReport } from "@/components/reports/MyNewReport";

// Add to tabs
<TabsTrigger value="my-new-report">
  My New Report
</TabsTrigger>

// Add to content
<TabsContent value="my-new-report">
  <MyNewReport />
</TabsContent>
```

### Step 6: Add Export Function

Add export function to `src/app/(dashboard)/reports/page.tsx`:

```typescript
const handleExportMyNewReport = () => {
  const pdf = new jsPDF();
  // Add content
  // Save PDF
};
```

---

## Extending Chart of Accounts

### Account Categories

Accounts are categorized for automatic grouping in reports:

- **assets**: Cash, Accounts Receivable, Inventory, Fixed Assets
- **liabilities**: Accounts Payable, Short-term Debt, Long-term Debt
- **equity**: Owner's Equity, Retained Earnings
- **revenue**: Sales, Service Revenue
- **expenses**: COGS, Operating Expenses, Depreciation

### Adding Accounts

Accounts are managed in the Settings module. When adding an account:

1. **Code**: Unique identifier (e.g., "1001")
2. **Name**: Descriptive name (e.g., "Cash")
3. **Type**: Account type (Asset, Liability, Equity, Revenue, Expense)
4. **Category**: Account category (for grouping)

---

## PDF Generation

### Using jsPDF

All reports support PDF export using jsPDF:

```typescript
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});

// Add content
pdf.setFontSize(16);
pdf.text("Report Title", 20, 25);

// Add table
autoTable(pdf, {
  startY: 35,
  head: [["Column 1", "Column 2", "Column 3"]],
  body: data,
  theme: "grid",
});
```

### Styling

Use color coding for different sections:

- **Green**: Operating activities
- **Blue**: Investing activities
- **Purple**: Financing activities
- **Gray**: Summary totals

---

## Testing

### Unit Tests

Test individual report generators:

```typescript
import { generateTrialBalance } from "@/lib/report-generator";
import { accounts, journalEntries } from "@/lib/test-data";

test("generateTrialBalance returns correct structure", () => {
  const result = generateTrialBalance(accounts, journalEntries);
  expect(result).toHaveProperty("accounts");
  expect(result).toHaveProperty("totalDebit");
  expect(result).toHaveProperty("totalCredit");
});
```

### Integration Tests

Test the full report generation workflow:

```typescript
import { ReportContext } from "@/contexts/ReportContext";

test("ReportContext generates reports correctly", () => {
  const { result } = renderHook(() => useReport());
  const trialBalance = result.current.generateTrialBalance();
  expect(trialBalance).toBeDefined();
});
```

---

## Performance Considerations

### Memoization

Use `useMemo` to avoid recalculations:

```typescript
const report = useMemo(
  () => generateReport(accounts, journalEntries, startDate, endDate),
  [accounts, journalEntries, startDate, endDate],
);
```

### Pagination

For large datasets, implement pagination:

```typescript
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 50;
const paginatedData = data.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize,
);
```

### Lazy Loading

Load report data on-demand:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleGenerate = async () => {
  setIsLoading(true);
  try {
    const report = await generateReport(...);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Best Practices

### 1. Always Filter by Date Range

When generating reports, always filter by date range to ensure accuracy:

```typescript
const filteredEntries = journalEntries.filter(
  (entry) => entry.date >= startDate && entry.date <= endDate,
);
```

### 2. Use TypeScript Types

Always use TypeScript types for parameters and return values:

```typescript
export function generateReport(
  accounts: Account[],
  journalEntries: JournalEntry[],
  startDate: Date,
  endDate: Date,
): ReportType;
```

### 3. Handle Loading States

Always show loading states during report generation:

```typescript
if (loading) {
  return <LoadingSpinner />;
}
```

### 4. Validate Inputs

Validate date ranges before generating reports:

```typescript
if (startDate > endDate) {
  throw new Error("Start date must be before end date");
}
```

### 5. Test Edge Cases

Test with empty data, single entries, and boundary dates:

```typescript
test("handles empty data", () => {
  const result = generateReport([], [], new Date(), new Date());
  expect(result).toBeDefined();
});
```

---

## Troubleshooting

### Reports Not Generating

**Check**:

1. Are accounts and journal entries loaded?
2. Is the date range valid?
3. Are there any console errors?

### PDF Export Failing

**Check**:

1. Is jsPDF imported correctly?
2. Are all required dependencies installed?
3. Is the PDF object created successfully?

### Performance Issues

**Check**:

1. Are you filtering data efficiently?
2. Are you using memoization?
3. Is the dataset too large?

---

## Resources

- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **jsPDF Documentation**: https://github.com/parallax/jsPDF
- **React Hooks**: https://react.dev/reference/react

---

_Last Updated: February 2026_
_Version: 1.0_
