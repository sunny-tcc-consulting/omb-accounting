# Phase 4: Implementation Tasks

## Project: omb-accounting

## Phase: 4 - Multi-Module Enhancement

## Created: 2026-02-22

---

## Overview

This document contains the ordered task breakdown for Phase 4 implementation. Tasks are organized by module and marked for parallel execution where applicable.

**Total Estimated Tasks:** 120+
**Estimated Duration:** 13 weeks

---

## Task Markers Legend

- **[P]** - Can be executed in parallel with adjacent tasks
- **[S]** - Sequential dependency (must complete before next)
- **[M]** - Milestone task

---

## Phase 4.1: Foundation & Security (Week 1)

### Security Hardening (Foundation)

#### SEC-001: Security Headers Implementation

**Description:** Implement HTTP security headers across the application
**Status:** Pending
**Type:** implementation
**Files:**

- `src/middleware/security-headers.ts` (new)
- `next.config.js` (update)

**Steps:**

1. Create security headers middleware
2. Add CSP (Content Security Policy) header
3. Add HSTS header
4. Add X-Content-Type-Options
5. Add X-Frame-Options
6. Add Referrer-Policy
7. Add Permissions-Policy
8. Test headers with security scanner

**Dependencies:** None
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] All security headers present in response
- [ ] CSP allows only trusted sources
- [ ] HSTS configured for production
- [ ] Headers pass security audit

---

#### SEC-002: Input Validation & Sanitization

**Description:** Implement comprehensive input validation using Zod
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/validators.ts` (new)
- `src/middleware/validation.ts` (new)

**Steps:**

1. Create Zod validation schemas for all inputs
2. Implement server-side validation middleware
3. Add sanitization utilities
4. Create validation error responses
5. Add file upload validation
6. Document validation rules

**Dependencies:** None
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] All API inputs validated
- [ ] Validation errors return proper format
- [ ] SQL injection prevented
- [ ] XSS vectors sanitized

---

#### SEC-003: CSRF Protection

**Description:** Implement CSRF token protection for forms and APIs
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/csrf.ts` (new)
- `src/middleware/csrf.ts` (new)

**Steps:**

1. Create CSRF token generation utility
2. Implement double-submit cookie pattern
3. Add CSRF token to all forms
4. Create CSRF validation middleware
5. Add SameSite cookie attributes
6. Test CSRF protection

**Dependencies:** SEC-001
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] CSRF tokens generated for all forms
- [ ] Token validation on POST/PUT/DELETE
- [ ] SameSite cookies configured
- [ ] CSRF attacks blocked

---

### User & Roles - Core Foundation

#### USER-001: Database Schema for Users & Roles

**Description:** Create Prisma schema for users, roles, and permissions
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)

**Steps:**

1. Add User model to schema
2. Add Role model to schema
3. Add Permission model to schema
4. Add RolePermission many-to-many
5. Add UserActivity model
6. Add UserSession model
7. Run Prisma migration
8. Generate Prisma client

**Dependencies:** None
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] Database migration successful
- [ ] All models created
- [ ] Relations properly defined
- [ ] Indexes added for performance

---

#### USER-002: User Context & Authentication

**Description:** Implement user context and authentication flow
**Status:** Pending
**Type:** implementation
**Files:**

- `src/contexts/AuthContext.tsx` (new)
- `src/hooks/useAuth.ts` (new)
- `src/lib/auth.ts` (new)

**Steps:**

1. Create AuthContext with user state
2. Implement login/logout functions
3. Add session management
4. Create useAuth hook
5. Add auth middleware protection
6. Implement password hashing utilities

**Dependencies:** USER-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Users can log in
- [ ] Session persists across pages
- [ ] Logout clears session
- [ ] Unauthenticated users redirected

---

#### USER-003: Role-Based Access Control

**Description:** Implement RBAC system with permissions
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/rbac.ts` (new)
- `src/components/auth/PermissionGate.tsx` (new)
- `src/middleware/rbac.ts` (new)

**Steps:**

1. Define default roles (Admin, Manager, Accountant, Viewer)
2. Create permission definitions
3. Implement permission check utility
4. Create PermissionGate component
5. Add RBAC middleware
6. Add permission helper hooks
7. Document permission matrix

**Dependencies:** USER-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Users assigned roles
- [ ] Permission checks work correctly
- [ ] PermissionGate renders conditionally
- [ ] Unauthorized actions blocked

---

#### USER-004: User Management UI

**Description:** Create user management interface
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/(dashboard)/settings/users/page.tsx` (new)
- `src/components/settings/UserList.tsx` (new)
- `src/components/settings/UserForm.tsx` (new)

