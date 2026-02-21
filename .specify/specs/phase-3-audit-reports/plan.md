# Phase 3: Audit Reports Module - Technical Plan

**Feature**: Financial Audit Reports for Annual Accounting
**Version**: 1.0
**Date**: 2026-02-21
**Status**: Draft

---

## Architecture Overview

The Audit Reports Module extends the existing OMB Accounting architecture with:

```
┌─────────────────────────────────────────────────────────────┐
│                    Reports Page                              │
│         /app/(dashboard)/reports/page.tsx                    │
│                    (React Component)                         │
├─────────────────────────────────────────────────────────────┤
│                      Report Tabs                             │
│    TrialBalance | BalanceSheet | ProfitLoss | GeneralLedger │
├─────────────────────────────────────────────────────────────┤
│                    ReportContext                             │
│              /contexts/ReportContext.tsx                     │
│     (Provides: Accounts, Transactions, Calculations)         │
├─────────────────────────────────────────────────────────────┤
│                  Report Generator                            │
│              /lib/report-generator.ts                        │
│     (Business Logic for Each Report Type)                    │
├─────────────────────────────────────────────────────────────┤
│                    Data Sources                              │
│  InvoiceContext │ QuotationContext │ Transaction Records    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context (ReportContext)
- **Date Handling**: date-fns (for date calculations)
- **CSV Export**: Native JS (Blob + URL.createObjectURL)
- **Print**: CSS `@media print` styles

---

## Data Models

### 1. Account Type (from src/types/report.ts)

```typescript
type AccountCategory = "asset" | "liability" | "equity" | "revenue" | "expense";

interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  type: "debit" | "credit"; // Normal balance direction
  balance: number; // Current balance
}
```

### 2. JournalEntry Type

```typescript
interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  referenceType?: "invoice" | "quotation" | "manual";
  referenceId?: string;
}
```

### 3. Report Types

```typescript
interface TrialBalance {
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

interface TrialBalanceAccount {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balanceType: "debit" | "credit" | "zero";
}

interface BalanceSheet {
  asOfDate: string;
  currentAssets: ReportLineItem[];
  nonCurrentAssets: ReportLineItem[];
  currentLiabilities: ReportLineItem[];
  longTermLiabilities: ReportLineItem[];
  equity: ReportLineItem[];
  totals: {
    totalCurrentAssets: number;
    totalNonCurrentAssets: number;
    totalAssets: number;
    totalCurrentLiabilities: number;
    totalLiabilities: number;
    totalEquity: number;
    isBalanced: boolean;
  };
}

interface ProfitAndLoss {
  startDate: string;
  endDate: string;
  revenue: ReportLineItem[];
  cogs: ReportLineItem[];
  expenses: ReportLineItem[];
  totals: {
    totalRevenue: number;
    grossProfit: number;
    totalExpenses: number;
    operatingIncome: number;
    netIncome: number;
  };
}

interface GeneralLedger {
  account: Account;
  transactions: GeneralLedgerTransaction[];
  summary: {
    openingBalance: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
  };
}

interface GeneralLedgerTransaction {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}
```

---

## API Endpoints

No new API endpoints required. Reports are generated client-side from:

- Local context data (ReportContext)
- Cached transaction data
- Chart of Accounts configuration

**Rationale**: Reports are snapshot views of existing data. Client-side generation reduces server load and enables real-time updates.

---

## Component Structure

### Reports Page (`/reports/page.tsx`)

```
ReportsPage
├── ReportTabs (Tab navigation)
├── TrialBalancePanel
│   └── TrialBalanceTable
├── BalanceSheetPanel
│   ├── AssetsSection
│   ├── LiabilitiesSection
│   └── EquitySection
├── ProfitLossPanel
│   ├── RevenueSection
│   ├── COGSSection
│   └── ExpensesSection
├── GeneralLedgerPanel
│   ├── AccountSelector
│   ├── AccountSummary
│   └── TransactionTable
└── DateRangePicker (for P&L, GL)
```

### Report Components (new)

- `TrialBalanceTable.tsx` - Debit/Credit table with totals
- `BalanceSheetDisplay.tsx` - Assets = Liabilities + Equity layout
- `ProfitLossDisplay.tsx` - Revenue minus Expenses layout
- `GeneralLedgerDisplay.tsx` - Transaction history with running balance
- `ReportExportButton.tsx` - CSV export and Print buttons

---

## Implementation Tasks

### Phase 3.1: Foundation (Completed ✓)

- [x] Create `src/types/report.ts`
- [x] Create `src/lib/report-generator.ts` with Chart of Accounts
- [x] Create `src/contexts/ReportContext.tsx`
- [x] Create `/reports/page.tsx` with 4 tabs

### Phase 3.2: Enhancements (Future)

- [ ] Add PDF export capability (jsPDF)
- [ ] Add comparative reports (previous period)
- [ ] Add budget vs actual comparison
- [ ] Add cash flow statement
- [ ] Add custom date range for all reports
- [ ] Add multi-currency support

### Phase 3.3: Testing & Documentation

- [ ] Write unit tests for report calculations
- [ ] Write integration tests for report generation
- [ ] Create user documentation
- [ ] Create API documentation (if needed)

---

## State Management

### ReportContext Interface

```typescript
interface ReportContextType {
  // Data
  accounts: Account[];
  journalEntries: JournalEntry[];

