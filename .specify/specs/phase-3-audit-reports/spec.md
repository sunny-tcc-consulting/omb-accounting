# Phase 3: Audit Reports Module - Specification

**Feature**: Financial Audit Reports for Annual Accounting
**Version**: 1.0
**Date**: 2026-02-21
**Status**: Draft

---

## Executive Summary

The Audit Reports Module is the **core value proposition** of the OMB Accounting System. This module provides accountants and business owners with essential financial documents required for annual audits, tax filings, and financial analysis. The module generates four fundamental financial statements directly from transaction data:

1. **Trial Balance** - Verifies debits equal credits
2. **Balance Sheet** - Shows financial position at a point in time
3. **Profit & Loss Statement** - Shows performance over a period
4. **General Ledger** - Detailed transaction history per account

These reports are critical for:

- Annual audit preparation
- Tax filing compliance
- Financial decision making
- Investor/stakeholder reporting
- Regulatory compliance

---

## 1. Trial Balance

### Purpose

The Trial Balance verifies that the total debits equal total credits in the accounting system. It's the foundational report for catching errors before preparing financial statements.

### User Stories

**As an accountant**, I want to:

- View a list of all account balances with debit/credit amounts
- See account codes, names, and current balances
- Verify that debits equal credits (balanced status)
- Export to CSV for further analysis
- Print a physical copy for audit documentation
- Filter by date range

### Functional Requirements

#### TRB-001: Account Balance Display

- Display all active accounts from Chart of Accounts
- Show account code (e.g., 1001, 2001)
- Show account name
- Show debit balance (if any)
- Show credit balance (if any)
- Show balance type (Debit, Credit, Zero)

#### TRB-002: Totals Calculation

- Calculate total debits across all accounts
- Calculate total credits across all accounts
- Show difference (should be zero if balanced)
- Display balance status: "Balanced" (✓) or "Unbalanced" (✗)

#### TRB-003: Filtering

- Filter by account category (Assets, Liabilities, Equity, Revenue, Expenses)
- Filter by balance type (Has Debit, Has Credit, Zero)
- Date range filter (as of specific date)

#### TRB-004: Export Options

- Export to CSV with columns: Account Code, Name, Debit, Credit
- Print-friendly layout

### Acceptance Criteria

- [ ] All accounts from Chart of Accounts are displayed
- [ ] Debit total equals Credit total (when system is balanced)
- [ ] Balance status indicator shows correctly
- [ ] CSV export works correctly
- [ ] Print layout is professional

---

## 2. Balance Sheet

### Purpose

The Balance Sheet provides a snapshot of the company's financial position at a specific point in time, showing Assets = Liabilities + Equity.

### User Stories

**As a business owner**, I want to:

- See a professional Balance Sheet as of a specific date
- Understand my company's assets, liabilities, and equity
- Show this document to my accountant for annual audit
- Export to PDF/Excel for tax filing
- Compare with previous periods (future)

### Functional Requirements

#### BS-001: Assets Section

**Current Assets (≤ 12 months)**

- 1001 Cash and Cash Equivalents
- 1002 Bank Accounts
- 1101 Accounts Receivable
- 1201 Inventory
- 1301 Prepaid Expenses

**Non-Current Assets (> 12 months)**

- 1401 Fixed Assets
- 1410 Accumulated Depreciation

#### BS-002: Liabilities Section

**Current Liabilities**

- 2001 Accounts Payable
- 2101 Accrued Expenses
- 2110 Accrued Wages
- 2201 Short-term Debt
- 2301 Sales Tax Payable

**Long-term Liabilities**

- 2401 Long-term Debt

#### BS-003: Equity Section

- 3001 Owner's Capital
- 3010 Owner's Drawings
- 3100 Retained Earnings
- 3200 Common Stock (if applicable)

#### BS-004: Calculations

- Total Current Assets = sum of all current asset accounts
- Total Non-Current Assets = sum of all non-current asset accounts
- Total Assets = Current + Non-Current
- Total Current Liabilities = sum of all current liability accounts
- Total Liabilities = Current + Long-term
- Total Equity = sum of all equity accounts
- **Balance Check**: Assets must equal Liabilities + Equity

#### BS-005: Date Selection

- Select "as of" date for the snapshot
- Default to today's date
- Include transactions up to and including selected date

#### BS-006: Export Options

- Export to CSV/Excel
- Print format optimized for PDF