**Steps:**

1. Create users listing page
2. Create user form component
3. Add search and filter
4. Implement CRUD operations
5. Add status toggle
6. Add password reset functionality

**Dependencies:** USER-003
**Estimated Time:** 6 hours
**Acceptance Criteria:**

- [ ] Users list displays correctly
- [ ] Create/edit user works
- [ ] Deactivate/reactivate works
- [ ] Password reset emails sent

---

#### USER-005: Role Management UI

**Description:** Create role management interface
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/(dashboard)/settings/roles/page.tsx` (new)
- `src/components/settings/RoleList.tsx` (new)
- `src/components/settings/RoleForm.tsx` (new)
- `src/components/settings/PermissionMatrix.tsx` (new)

**Steps:**

1. Create roles listing page
2. Create role form component
3. Create permission matrix component
4. Implement role CRUD
5. Add permission assignment
6. Prevent system role deletion

**Dependencies:** USER-003
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Roles list displays correctly
- [ ] Role creation/editing works
- [ ] Permission matrix interactive
- [ ] System roles protected

---

#### USER-006: Activity Logging

**Description:** Implement activity logging for audit trail
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/activity-logger.ts` (new)
- `src/app/(dashboard)/settings/activity/page.tsx` (new)

**Steps:**

1. Create activity logger utility
2. Add logging to critical actions
3. Create activity list page
4. Add filtering and search
5. Implement log export

**Dependencies:** USER-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] All user actions logged
- [ ] Activity page displays logs
- [ ] Filtering works correctly
- [ ] Export to CSV works

---

#### USER-007: Session Management

**Description:** Implement session management and timeout
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/session-manager.ts` (new)
- `src/components/auth/SessionTimeout.tsx` (new)

**Steps:**

1. Create session manager
2. Implement session timeout
3. Add session activity tracking
4. Create timeout warning dialog
5. Implement force logout
6. Add session list to settings

**Dependencies:** USER-002
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Sessions expire after timeout
- [ ] Warning dialog appears
- [ ] Extend session option works
- [ ] Admin can terminate sessions

---

## Phase 4.2: Multi-currency Support (Week 2)

### Currency Foundation

#### CURR-001: Currency Database Schema

**Description:** Add currency and exchange rate tables
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)
- `src/types/currency.ts` (new)

**Steps:**

1. Add Currency model to schema
2. Add ExchangeRate model to schema
3. Add CurrencyGainLoss model
4. Add currency fields to accounts table
5. Run Prisma migration
6. Create TypeScript types

**Dependencies:** None
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] Migration successful
- [ ] All currency models created
- [ ] TypeScript types defined

---

#### CURR-002: Currency API & CRUD

**Description:** Create API for currency management
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/currency/route.ts` (new)
- `src/app/api/currency/[code]/route.ts` (new)
- `src/lib/currency-service.ts` (new)

**Steps:**

1. Create currency CRUD API
2. Create currency service layer
3. Add currency validation
4. Implement list endpoint
5. Add activate/deactivate

**Dependencies:** CURR-001
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Currency CRUD works
- [ ] Validation passes
- [ ] API returns correct format

---

#### CURR-003: Exchange Rate Management

**Description:** Implement exchange rate CRUD and API
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/currency/rates/route.ts` (new)
- `src/app/api/currency/rates/[id]/route.ts` (new)
- `src/lib/exchange-rate-service.ts` (new)

**Steps:**

1. Create exchange rate CRUD API
2. Create exchange rate service
3. Add rate validation
4. Implement fetch from external API
5. Add rate history tracking

**Dependencies:** CURR-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Exchange rates CRUD works
- [ ] External API integration
- [ ] Rate history stored

---

#### CURR-004: Currency Conversion Utilities

**Description:** Implement currency conversion functions
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/currency-converter.ts` (new)

**Steps:**

1. Create convertAmount function
2. Implement rate lookup
3. Add rounding rules
4. Create gain/loss calculation
5. Add conversion history

**Dependencies:** CURR-003
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Conversions accurate
- [ ] Gain/loss calculated
- [ ] Rounding works correctly

---

#### CURR-005: Multi-currency Transaction Support

**Description:** Add multi-currency to transaction handling
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/transaction-currency.ts` (new)
- `src/components/currency/CurrencySelector.tsx` (new)

**Steps:**

1. Update transaction creation for currency
2. Create currency selector component
3. Add currency display utilities
4. Implement exchange rate recording
5. Update transaction types

**Dependencies:** CURR-004
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Transactions support currency
- [ ] Currency selector works
- [ ] Exchange rates recorded

---

#### CURR-006: Multi-currency Reports

**Description:** Update reports for multi-currency support
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/reports/MultiCurrencyToggle.tsx` (new)

