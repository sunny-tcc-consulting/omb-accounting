# Playwright E2E Test Plans - Additional Business Scenarios

## Overview

This document outlines comprehensive E2E test plans for the omb-accounting system, covering additional business scenarios beyond the basic page structure tests.

---

## 📋 Test Suite Structure

```
e2e/
├── video.spec.ts                    # Current: Basic page structure tests
├── business-scenarios.spec.ts       # NEW: Comprehensive business workflows
├── customer-management.spec.ts      # NEW: Customer CRUD operations
├── quotation-workflow.spec.ts       # NEW: Quotation lifecycle
├── invoice-workflow.spec.ts         # NEW: Invoice lifecycle
├── bank-reconciliation.spec.ts      # NEW: Bank operations
├── reports.spec.ts                  # NEW: Reports & analytics
└── user-management.spec.ts          # NEW: User & role management
```

---

## 🎯 Test Suite 1: Customer Management (`customer-management.spec.ts`)

### TC-C001: Create New Customer

**Priority**: High
**Preconditions**: Logged in as admin

| Step | Action                                       | Expected Result                  |
| ---- | -------------------------------------------- | -------------------------------- |
| 1    | Navigate to `/customers`                     | Customer list page loads         |
| 2    | Click "New Customer" button                  | Customer form appears            |
| 3    | Fill in required fields (name, email, phone) | Fields accept input              |
| 4    | Fill optional fields (address, company)      | Optional fields populated        |
| 5    | Click "Save" or "Submit"                     | Customer saved, redirect to list |
| 6    | Verify new customer appears in list          | New customer entry visible       |

**Assertions**:

- `expect(page.locator('table')).toContainText(customerName)`
- `expect(page.locator('.toast')).toContainText('success')`

---

### TC-C002: Edit Customer

**Priority**: High
**Preconditions**: At least one customer exists

| Step | Action                                | Expected Result                    |
| ---- | ------------------------------------- | ---------------------------------- |
| 1    | Navigate to `/customers`              | Customer list displays             |
| 2    | Find customer and click "Edit" button | Edit form loads with existing data |
| 3    | Modify fields (e.g., update phone)    | Changes reflected in form          |
| 4    | Save changes                          | Changes persisted                  |
| 5    | Verify updates in list                | Modified data displayed            |

**Assertions**:

- `expect(page.locator('table')).toContainText(updatedName)`
- Form fields pre-populated with existing values

---

### TC-C003: Delete Customer

**Priority**: Medium
**Preconditions**: At least one customer exists

| Step | Action                                  | Expected Result             |
| ---- | --------------------------------------- | --------------------------- |
| 1    | Navigate to `/customers`                | Customer list displays      |
| 2    | Find customer and click "Delete" button | Confirmation dialog appears |
| 3    | Confirm deletion                        | Customer removed from list  |

**Assertions**:

- `expect(page.locator('table')).NOT.toContainText(customerName)`
- Success toast or notification displayed

---

### TC-C004: Search/Filter Customers

**Priority**: Medium
**Preconditions**: Multiple customers exist

| Step | Action                           | Expected Result               |
| ---- | -------------------------------- | ----------------------------- |
| 1    | Navigate to `/customers`         | Customer list displays        |
| 2    | Type in search box               | List filters in real-time     |
| 3    | Apply filters (e.g., by company) | Only matching customers shown |

**Assertions**:

- `expect(page.locator('table tbody tr')).toHaveCount(expectedCount)`

---

## 📋 Test Suite 2: Quotation Workflow (`quotation-workflow.spec.ts`)

### TC-Q001: Create Quotation with Line Items

**Priority**: Critical
**Preconditions**: At least one customer exists