### Acceptance Criteria

- [ ] Assets section correctly organized (Current vs Non-Current)
- [ ] Liabilities section correctly organized (Current vs Long-term)
- [ ] Equity section shows all equity accounts
- [ ] Balance equation: Assets = Liabilities + Equity
- [ ] Date selection works correctly
- [ ] Export to CSV works

---

## 3. Profit & Loss Statement (Income Statement)

### Purpose

The P&L Statement shows the company's financial performance over a specific period, including revenue, expenses, and net income/loss.

### User Stories

**As a business owner**, I want to:

- See how much profit/loss my business made this month/year
- Understand my revenue sources and expense categories
- Calculate my taxable income for tax purposes
- Compare with previous periods (future)
- Export for my accountant

### Functional Requirements

#### P&L-001: Revenue Section

**Operating Revenue**

- 4001 Sales (Product Revenue)
- 4002 Services (Service Revenue)

**Other Income**

- 4101 Interest Income
- 4200 Other Income

#### P&L-002: Cost of Goods Sold (COGS)

- 5001 Cost of Goods Sold
- 5002 Direct Labor (if applicable)
- 5003 Shipping/Freight (if applicable)

#### P&L-003: Gross Profit Calculation

- Gross Profit = Revenue - COGS

#### P&L-004: Operating Expenses

**Selling Expenses**

- 5101 Advertising/Promotion
- 5105 Sales Commissions

**General & Administrative**

- 5201 Office Supplies
- 5205 Rent Expense
- 5210 Utilities
- 5220 Salaries & Wages
- 5230 Employee Benefits
- 5240 Insurance Expense
- 5250 Professional Fees
- 5260 Travel & Entertainment
- 5300 Depreciation Expense

#### P&L-005: Other Expenses

- 5400 Interest Expense
- 5500 Tax Expense

#### P&L-006: Calculations

- Total Revenue = Operating + Other Income
- Gross Profit = Revenue - COGS
- Total Operating Expenses = sum of expense accounts
- Operating Income = Gross Profit - Operating Expenses
- Other Income/Expenses = Interest + Other - Interest Expense
- **Net Income** = Operating Income + Other - Tax Expense

#### P&L-007: Period Selection

- Select start and end dates
- Default to current month
- Include transactions within date range

#### P&L-008: Tax Calculation

- Default tax rate: 25% (configurable in settings)
- Calculated tax shown separately

### Acceptance Criteria

- [ ] Revenue section shows all revenue accounts
- [ ] COGS section shows cost accounts
- [ ] Gross Profit calculated correctly
- [ ] Operating Expenses broken down logically
- [ ] Net Income calculated correctly
- [ ] Date range filter works
- [ ] Export to CSV works

---

## 4. General Ledger

### Purpose

The General Ledger provides detailed transaction history for each account, showing every debit and credit that affected the account balance.

### User Stories

**As an accountant**, I want to:

- See all transactions for a specific account
- Track the running balance of an account
- Understand the source of each transaction
- Print a complete audit trail for specific accounts
- Export transaction details for further analysis

### Functional Requirements

#### GL-001: Account Selection

- Dropdown to select account from Chart of Accounts
- Show account name and code when selected
- Show current balance for selected account

#### GL-002: Transaction List

For each transaction:

- Transaction Date
- Entry Number (auto-incrementing)
- Description/Reference
- Debit Amount (if debit)
- Credit Amount (if credit)
- Running Balance after transaction

#### GL-003: Sorting & Filtering

- Sort by date (ascending/descending)
- Filter by date range
- Filter by transaction type (Debit/Credit)
- Search by description or entry number

#### GL-004: Account Summary

- Show account code and name
- Show account type (Asset, Liability, etc.)
- Show opening balance (as of filter start date)
- Show total debits for period
- Show total credits for period
- Show closing balance

#### GL-005: Export Options

- Export transactions to CSV
- Include all columns: Date, Entry#, Description, Debit, Credit, Balance
- Print format for physical records

### Acceptance Criteria

- [ ] Account selection works correctly
- [ ] All transactions for account are displayed
- [ ] Running balance updates correctly
- [ ] Account summary is accurate
- [ ] Export to CSV works

---

## Non-Functional Requirements

### Performance

- Report generation: < 2 seconds for up to 1,000 transactions
- Report generation: < 5 seconds for up to 10,000 transactions
- Pagination for large transaction lists

### Security