**Steps:**

1. Add currency selector to reports
2. Implement currency conversion in reports
3. Create multi-currency summary
4. Add currency column to reports
5. Update PDF export for currency

**Dependencies:** CURR-005
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Reports show multi-currency
- [ ] Currency conversion works
- [ ] PDF export includes currency

---

## Phase 4.3: Invoice Management (Weeks 3-5)

### Invoice Foundation

#### INV-001: Invoice Database Schema

**Description:** Create invoice tables in Prisma
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)
- `src/types/invoice.ts` (new)

**Steps:**

1. Add Invoice model
2. Add InvoiceLineItem model
3. Add InvoicePayment model
4. Add RecurringInvoice model
5. Add InvoiceEmailLog model
6. Run Prisma migration
7. Create TypeScript types

**Dependencies:** None
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] Migration successful
- [ ] All invoice models created
- [ ] Relations properly defined

---

#### INV-002: Invoice CRUD API

**Description:** Create API endpoints for invoice operations
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/invoices/route.ts` (new)
- `src/app/api/invoices/[id]/route.ts` (new)
- `src/lib/invoice-service.ts` (new)

**Steps:**

1. Create invoice CRUD API
2. Create invoice service
3. Add invoice validation (Zod)
4. Implement pagination
5. Add filtering by status
6. Add sorting options

**Dependencies:** INV-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] CRUD operations work
- [ ] Validation passes
- [ ] Pagination/filtering works

---

#### INV-003: Invoice Calculation Engine

**Description:** Implement invoice calculation logic
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/invoice-calculator.ts` (new)

**Steps:**

1. Create calculateLineItem function
2. Implement calculateSubtotal
3. Implement calculateTax
4. Implement calculateTotal
5. Create calculateDueDate function
6. Add rounding utilities

**Dependencies:** INV-002
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Calculations accurate
- [ ] Tax calculations correct
- [ ] Due date calculated correctly

---

#### INV-004: Invoice UI - List View

**Description:** Create invoice listing page
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/(dashboard)/invoices/page.tsx` (new)
- `src/components/invoices/InvoiceList.tsx` (new)
- `src/components/invoices/InvoiceFilters.tsx` (new)

**Steps:**

1. Create invoices listing page
2. Create invoice list component
3. Add filters (status, date, customer)
4. Add search functionality
5. Add pagination
6. Add bulk actions

**Dependencies:** INV-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] List displays correctly
- [ ] Filters work
- [ ] Pagination works

---

#### INV-005: Invoice UI - Create/Edit Form

**Description:** Create invoice form component
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/invoices/InvoiceForm.tsx` (new)
- `src/components/invoices/InvoiceLineItems.tsx` (new)
- `src/components/invoices/CustomerSelector.tsx` (new)

**Steps:**

1. Create invoice form component
2. Create line items editor
3. Create customer selector
4. Add tax rate selector
5. Add payment terms selector
6. Implement save as draft
7. Add form validation

**Dependencies:** INV-003, INV-004
**Estimated Time:** 6 hours
**Acceptance Criteria:**

- [ ] Form submits correctly
- [ ] Line items add/remove
- [ ] Calculations update live
- [ ] Validation works

---

#### INV-006: Invoice Preview & PDF Generation

**Description:** Implement invoice preview and PDF generation
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/invoices/InvoicePreview.tsx` (new)
- `src/lib/invoice-pdf-generator.ts` (new)

**Steps:**

1. Create invoice preview modal
2. Implement PDF generation with jsPDF
3. Add company branding support
4. Add logo upload
5. Create PDF template
6. Add PDF download

**Dependencies:** INV-005
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Preview displays correctly
- [ ] PDF generates accurately
- [ ] Branding customization works

---

#### INV-007: Invoice Status Workflow

**Description:** Implement invoice status management
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/invoice-workflow.ts` (new)

**Steps:**

1. Define status transitions
2. Implement status change logic
3. Add view tracking
4. Create overdue detection
5. Add status change logging
6. Implement payment recording

**Dependencies:** INV-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Status transitions work
- [ ] View tracking accurate
- [ ] Overdue detection works

---

#### INV-008: Payment Tracking