| Step | Action                                                | Expected Result                   |
| ---- | ----------------------------------------------------- | --------------------------------- |
| 1    | Navigate to `/quotations/new`                         | Quotation form loads              |
| 2    | Select customer from dropdown                         | Customer selected                 |
| 3    | Fill quotation details (date, valid until)            | Fields populated                  |
| 4    | Add line item (product, description, quantity, price) | Item added to table               |
| 5    | Add multiple line items                               | All items visible in table        |
| 6    | Verify subtotal/total calculations                    | Totals calculate correctly        |
| 7    | Click "Save"                                          | Quotation saved, redirect to list |

**Assertions**:

- `expect(page.locator('.line-items table')).toContainText(productName)`
- `expect(page.locator('.total')).toContainText(calculatedTotal)`
- URL redirects to `/quotations`

---

### TC-Q002: View Quotation Details

**Priority**: High
**Preconditions**: At least one quotation exists

| Step | Action                              | Expected Result                 |
| ---- | ----------------------------------- | ------------------------------- |
| 1    | Navigate to `/quotations`           | Quotation list displays         |
| 2    | Click on quotation number/name      | Detail view opens               |
| 3    | Verify all fields display correctly | Customer, items, totals visible |
| 4    | Verify PDF/Print button exists      | Print option available          |

**Assertions**:

- `expect(page.locator('h1')).toContainText('Quotation')`
- `expect(page.locator('.customer-info')).toContainText(customerName)`

---

### TC-Q003: Edit Quotation

**Priority**: High
**Preconditions**: At least one quotation exists

| Step | Action                                | Expected Result                    |
| ---- | ------------------------------------- | ---------------------------------- |
| 1    | Navigate to `/quotations`             | List displays                      |
| 2    | Click "Edit" on quotation             | Edit form loads with existing data |
| 3    | Modify line items (add/remove/update) | Changes reflected                  |
| 4    | Save changes                          | Quotation updated                  |

**Assertions**:

- `expect(page.locator('.toast')).toContainText('updated')`
- Updated totals reflected in detail view

---

### TC-Q004: Convert Quotation to Invoice

**Priority**: Critical
**Preconditions**: At least one quotation exists with status "approved"

| Step | Action                            | Expected Result                      |
| ---- | --------------------------------- | ------------------------------------ |
| 1    | Navigate to `/quotations`         | List displays                        |
| 2    | Open quotation detail             | Detail view opens                    |
| 3    | Click "Convert to Invoice" button | Conversion modal/preview appears     |
| 4    | Review pre-filled invoice data    | Customer and items copied            |
| 5    | Confirm conversion                | Invoice created, redirect to invoice |
| 6    | Verify invoice was created        | Invoice with correct data visible    |

**Assertions**:

- URL contains `/invoices/[id]`
- `expect(page.locator('h1')).toContainText('Invoice')`
- Invoice contains items from quotation

---

### TC-Q005: Delete Quotation

**Priority**: Medium
**Preconditions**: At least one quotation exists

| Step | Action                      | Expected Result             |
| ---- | --------------------------- | --------------------------- |
| 1    | Navigate to `/quotations`   | List displays               |
| 2    | Click "Delete" on quotation | Confirmation dialog appears |
| 3    | Confirm deletion            | Quotation removed           |

**Assertions**:

- `expect(page.locator('table')).NOT.toContainText(quotationNumber)`
- Success notification displayed

---

### TC-Q006: Print Quotation (PDF)

**Priority**: Medium
**Preconditions**: At least one quotation exists

| Step | Action                        | Expected Result                  |
| ---- | ----------------------------- | -------------------------------- |
| 1    | Open quotation detail         | Detail view opens                |
| 2    | Click "Print" or "PDF" button | PDF opens/download starts        |
| 3    | Verify PDF content            | Contains customer, items, totals |

**Assertions**:

- New tab or download initiated
- PDF contains correct data

---

## 📋 Test Suite 3: Invoice Workflow (`invoice-workflow.spec.ts`)

### TC-I001: Create Invoice

**Priority**: Critical
**Preconditions**: At least one customer exists