  // Report Generation Functions
  generateTrialBalance: (asOfDate: string) => TrialBalance;
  generateBalanceSheet: (asOfDate: string) => BalanceSheet;
  generateProfitAndLoss: (startDate: string, endDate: string) => ProfitAndLoss;
  generateGeneralLedger: (
    accountId: string,
    startDate?: string,
    endDate?: string,
  ) => GeneralLedger;

  // Export Functions
  exportToCSV: (reportType: string, data: any) => void;
  printReport: (reportType: string) => void;
}
```

---

## Performance Considerations

### Optimizations

1. **Memoization**: Use `useMemo` for expensive calculations
2. **Lazy Loading**: Load report data only when tab is selected
3. **Pagination**: Paginate large transaction lists (> 100 items)
4. **Caching**: Cache report results for 5 minutes

### Bundle Size

- Report components: ~15KB gzipped
- Chart of Accounts: ~5KB
- Report utilities: ~10KB
- Total: ~30KB additional gzipped

---

## Security Considerations

### Data Access

- All report routes require authentication (via Navigation)
- No sensitive data exposed in URLs
- CSV export only includes permitted fields

### Input Validation

- Date format validation (YYYY-MM-DD)
- Account ID validation (must exist in Chart of Accounts)
- Amount validation (no negative values for export)

---

## Accessibility

### WCAG 2.1 AA Compliance

- [ ] Tables have proper headers (`<th>`)
- [ ] Focus indicators on all interactive elements
- [ ] ARIA labels for custom components
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation for all report filters

### Screen Reader Support

- [ ] `role="table"` for report tables
- [ ] `aria-label` for non-text buttons
- [ ] Live region for "Loading..." states

---

## Internationalization

### Supported Formats

| Setting  | Format          | Example    |
| -------- | --------------- | ---------- |
| Currency | CNY (¥)         | ¥94,492.97 |
| Date     | YYYY-MM-DD      | 2025-12-31 |
| Number   | Comma separator | 94,492.97  |

### Future i18n Support

- Configurable currency symbol
- Configurable date format
- Language translation support

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// report-generator.test.ts
describe("Trial Balance Generation", () => {
  it("calculates correct total debits", () => {});
  it("calculates correct total credits", () => {});
  it("identifies balanced state", () => {});
});

describe("Balance Sheet", () => {
  it("calculates total assets correctly", () => {});
  it("verifies assets = liabilities + equity", () => {});
});

describe("Profit & Loss", () => {
  it("calculates gross profit", () => {});
  it("calculates net income", () => {});
});
```

### Integration Tests

- Report generation with mock data
- CSV export with large datasets
- Print functionality

### E2E Tests

- Full report generation workflow
- Tab navigation
- Export workflow

---

## Deployment

### Build Output

- New route: `/reports` (dynamic)
- No breaking changes to existing routes
- Backward compatible with existing data

### Rollback Plan

- Git revert to previous commit
- Previous reports implementation removed
- No database migrations needed

---

## Known Limitations

1. **Single Currency**: Only CNY supported in Phase 3
2. **No Comparative Reports**: Previous period comparison out of scope
3. **No Budget Comparison**: Budget tracking not implemented
4. **No Scheduled Reports**: Manual export required
5. **No Email Reports**: Must download and attach manually

---

## Future Enhancements (Roadmap)

### Phase 3.5 (Optional)

- [ ] PDF Export with professional formatting
- [ ] Custom report templates
- [ ] Report scheduling and email delivery
- [ ] Multi-company support

### Phase 4.0 (Future)

- [ ] Cash Flow Statement
- [ ] Budget vs Actual Comparison
- [ ] Dashboard Charts for Reports
- [ ] Data Export for Tax Filing
- [ ] Auditor Access Mode (read-only)

---

## Appendix: File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── reports/
│           ├── page.tsx              # Main reports page
│           ├── loading.tsx           # Loading skeleton
│           └── layout.tsx            # Reports layout
├── components/
│   └── reports/                      # NEW
│       ├── TrialBalanceTable.tsx
│       ├── BalanceSheetDisplay.tsx
│       ├── ProfitLossDisplay.tsx
│       ├── GeneralLedgerDisplay.tsx
│       ├── ReportExportButton.tsx
│       └── DateRangePicker.tsx
├── contexts/
│   └── ReportContext.tsx             # Existing (Phase 3.1)
├── lib/
│   └── report-generator.ts           # Existing (Phase 3.1)
├── types/
│   └── report.ts                     # Existing (Phase 3.1)
└── __tests__/
    └── reports/                      # NEW
        ├── trial-balance.test.tsx
        ├── balance-sheet.test.tsx
        ├── profit-loss.test.tsx
        └── general-ledger.test.tsx
```

---

_End of Technical Plan_