**Description:** Implement invoice payment tracking
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/invoices/InvoicePaymentForm.tsx` (new)
- `src/components/invoices/InvoicePaymentHistory.tsx` (new)

**Steps:**

1. Create payment form component
2. Add payment history display
3. Implement partial payments
4. Create payment receipt
5. Update invoice status on payment
6. Add payment filters

**Dependencies:** INV-007
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Payments record correctly
- [ ] Partial payments work
- [ ] Status updates correctly

---

#### INV-009: Recurring Invoices

**Description:** Implement recurring invoice functionality
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/invoices/recurring/route.ts` (new)
- `src/app/(dashboard)/invoices/recurring/page.tsx` (new)
- `src/components/invoices/RecurringInvoiceForm.tsx` (new)

**Steps:**

1. Create recurring invoice API
2. Create recurring list page
3. Create recurring form
4. Add frequency selector
5. Implement generation logic
6. Create schedule manager
7. Add toggle active/inactive

**Dependencies:** INV-001, INV-002
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Recurring invoices create
- [ ] Generation works on schedule
- [ ] Toggle works correctly

---

#### INV-010: Invoice Email Integration

**Description:** Integrate email sending with invoice workflow
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/invoice-email-service.ts` (new)
- `src/components/invoices/InvoiceEmailDialog.tsx` (new)

**Steps:**

1. Create invoice email service
2. Create email dialog component
3. Add email template variables
4. Implement send invoice function
5. Add email log tracking
6. Create sent items view

**Dependencies:** INV-006, EMAIL-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Invoices send via email
- [ ] Templates render correctly
- [ ] Email log tracks sends

---

## Phase 4.4: Email System (Week 6)

### Email Foundation

#### EMAIL-001: Email Template System

**Description:** Create email template management
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)
- `src/app/api/email/templates/route.ts` (new)
- `src/app/api/email/templates/[id]/route.ts` (new)
- `src/components/email/TemplateList.tsx` (new)
- `src/components/email/TemplateForm.tsx` (new)
- `src/lib/email-templates.ts` (new)

**Steps:**

1. Add email templates to schema
2. Create template CRUD API
3. Create template list component
4. Create template form with variables
5. Add HTML/text support
6. Create default templates
7. Add template preview

**Dependencies:** None
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Templates CRUD works
- [ ] Variables replace correctly
- [ ] Default templates created

---

#### EMAIL-002: SMTP Configuration

**Description:** Implement SMTP email configuration
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/email/config/route.ts` (new)
- `src/components/email/EmailConfigForm.tsx` (new)
- `src/lib/email-sender.ts` (new)

**Steps:**

1. Add email config to schema
2. Create config API
3. Create config form
4. Implement Nodemailer sender
5. Add test email function
6. Create error handling
7. Add credential encryption

**Dependencies:** EMAIL-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] SMTP config saves
- [ ] Test email sends
- [ ] Encryption works

---

#### EMAIL-003: Email Queue System

**Description:** Implement email queue for reliable sending
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/email/queue/route.ts` (new)
- `src/lib/email-queue.ts` (new)
- `src/components/email/EmailQueueList.tsx` (new)

**Steps:**

1. Add email queue to schema
2. Create queue API
3. Implement queue processor
4. Add retry logic
5. Create queue list UI
6. Add status tracking

**Dependencies:** EMAIL-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Queue processes emails
- [ ] Retries work correctly
- [ ] Status updates accurately

---

#### EMAIL-004: Notification Center

**Description:** Create in-app notification center
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/notifications/route.ts` (new)
- `src/components/notifications/NotificationBell.tsx` (new)
- `src/components/notifications/NotificationList.tsx` (new)
- `src/contexts/NotificationContext.tsx` (new)

**Steps:**

1. Add notifications to schema
2. Create notification API
3. Create notification context
4. Create bell icon component
5. Create notification dropdown
6. Implement mark read/unread
7. Add notification preferences

**Dependencies:** None
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Notifications display
- [ ] Bell shows count
- [ ] Mark read works

---

#### EMAIL-005: Notification Preferences

**Description:** Implement user notification preferences
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/notifications/preferences/route.ts` (new)
- `src/components/notifications/NotificationPreferences.tsx` (new)

**Steps:**

1. Add preferences to schema
2. Create preferences API
3. Create preferences form
4. Add email/in-app toggles
5. Add frequency selector
6. Save preferences correctly

**Dependencies:** EMAIL-004
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Preferences save
- [ ] Settings apply correctly
- [ ] UI works smoothly

---

## Phase 4.5: Dashboard & Analytics (Weeks 7-8)

### Dashboard Foundation

#### DASH-001: Dashboard Metrics Calculation

**Description:** Implement metrics calculation service
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/dashboard-metrics.ts` (new)