| Step | Action                                               | Expected Result                 |
| ---- | ---------------------------------------------------- | ------------------------------- |
| 1    | Navigate to `/invoices/new`                          | Invoice form loads              |
| 2    | Select customer                                      | Customer selected               |
| 3    | Fill invoice details (date, due date, payment terms) | Fields populated                |
| 4    | Add line items                                       | Items added to table            |
| 5    | Verify tax calculations (if applicable)              | Tax calculated correctly        |
| 6    | Save invoice                                         | Invoice saved, redirect to list |

**Assertions**:

- `expect(page.locator('table')).toContainText(itemName)`
- Invoice number generated (format: INV-YYYY-XXXXX)

---

### TC-I002: Invoice Status Workflow

**Priority**: Critical
**Preconditions**: At least one invoice exists

| Step | Action                  | Expected Result                                    |
| ---- | ----------------------- | -------------------------------------------------- |
| 1    | Navigate to `/invoices` | Invoice list displays                              |
| 2    | Check status indicators | Status badges visible (Draft, Sent, Paid, Overdue) |
| 3    | Update invoice status   | Status changes reflect in list                     |

**Assertions**:

- `expect(page.locator('.status-badge')).toContainText(expectedStatus)`

---

### TC-I003: Mark Invoice as Paid

**Priority**: High
**Preconditions**: At least one invoice exists (not already paid)

| Step | Action                               | Expected Result                |
| ---- | ------------------------------------ | ------------------------------ |
| 1    | Open invoice detail                  | Detail view opens              |
| 2    | Click "Mark as Paid"                 | Payment dialog/confirm appears |
| 3    | Enter payment details (date, method) | Details entered                |
| 4    | Confirm payment                      | Status changes to "Paid"       |

**Assertions**:

- `expect(page.locator('.status')).toContainText('Paid')`
- Payment recorded in history

---

### TC-I004: Send Invoice to Customer

**Priority**: High
**Preconditions**: At least one invoice exists

| Step | Action                          | Expected Result                  |
| ---- | ------------------------------- | -------------------------------- |
| 1    | Open invoice detail             | Detail view opens                |
| 2    | Click "Send" or "Email" button  | Email dialog opens               |
| 3    | Verify email address pre-filled | Customer email visible           |
| 4    | Send invoice                    | Invoice status changes to "Sent" |

**Assertions**:

- `expect(page.locator('.status')).toContainText('Sent')`
- Toast notification: "Invoice sent successfully"

---

### TC-I005: Invoice PDF Generation

**Priority**: Medium
**Preconditions**: At least one invoice exists

| Step | Action               | Expected Result              |
| ---- | -------------------- | ---------------------------- |
| 1    | Open invoice detail  | Detail view opens            |
| 2    | Click "Download PDF" | PDF generated and downloaded |
| 3    | Verify PDF content   | Contains all invoice data    |

**Assertions**:

- Download initiated
- PDF contains customer, items, totals, payment details

---

## 📋 Test Suite 4: Bank Reconciliation (`bank-reconciliation.spec.ts`)

### TC-B001: Add Bank Account

**Priority**: High
**Preconditions**: None

| Step | Action                                             | Expected Result       |
| ---- | -------------------------------------------------- | --------------------- |
| 1    | Navigate to `/bank`                                | Bank page loads       |
| 2    | Click "Add Bank Account"                           | Form appears          |
| 3    | Fill bank details (name, account number, currency) | Fields populated      |
| 4    | Save account                                       | Account added to list |

**Assertions**:

- `expect(page.locator('.bank-accounts')).toContainText(accountName)`

---

### TC-B002: View Bank Transactions

**Priority**: High
**Preconditions**: Bank account exists

| Step | Action                  | Expected Result            |
| ---- | ----------------------- | -------------------------- |
| 1    | Navigate to `/bank`     | Bank page displays         |
| 2    | Select bank account     | Transactions load          |
| 3    | Verify transaction list | Transactions table visible |