- Access control: Only authenticated users can view reports
- No sensitive data exposure in logs
- Input validation on all filters

### Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly tables
- High contrast mode support

### Internationalization

- Currency format: CNY (¥) by default
- Date format: YYYY-MM-DD
- Number formatting with thousand separators

---

## Dependencies

### Data Dependencies

- **Chart of Accounts** - Must have accounts with proper categories
- **Transactions** - Must have journal entries linked to accounts
- **Account Balances** - Must be calculated from transactions

### Technical Dependencies

- ReportContext.tsx - Centralized report data
- report-generator.ts - Report calculation logic
- Transaction model - Must have date, amount, account, type

### Future Enhancements (Out of Scope for Phase 3)

- Multi-currency support
- Comparative reports (previous period)
- Budget vs actual comparison
- Cash flow statement
- Custom report builder
- Scheduled report generation
- Email reports to accountants
- PDF export
- Dashboard charts for reports

---

## Success Metrics

| Metric                               | Target      |
| ------------------------------------ | ----------- |
| Report generation time               | < 2 seconds |
| CSV export time                      | < 1 second  |
| User satisfaction (audit readiness)  | 100%        |
| Data accuracy (balance verification) | 100%        |

---

## Appendix A: Chart of Accounts Reference

### Assets (1000-1999)

| Code | Name                     | Type              |
| ---- | ------------------------ | ----------------- |
| 1001 | Cash                     | Current Asset     |
| 1002 | Bank Account             | Current Asset     |
| 1101 | Accounts Receivable      | Current Asset     |
| 1201 | Inventory                | Current Asset     |
| 1301 | Prepaid Expenses         | Current Asset     |
| 1401 | Fixed Assets             | Non-Current Asset |
| 1410 | Accumulated Depreciation | Contra Asset      |

### Liabilities (2000-2999)

| Code | Name              | Type                |
| ---- | ----------------- | ------------------- |
| 2001 | Accounts Payable  | Current Liability   |
| 2101 | Accrued Expenses  | Current Liability   |
| 2110 | Accrued Wages     | Current Liability   |
| 2201 | Short-term Debt   | Current Liability   |
| 2301 | Sales Tax Payable | Current Liability   |
| 2401 | Long-term Debt    | Long-term Liability |

### Equity (3000-3999)

| Code | Name              | Type   |
| ---- | ----------------- | ------ |
| 3001 | Owner's Capital   | Equity |
| 3010 | Owner's Drawings  | Equity |
| 3100 | Retained Earnings | Equity |
| 3200 | Common Stock      | Equity |

### Revenue (4000-4999)

| Code | Name            | Type    |
| ---- | --------------- | ------- |
| 4001 | Sales           | Revenue |
| 4002 | Services        | Revenue |
| 4101 | Interest Income | Revenue |
| 4200 | Other Income    | Revenue |

### Expenses (5000-5999)

| Code | Name                   | Type    |
| ---- | ---------------------- | ------- |
| 5001 | Cost of Goods Sold     | COGS    |
| 5101 | Advertising            | Expense |
| 5201 | Office Supplies        | Expense |
| 5205 | Rent Expense           | Expense |
| 5210 | Utilities              | Expense |
| 5220 | Salaries & Wages       | Expense |
| 5230 | Employee Benefits      | Expense |
| 5240 | Insurance              | Expense |
| 5250 | Professional Fees      | Expense |
| 5260 | Travel & Entertainment | Expense |
| 5300 | Depreciation           | Expense |
| 5400 | Interest Expense       | Expense |
| 5500 | Tax Expense            | Expense |

---

## Appendix B: Sample Data Flow

### For Trial Balance (End of Year)

1. User selects "As of 2025-12-31"
2. System filters all transactions up to that date
3. For each account, calculates: Sum of Debits - Sum of Credits
4. Displays account balances
5. Calculates total debits and credits
6. Verifies balance (should be 0 difference)

### For Profit & Loss (Full Year)

1. User selects date range: "2025-01-01" to "2025-12-31"
2. System filters transactions within range
3. For each account:
   - If Revenue: Add to revenue total
   - If Expense: Add to expense total
   - If COGS: Add to COGS total
4. Calculate:
   - Gross Profit = Revenue - COGS
   - Operating Expenses = Sum of all expense accounts
   - Operating Income = Gross Profit - Operating Expenses
   - Net Income = Operating Income - Tax (25%)

---

_End of Specification_