**Steps:**

1. Create calculateRevenue function
2. Create calculateExpenses function
3. Create calculateProfit function
4. Create calculateCashFlow function
5. Implement A/R and A/P aging
6. Create getMetrics function

**Dependencies:** None
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Calculations accurate
- [ ] Metrics return correct values
- [ ] Performance acceptable

---

#### DASH-002: Dashboard API

**Description:** Create dashboard API endpoints
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/dashboard/metrics/route.ts` (new)
- `src/app/api/dashboard/revenue/route.ts` (new)
- `src/app/api/dashboard/expenses/route.ts` (new)
- `src/app/api/dashboard/cashflow/route.ts` (new)
- `src/app/api/dashboard/ratios/route.ts` (new)

**Steps:**

1. Create metrics API endpoint
2. Create revenue API endpoint
3. Create expenses API endpoint
4. Create cash flow API endpoint
5. Create ratios API endpoint
6. Add date range filtering

**Dependencies:** DASH-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] APIs return correct data
- [ ] Date filtering works
- [ ] Performance acceptable

---

#### DASH-003: Dashboard Page Layout

**Description:** Create dashboard page structure
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/(dashboard)/dashboard/page.tsx` (new)
- `src/components/dashboard/DashboardLayout.tsx` (new)

**Steps:**

1. Create dashboard page
2. Create layout component
3. Add date range picker
4. Create grid layout
5. Add loading skeletons
6. Add responsive design

**Dependencies:** DASH-002
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Page loads correctly
- [ ] Layout responsive
- [ ] Loading states work

---

#### DASH-004: Metrics Cards Component

**Description:** Create metrics display cards
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/dashboard/MetricsCards.tsx` (new)
- `src/components/dashboard/MetricCard.tsx` (new)

**Steps:**

1. Create MetricCard component
2. Add trend indicators
3. Create MetricsCards container
4. Add comparison display
5. Implement color coding
6. Add animations

**Dependencies:** DASH-003
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Cards display correctly
- [ ] Trends show accurately
- [ ] Animations smooth

---

#### DASH-005: Chart Components

**Description:** Create dashboard chart components
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/dashboard/RevenueChart.tsx` (new)
- `src/components/dashboard/ExpenseChart.tsx` (new)
- `src/components/dashboard/CashFlowChart.tsx` (new)

**Steps:**

1. Create RevenueLineChart with Recharts
2. Create ExpenseBarChart
3. Create CashFlowAreaChart
4. Add chart tooltips
5. Add chart legends
6. Implement chart export

**Dependencies:** DASH-004
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Charts render correctly
- [ ] Interactivity works
- [ ] Export functions work

---

#### DASH-006: Financial Ratios Component

**Description:** Create financial health indicators
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/dashboard/FinancialRatios.tsx` (new)
- `src/components/dashboard/RatioCard.tsx` (new)

**Steps:**

1. Create calculateRatios function
2. Create RatioCard component
3. Create FinancialRatios container
4. Add health score calculation
5. Implement ratio trends
6. Add ratio descriptions

**Dependencies:** DASH-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Ratios calculate correctly
- [ ] Health score accurate
- [ ] UI displays properly

---

#### DASH-007: Customer & Vendor Analytics

**Description:** Create customer and vendor analytics views
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/dashboard/CustomerTable.tsx` (new)
- `src/components/dashboard/VendorTable.tsx` (new)
- `src/app/api/dashboard/customers/route.ts` (new)
- `src/app/api/dashboard/vendors/route.ts` (new)

**Steps:**

1. Create customer analytics API
2. Create vendor analytics API
3. Create CustomerTable component
4. Create VendorTable component
5. Add sorting and filtering
6. Add export functionality

**Dependencies:** DASH-002
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Analytics calculate correctly
- [ ] Tables sort/filter
- [ ] Export works

---

## Phase 4.6: Bank Reconciliation (Weeks 9-10)

### Bank Reconciliation Foundation

#### BANK-001: Bank Account Schema & CRUD

**Description:** Create bank account management
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)
- `src/app/api/bank/accounts/route.ts` (new)
- `src/app/api/bank/accounts/[id]/route.ts` (new)
- `src/lib/bank-service.ts` (new)

**Steps:**

1. Add bank tables to schema
2. Create bank account CRUD API
3. Create bank service layer
4. Add account validation
5. Implement list/filter

**Dependencies:** None
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Account CRUD works
- [ ] Validation passes
- [ ] API functions correctly

---