**Assertions**:

- `expect(page.locator('table')).toContainText('Transaction')`

---

### TC-B003: Reconcile Transactions

**Priority**: Critical
**Preconditions**: Bank account and un-reconciled transactions exist

| Step | Action                          | Expected Result                |
| ---- | ------------------------------- | ------------------------------ |
| 1    | Navigate to `/bank`             | Bank page loads                |
| 2    | Select bank account             | Transactions display           |
| 3    | Mark transactions as reconciled | Checkboxes or actions          |
| 4    | Verify reconciliation status    | Status changes to "Reconciled" |

**Assertions**:

- `expect(page.locator('.reconciled')).toBeTruthy()`
- Un-reconciled count decreases

---

### TC-B004: Upload Bank Statement

**Priority**: Medium
**Preconditions**: Bank account exists

| Step | Action                       | Expected Result          |
| ---- | ---------------------------- | ------------------------ |
| 1    | Navigate to `/bank`          | Bank page loads          |
| 2    | Click "Upload Statement"     | File upload dialog opens |
| 3    | Select CSV/OFX file          | File selected            |
| 4    | Confirm upload               | Transactions imported    |
| 5    | Verify imported transactions | New transactions appear  |

**Assertions**:

- `expect(page.locator('.toast')).toContainText('imported')`
- Transaction count increases

---

## 📋 Test Suite 5: Reports & Analytics (`reports.spec.ts`)

### TC-R001: View Dashboard Overview

**Priority**: High
**Preconditions**: Logged in

| Step | Action                       | Expected Result                   |
| ---- | ---------------------------- | --------------------------------- |
| 1    | Navigate to `/` (Dashboard)  | Dashboard loads                   |
| 2    | Verify key metrics displayed | Revenue, expenses, profit visible |
| 3    | Check charts/graphs          | Visualizations render             |

**Assertions**:

- `expect(page.locator('.overview-cards')).toBeVisible()`
- Financial figures displayed

---

### TC-R002: View Sales Report

**Priority**: High
**Preconditions**: Quotations/invoices exist

| Step | Action                                     | Expected Result    |
| ---- | ------------------------------------------ | ------------------ |
| 1    | Navigate to `/reports` or `/reports/sales` | Reports page loads |
| 2    | Verify sales data table                    | Sales data visible |
| 3    | Check date filters                         | Filters functional |

**Assertions**:

- `expect(page.locator('table')).toContainText('Total')`

---

### TC-R003: Export Report to PDF/CSV

**Priority**: Medium
**Preconditions**: Report data exists

| Step | Action                   | Expected Result       |
| ---- | ------------------------ | --------------------- |
| 1    | Navigate to reports page | Report displays       |
| 2    | Click "Export" button    | Export options appear |
| 3    | Select format (PDF/CSV)  | Download initiates    |

**Assertions**:

- Download started
- Correct file format generated

---

## 📋 Test Suite 6: User Management (`user-management.spec.ts`)

### TC-U001: View User List

**Priority**: High
**Preconditions**: Logged in as admin

| Step | Action               | Expected Result     |
| ---- | -------------------- | ------------------- |
| 1    | Navigate to `/users` | User list displays  |
| 2    | Verify user data     | Users table visible |

**Assertions**:

- `expect(page.locator('table')).toContainText('Admin')`

---

### TC-U002: Create New User

**Priority**: High
**Preconditions**: Admin access

| Step | Action                                | Expected Result    |
| ---- | ------------------------------------- | ------------------ |
| 1    | Navigate to `/users`                  | User list displays |
| 2    | Click "Add User"                      | Form appears       |
| 3    | Fill user details (name, email, role) | Fields populated   |
| 4    | Save user                             | User added to list |

**Assertions**:

- `expect(page.locator('table')).toContainText(newUserEmail)`
- Role assigned correctly

---

