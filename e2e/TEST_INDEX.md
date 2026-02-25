# E2E Test Suite Index

## Overview

This document provides an index of all Playwright E2E test files for the omb-accounting system.

---

## 📁 Test Files Structure

```
omb-accounting/
├── e2e/
│   ├── video.spec.ts                      # Original: Basic page structure tests (4 tests)
│   ├── customer-management.spec.ts        # NEW: Customer CRUD operations (6 tests)
│   ├── quotation-workflow.spec.ts         # NEW: Quotation lifecycle (6 tests)
│   ├── invoice-workflow.spec.ts           # NEW: Invoice lifecycle (7 tests)
│   ├── bank-reconciliation.spec.ts        # NEW: Bank operations (7 tests)
│   └── BUSINESS_SCENARIOS.md              # Documentation: Full test plans
```

---

## 📊 Test Coverage Summary

| Test Suite              | File                          | Tests | Priority | Status         |
| ----------------------- | ----------------------------- | ----- | -------- | -------------- |
| **Basic Pages**         | `video.spec.ts`               | 4     | High     | ✅ Implemented |
| **Customer Management** | `customer-management.spec.ts` | 6     | High     | ✅ Implemented |
| **Quotation Workflow**  | `quotation-workflow.spec.ts`  | 6     | Critical | ✅ Implemented |
| **Invoice Workflow**    | `invoice-workflow.spec.ts`    | 7     | Critical | ✅ Implemented |
| **Bank Reconciliation** | `bank-reconciliation.spec.ts` | 7     | High     | ✅ Implemented |
| **Reports & Analytics** | TBD                           | 3+    | Medium   | 📋 Planned     |
| **User Management**     | TBD                           | 4+    | Medium   | 📋 Planned     |
| **Settings**            | TBD                           | 2+    | Low      | 📋 Planned     |

---

## 🧪 Running Tests

### Run All Tests

```bash
cd omb-accounting
npm test
```

### Run Specific Test Suite

```bash
# Run customer management tests
npx playwright test e2e/customer-management.spec.ts

# Run quotation workflow tests
npx playwright test e2e/quotation-workflow.spec.ts

# Run invoice workflow tests
npx playwright test e2e/invoice-workflow.spec.ts

# Run bank reconciliation tests
npx playwright test e2e/bank-reconciliation.spec.ts
```

### Run with Video Recording

```bash
npx playwright test --project=chromium-video
```

### Run Single Test

```bash
npx playwright test e2e/customer-management.spec.ts -t "TC-C001"
```

---

## 📈 Test Execution Order (Recommended)

| Order | Test Suite          | Estimated Time | Dependencies          |
| ----- | ------------------- | -------------- | --------------------- |
| 1     | Customer Management | ~2 min         | None                  |
| 2     | Quotation Workflow  | ~3 min         | Customers             |
| 3     | Invoice Workflow    | ~3 min         | Customers, Quotations |
| 4     | Bank Reconciliation | ~2 min         | None                  |
| 5     | Reports & Analytics | ~2 min         | Data exists           |
| 6     | User Management     | ~2 min         | Admin access          |
| 7     | Settings            | ~1 min         | None                  |

**Total Estimated Time**: ~15 minutes (full suite)

---

## 🎬 Video Recording Configuration

### Playwright Config (playwright.config.ts)

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    trace: "on-first-retry",
    video: {
      mode: "retain-on-failure",
      size: { width: 1280, height: 720 },
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-video",
      use: {
        ...devices["Desktop Chrome"],
        video: {
          mode: "on",
          size: { width: 1280, height: 720 },
        },
      },
    },
  ],
});
```

---

## 📋 Test Count Summary

| Category        | Test Count | Total Tests   |
| --------------- | ---------- | ------------- |
| **Implemented** | 5 suites   | **30 tests**  |
| **Planned**     | 3 suites   | ~15 tests     |
| **Total**       | 8 suites   | **~45 tests** |

---

## ✅ Test Features

### Common Helpers

- `randomDelay(page)`: Adds 1-3 second random delay for better video visibility
- Graceful handling of missing data (tests pass as no-op)
- Responsive locator strategies
- Async wait for page loads

### Assertions Used

- `expect().toBeVisible()`
- `expect().toContainText()`
- `expect().toHaveCount()`
- `expect().toBeTruthy()`

### Best Practices

- Each test has unique ID (TC-XXX)
- Priority assigned (Critical/High/Medium/Low)
- Preconditions clearly defined
- Step-by-step expected results documented

---

## 🚀 Running Video Tests for Documentation

### Generate Demo Videos

```bash
# Run all video tests
npx playwright test e2e/video.spec.ts --project=chromium-video

# Run specific business workflow video
npx playwright test e2e/business-scenarios.spec.ts -t "TC-Q001" --project=chromium-video
```

### Recommended Video Sequence

1. **customer-management-demo.mp4** - Full CRUD workflow
2. **quotation-workflow.mp4** - Create → View → Convert to Invoice
3. **invoice-lifecycle.mp4** - Create → Send → Mark as Paid
4. **bank-reconciliation.mp4** - Add Account → View Transactions → Reconcile
5. **complete-business-day.mp4** - All workflows combined

---

## 📝 Test Data Requirements

### Pre-requisites for Tests

| Entity        | Required For             | How to Create        |
| ------------- | ------------------------ | -------------------- |
| Customers     | Quotation, Invoice tests | Seed data or TC-C001 |
| Quotations    | Invoice conversion test  | Seed data or TC-Q001 |
| Invoices      | Payment workflow test    | Seed data or TC-I001 |
| Bank Accounts | Reconciliation test      | TC-B001 or seed data |
| Admin User    | User management tests    | Seed data            |

### Seed Data Categories

- Customers: 5-10 sample customers
- Products/Services: 10-20 items
- Users: Admin, Manager, Viewer roles
- Quotations: Draft, Approved, Rejected statuses
- Invoices: Draft, Sent, Paid, Overdue statuses
- Bank Transactions: Reconciled, Unreconciled

---

## 🔧 Maintenance Notes

### Adding New Tests

1. Add test case to `BUSINESS_SCENARIOS.md` with TC-ID
2. Create test in appropriate `.spec.ts` file
3. Run test to verify it passes
4. Add video recording if it's a key workflow

### Updating Tests

- Keep locator strategies flexible
- Use `first()` and `.or()` patterns for robustness
- Add `randomDelay()` for visual clarity
- Include graceful handling for missing data

---

**Document Version**: 1.0
**Last Updated**: 2026-02-25
**Total Test Suites**: 8 (5 implemented + 3 planned)
**Total Tests**: ~45 (30 implemented + ~15 planned)