#### BANK-002: Bank Statement Import

**Description:** Implement CSV/QIF/OFX import functionality
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/bank/import/route.ts` (new)
- `src/lib/bank-import.ts` (new)
- `src/components/bank/ImportDialog.tsx` (new)
- `src/components/bank/ImportPreview.tsx` (new)

**Steps:**

1. Create file upload handler
2. Implement CSV parser
3. Implement QIF parser
4. Implement OFX parser
5. Create column mapping UI
6. Create import preview
7. Add validation and error handling

**Dependencies:** BANK-001
**Estimated Time:** 6 hours
**Acceptance Criteria:**

- [ ] Files import correctly
- [ ] Parsers work for all formats
- [ ] Mapping UI functional
- [ ] Errors handled gracefully

---

#### BANK-003: Transaction API

**Description:** Create bank transaction API
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/api/bank/transactions/route.ts` (new)
- `src/app/api/bank/transactions/[id]/route.ts` (new)

**Steps:**

1. Create transaction CRUD API
2. Add filtering by status
3. Add date range filtering
4. Add pagination
5. Add search functionality

**Dependencies:** BANK-002
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Transaction API works
- [ ] Filtering functions correctly
- [ ] Performance acceptable

---

#### BANK-004: Auto-Matching Algorithm

**Description:** Implement automatic transaction matching
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/bank-matcher.ts` (new)

**Steps:**

1. Create matching criteria
2. Implement amount matching
3. Implement date tolerance matching
4. Implement description matching
5. Add confidence scoring
6. Create auto-match function
7. Add high-confidence auto-match

**Dependencies:** BANK-003
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Matching identifies matches
- [ ] Confidence scoring works
- [ ] Auto-match runs correctly

---

#### BANK-005: Manual Matching Interface

**Description:** Create manual transaction matching UI
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/bank/MatchingInterface.tsx` (new)
- `src/components/bank/BankTransactionList.tsx` (new)
- `src/components/bank/BookTransactionList.tsx` (new)

**Steps:**

1. Create side-by-side view
2. Create drag-and-drop matching
3. Create search functionality
4. Create bulk matching
5. Create match confirmation
6. Add unmatch functionality

**Dependencies:** BANK-004
**Estimated Time:** 5 hours
**Acceptance Criteria:**

- [ ] Interface displays both lists
- [ ] Matching works correctly
- [ ] Drag-and-drop functions

---

#### BANK-006: Reconciliation Logic

**Description:** Implement reconciliation calculation
**Status:** Pending
**Type:** implementation
**Files:**

- `src/lib/reconciliation-service.ts` (new)
- `src/app/api/bank/reconciliation/route.ts` (new)

**Steps:**

1. Create reconciliation calculations
2. Implement opening/closing balance
3. Add cleared items tracking
4. Create difference calculation
5. Implement reconciliation save
6. Add reconciliation history

**Dependencies:** BANK-005
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Calculations accurate
- [ ] Differences calculated
- [ ] History tracked correctly

---

#### BANK-007: Reconciliation Reports

**Description:** Create reconciliation report generation
**Status:** Pending
**Type:** implementation
**Files:**

- `src/components/bank/ReconciliationReport.tsx` (new)
- `src/lib/reconciliation-report.ts` (new)

**Steps:**

1. Create reconciliation summary
2. Create matched items report
3. Create unmatched items report
4. Add export to PDF
5. Add export to CSV
6. Create printable view

**Dependencies:** BANK-006
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Reports display correctly
- [ ] Export functions work
- [ ] Print view works

---

## Phase 4.7: Performance Optimization (Week 11)

### Performance Foundation

#### PERF-001: Bundle Size Analysis

**Description:** Analyze and optimize bundle size
**Status:** Pending
**Type:** implementation
**Files:**

- `next.config.js` (update)
- `next.config.bundle-size.js` (new)

**Steps:**

1. Run bundle analyzer
2. Identify large dependencies
3. Replace heavy libraries
4. Enable tree shaking
5. Configure code splitting

**Dependencies:** None
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Bundle size < 500KB initial
- [ ] No unused code
- [ ] Tree shaking enabled

---

#### PERF-002: Route-Based Code Splitting

**Description:** Implement route-based code splitting
**Status:** Pending
**Type:** implementation
**Files:**

- `src/app/(dashboard)/layout.tsx` (update)
- `src/app/(dashboard)/invoices/page.tsx` (update)

**Steps:**

1. Identify code splitting opportunities
2. Add dynamic imports for heavy components
3. Implement lazy loading
4. Add loading fallbacks
5. Test route transitions