### TC-U003: Edit User Roles

**Priority**: High
**Preconditions**: Admin access, users exist

| Step | Action                           | Expected Result     |
| ---- | -------------------------------- | ------------------- |
| 1    | Navigate to `/users`             | List displays       |
| 2    | Click "Edit" on user             | Edit form opens     |
| 3    | Change role (e.g., Admin ↔ User) | Role updated        |
| 4    | Save changes                     | Permissions updated |

**Assertions**:

- `expect(page.locator('.role-badge')).toContainText(newRole)`

---

### TC-U004: Role Management Page

**Priority**: Medium
**Preconditions**: Admin access

| Step | Action                          | Expected Result     |
| ---- | ------------------------------- | ------------------- |
| 1    | Navigate to `/roles`            | Roles page loads    |
| 2    | Verify role list                | Roles displayed     |
| 3    | Check permissions for each role | Permissions visible |

**Assertions**:

- `expect(page.locator('table')).toContainText('Permissions')`

---

## 📋 Test Suite 7: Settings & Preferences (`settings.spec.ts`)

### TC-S001: Company Settings

**Priority**: Medium
**Preconditions**: Admin access

| Step | Action                     | Expected Result     |
| ---- | -------------------------- | ------------------- |
| 1    | Navigate to `/settings`    | Settings page loads |
| 2    | Update company information | Fields editable     |
| 3    | Save settings              | Changes persisted   |

**Assertions**:

- `expect(page.locator('.toast')).toContainText('saved')`

---

### TC-S002: Invoice Settings

**Priority**: Medium
**Preconditions**: Admin access

| Step | Action                           | Expected Result         |
| ---- | -------------------------------- | ----------------------- |
| 1    | Navigate to `/settings/invoice`  | Invoice settings load   |
| 2    | Update invoice prefix, numbering | Settings updated        |
| 3    | Save                             | Configuration persisted |

**Assertions**:

- New invoices use updated format

---

## 📊 Test Execution Order (Priority)

| Order | Suite               | Rationale                    |
| ----- | ------------------- | ---------------------------- |
| 1     | Customer Management | Foundation for other modules |
| 2     | Quotation Workflow  | Core business process        |
| 3     | Invoice Workflow    | Revenue tracking             |
| 4     | Bank Reconciliation | Financial accuracy           |
| 5     | Reports & Analytics | Business insights            |
| 6     | User Management     | Security & access control    |
| 7     | Settings            | Configuration validation     |

---

## 🎬 Video Recording Strategy

Each test suite can be recorded for documentation:

```
// Playwright config for video recording
const config = {
  use: {
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 },
    },
    trace: 'retain-on-failure',
  },
};
```

**Recommended Videos**:

1. `customer-management-demo.mp4` - Full customer CRUD workflow
2. `quotation-to-invoice-flow.mp4` - Converting quote to invoice
3. `invoice-lifecycle.mp4` - Invoice creation, sending, payment
4. `bank-reconciliation.mp4` - Bank account setup and reconciliation
5. `full-business-day.mp4` - End-to-end daily operations

---

## 📝 Test Data Requirements

| Entity                  | Minimum Required | Source                      |
| ----------------------- | ---------------- | --------------------------- |
| Customers               | 5                | Seed data or create in test |
| Products/Services       | 10               | Seed data                   |
| Bank Accounts           | 2                | Create in test              |
| Users (different roles) | 3                | Seed data                   |
| Sample Quotations       | 5                | Create in test              |
| Sample Invoices         | 5                | Create in test              |

---

## ✅ Test Execution Checklist

- [ ] All tests pass locally
- [ ] Video recordings captured for key workflows
- [ ] No console errors in any test
- [ ] Tests handle loading states correctly
- [ ] Responsive design tested (desktop, tablet, mobile)
- [ ] Accessibility checks included (aria-labels, keyboard nav)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-25
**Author**: AI Assistant (圓圓)