**Dependencies:** PERF-001
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Routes split correctly
- [ ] Loading states display
- [ ] Transitions smooth

---

#### PERF-003: Database Query Optimization

**Description:** Optimize database queries
**Status:** Pending
**Type:** implementation
**Files:**

- `prisma/schema.prisma` (update)
- `src/lib/query-optimization.ts` (new)

**Steps:**

1. Analyze slow queries
2. Add missing indexes
3. Implement pagination optimization
4. Add query caching
5. Optimize N+1 queries
6. Add query logging

**Dependencies:** None
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Queries under 100ms
- [ ] N+1 issues resolved
- [ ] Indexes created

---

#### PERF-004: API Response Caching

**Description:** Implement API caching strategy
**Status:** Pending
**Type:** implementation
**Files:**

- `src/middleware/cache.ts` (new)
- `src/lib/cache-service.ts` (new)

**Steps:**

1. Identify cacheable endpoints
2. Implement caching middleware
3. Add cache invalidation
4. Configure TTL values
5. Add cache monitoring

**Dependencies:** None
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] Caching works correctly
- [ ] TTL respected
- [ ] Invalidations function

---

#### PERF-005: Image & Asset Optimization

**Description:** Optimize images and static assets
**Status:** Pending
**Type:** implementation
**Files:**

- `next.config.js` (update)

**Steps:**

1. Enable next/image optimization
2. Configure image formats (WebP/AVIF)
3. Add lazy loading for images
4. Configure asset caching
5. Minify static assets

**Dependencies:** PERF-001
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] Images optimized
- [ ] Formats correct
- [ ] Caching configured

---

## Phase 4.8: Final Polish (Weeks 12-13)

### Testing & Quality Assurance

#### QA-001: Integration Testing

**Description:** Run comprehensive integration tests
**Status:** Pending
**Type:** testing
**Files:**

- `src/__tests__/integration/` (new)

**Steps:**

1. Test invoice → payment flow
2. Test bank import → match flow
3. Test multi-currency conversion
4. Test user → permission flow
5. Test email sending flow

**Dependencies:** All modules
**Estimated Time:** 8 hours
**Acceptance Criteria:**

- [ ] All flows work correctly
- [ ] No integration errors
- [ ] Performance targets met

---

#### QA-002: Security Audit

**Description:** Perform security testing and audit
**Status:** Pending
**Type:** testing
**Files:**

- `security-audit-report.md` (new)

**Steps:**

1. Run OWASP ZAP scan
2. Test authentication bypass
3. Test authorization checks
4. Test input validation
5. Document findings

**Dependencies:** SEC-001 to SEC-003
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] No critical vulnerabilities
- [ ] All findings documented
- [ ] Critical issues fixed

---

#### QA-003: Performance Testing

**Description:** Run performance benchmarks
**Status:** Pending
**Type:** testing
**Files:**

- `performance-report.md` (new)

**Steps:**

1. Run Lighthouse audits
2. Measure API response times
3. Test with large datasets
4. Test concurrent users
5. Document results

**Dependencies:** PERF-001 to PERF-005
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Lighthouse score > 90
- [ ] API < 500ms
- [ ] Targets met

---

### Documentation

#### DOC-001: User Guide Updates

**Description:** Update user documentation for Phase 4
**Status:** Pending
**Type:** documentation
**Files:**

- `docs/user-guide.md` (update)
- `docs/invoice-guide.md` (new)
- `docs/dashboard-guide.md` (new)
- `docs/bank-guide.md` (new)

**Steps:**

1. Update table of contents
2. Add invoice management section
3. Add dashboard guide
4. Add bank reconciliation guide
5. Add user management guide
6. Add screenshots

**Dependencies:** All modules
**Estimated Time:** 8 hours
**Acceptance Criteria:**

- [ ] All features documented
- [ ] Screenshots included
- [ ] Clear instructions

---

#### DOC-002: Developer Documentation

**Description:** Update developer documentation
**Status:** Pending
**Type:** documentation
**Files:**

- `docs/api-reference.md` (update)
- `docs/data-model.md` (update)
- `docs/security-guide.md` (new)

**Steps:**

1. Update API documentation
2. Update data model diagrams
3. Add security guidelines
4. Add deployment guide
5. Add troubleshooting section

**Dependencies:** All modules
**Estimated Time:** 6 hours
**Acceptance Criteria:**

- [ ] API fully documented
- [ ] Data model accurate
- [ ] Security guide complete

---

#### DOC-003: README Updates

**Description:** Update project README
**Status:** Pending
**Type:** documentation
**Files:**

- `README.md` (update)

**Steps:**

1. Update feature list
2. Add Phase 4 features
3. Update screenshots
4. Add contribution guidelines
5. Update tech stack

**Dependencies:** All modules
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] README up to date
- [ ] Features listed
- [ ] Contributing guide added

---

### Final Testing & Deployment

#### DEPLOY-001: Final Test Run

**Description:** Run full test suite
**Status:** Pending
**Type:** testing
**Files:**

- `test-results.md` (new)

**Steps:**

1. Run all unit tests
2. Run all integration tests
3. Run E2E tests
4. Fix any failures
5. Document results

**Dependencies:** QA-001
**Estimated Time:** 4 hours
**Acceptance Criteria:**

- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] No critical bugs

---

#### DEPLOY-002: Build Verification

**Description:** Verify production build
**Status:** Pending
**Type:** deployment
**Files:**

- `build-results.md` (new)

**Steps:**

1. Run production build
2. Verify build success
3. Test build locally
4. Verify all routes work
5. Test static exports

**Dependencies:** DEPLOY-001
**Estimated Time:** 2 hours
**Acceptance Criteria:**

- [ ] Build successful
- [ ] No errors or warnings
- [ ] All routes accessible

---

#### DEPLOY-003: Staging Deployment

**Description:** Deploy to staging environment
**Status:** Pending
**Type:** deployment
**Files:**

- `deployment-report.md` (new)

**Steps:**

1. Deploy to staging
2. Verify environment configuration
3. Test all features in staging
4. Fix any deployment issues
5. Get stakeholder approval

**Dependencies:** DEPLOY-002
**Estimated Time:** 3 hours
**Acceptance Criteria:**

- [ ] Deployment successful
- [ ] All features functional
- [ ] Stakeholder sign-off

---

## Summary Statistics

### Total Tasks by Category

| Category              | Tasks  | Estimated Hours |
| --------------------- | ------ | --------------- |
| Security Hardening    | 3      | 9               |
| User & Roles          | 7      | 30              |
| Multi-currency        | 6      | 20              |
| Invoice Management    | 10     | 42              |
| Email System          | 5      | 20              |
| Dashboard & Analytics | 7      | 27              |
| Bank Reconciliation   | 7      | 30              |
| Performance           | 5      | 16              |
| Testing & QA          | 3      | 15              |
| Documentation         | 3      | 16              |
| Deployment            | 3      | 9               |
| **Total**             | **59** | **234 hours**   |

### Estimated Duration by Week

| Week      | Focus                     | Hours                     |
| --------- | ------------------------- | ------------------------- |
| 1         | Security + User/Roles     | 39                        |
| 2         | Multi-currency            | 20                        |
| 3-5       | Invoice Management        | 42                        |
| 6         | Email System              | 20                        |
| 7-8       | Dashboard & Analytics     | 27                        |
| 9-10      | Bank Reconciliation       | 30                        |
| 11        | Performance               | 16                        |
| 12-13     | Testing, Docs, Deployment | 40                        |
| **Total** |                           | **234 hours (~13 weeks)** |

---

## Parallel Execution Opportunities

### Week 1 [P] Opportunities

- SEC-001, SEC-002, SEC-003 can run partially in parallel
- USER-001 can run while security tasks progress

### Week 2 [P] Opportunities

- CURR-001, CURR-002, CURR-003 can run in parallel after CURR-001

### Weeks 3-5 [P] Opportunities

- INV-001, INV-002 can run in parallel
- INV-004 can start after INV-002
- INV-003 independent of INV-002

### Week 6 [P] Opportunities

- EMAIL-001, EMAIL-002 can run in parallel
- EMAIL-003, EMAIL-004 can run in parallel

### Weeks 7-8 [P] Opportunities

- DASH-001, DASH-002 can run in parallel
- DASH-003 can start after DASH-002
- DASH-004, DASH-005 can run in parallel

### Weeks 9-10 [P] Opportunities

- BANK-001, BANK-002 can run in parallel
- BANK-003 after BANK-002
- BANK-004, BANK-005 can run in parallel

### Week 11 [P] Opportunities

- PERF-001 through PERF-005 can all run in parallel (independent)

---

## Next Steps

1. **Review** this task breakdown
2. **Clarify** any questions with stakeholder
3. **Prioritize** tasks by dependency
4. **Begin implementation** with Phase 4.1 tasks
5. **Track progress** daily

---

_Tasks Version: 1.0_
_Created: 2026-02-22_
_Last Updated: 2026-02-22_
