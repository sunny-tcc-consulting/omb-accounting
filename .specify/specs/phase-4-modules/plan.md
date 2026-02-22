# Phase 4: Technical Implementation Plan

## Project: omb-accounting

## Phase: 4 - Multi-Module Enhancement

## Created: 2026-02-22

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages: /dashboard, /invoices, /reconciliation, /settings, etc. │
│  Components: shadcn/ui + custom modules                         │
│  State: React Context + Local Storage                           │
│  Charts: Recharts                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js API)                      │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/invoices, /api/reports, /api/users, etc.          │
│  Auth: NextAuth.js (or custom JWT)                              │
│  Validation: Zod                                                │
│  Rate Limiting: Upstash Redis                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Services: InvoiceService, DashboardService, BankService        │
│  Email: Nodemailer                                              │
│  PDF: jsPDF                                                     │
│  Currency: ExchangeRate-API integration                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL + Prisma)                 │
├─────────────────────────────────────────────────────────────────┤
│  Tables: invoices, customers, users, roles, permissions,        │
│          accounts, transactions, exchange_rates, activities     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Integration

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Invoice    │────▶│   Payment    │────▶│     Bank     │
│  Management  │     │   Tracking   │     │ Reconciliation│
└──────────────┘     └──────────────┘     └──────────────┘
       │                                        │
       │                                        │
       ▼                                        ▼
┌──────────────┐                       ┌──────────────┐
│    Email     │◀──────────────────────│  Dashboard   │
│  Templates   │                       │  Analytics   │
└──────────────┘                       └──────────────┘
       │                                        │
       │                                        │
       ▼                                        ▼
┌──────────────┐                       ┌──────────────┐
│   User &     │                       │ Multi-currency│
│    Roles     │                       │   Support    │
└──────────────┘                       └──────────────┘
```

---

## 2. Data Models

### 2.1 Invoice Module

```typescript
// src/types/invoice.ts

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  exchangeRate: number;
  baseCurrencyTotal: number;
  notes?: string;
  terms?: string;
  templateId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  sortOrder: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "other";
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface RecurringInvoice {
  id: string;
  customerId: string;
  invoiceTemplateId: string;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate?: Date;
  nextGenerationDate: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceEmailLog {
  id: string;
  invoiceId: string;
  recipientEmail: string;
  subject: string;
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}
```

### 2.2 Dashboard Module

```typescript
// src/types/dashboard.ts

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  overdueInvoices: number;
  overdueAmount: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowData {
  date: Date;
  operatingInflow: number;
  operatingOutflow: number;
  investingInflow: number;
  investingOutflow: number;
  financingInflow: number;
  financingOutflow: number;
  netCashFlow: number;
  runningBalance: number;
}

export interface FinancialRatios {
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  healthScore: number;
}

export interface CustomerAnalytics {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
  averagePaymentDays: number;
  paymentRate: number;
  lastInvoiceDate: Date;
}

export interface VendorAnalytics {
  vendorId: string;
  vendorName: string;
  totalExpenses: number;
  invoiceCount: number;
  averagePaymentDays: number;
  lastInvoiceDate: Date;
}
```

### 2.3 Bank Reconciliation Module

```typescript
// src/types/bank.ts

export type ReconciliationStatus =
  | "pending"
  | "matched"
  | "unmatched"
  | "disputed";

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  openingBalance: number;
  closingBalance: number;
  lastReconciledDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankStatementImport {
  id: string;
  bankAccountId: string;
  fileName: string;
  fileType: "csv" | "qif" | "ofx";
  importDate: Date;
  totalRecords: number;
  importedBy: string;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
}

export interface BankTransaction {
  id: string;
  importId: string;
  bankAccountId: string;
  transactionDate: Date;
  description: string;
  amount: number;
  type: "credit" | "debit";
  referenceNumber?: string;
  status: ReconciliationStatus;
  matchedTransactionId?: string;
  matchedDate?: Date;
  createdAt: Date;
}

export interface BookTransaction {
  id: string;
  accountId: string;
  transactionDate: Date;
  description: string;
  amount: number;
  type: "credit" | "debit";
  referenceType: "invoice" | "journal" | "payment" | "other";
  referenceId: string;
  isReconciled: boolean;
  matchedBankTransactionId?: string;
  createdAt: Date;
}

export interface Reconciliation {
  id: string;
  bankAccountId: string;
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  clearedTransactions: number;
  unmatchedTransactions: number;
  difference: number;
  status: "draft" | "completed" | "approved";
  reconciledBy: string;
  reconciledAt?: Date;
  createdAt: Date;
}
```

### 2.4 Multi-currency Module

```typescript
// src/types/currency.ts

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CurrencyBalance {
  accountId: string;
  currency: string;
  originalBalance: number;
  exchangeRate: number;
  baseCurrencyBalance: number;
  asOfDate: Date;
}

export interface CurrencyGainLoss {
  id: string;
  accountId: string;
  currency: string;
  originalAmount: number;
  exchangeRate: number;
  baseCurrencyAmount: number;
  previousRate: number;
  gainLoss: number;
  type: "realized" | "unrealized";
  transactionId?: string;
  recordedAt: Date;
}
```

### 2.5 User & Roles Module

```typescript
// src/types/user.ts

export type UserStatus = "active" | "inactive" | "locked";

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  lastLoginAt?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  passwordHash: string;
  passwordChangedAt: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notificationEmail: boolean;
  notificationInApp: boolean;
  emailDigest: "none" | "daily" | "weekly";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: "create" | "read" | "update" | "delete";
  description: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  grantedAt: Date;
  grantedBy: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}
```

### 2.6 Email/Notification Module

```typescript
// src/types/notification.ts

export type EmailStatus = "pending" | "sent" | "failed" | "bounced";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface EmailTemplate {
  id: string;
  name: string;
  category: "invoice" | "payment" | "reminder" | "quotation" | "general";
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailQueue {
  id: string;
  templateId?: string;
  toEmail: string;
  ccEmail?: string;
  bccEmail?: string;
  subject: string;
  body: string;
  priority: "low" | "normal" | "high";
  status: EmailStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: Date;
}

export interface EmailConfiguration {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: "ssl" | "tls" | "none";
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  category: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  frequency: "immediate" | "daily" | "weekly";
}
```

---

## 3. API Routes

### 3.1 Invoice Routes

```
GET    /api/invoices              - List invoices (paginated, filtered)
GET    /api/invoices/:id          - Get single invoice
POST   /api/invoices              - Create invoice
PUT    /api/invoices/:id          - Update invoice
DELETE /api/invoices/:id          - Delete invoice
POST   /api/invoices/:id/send     - Send invoice
POST   /api/invoices/:id/duplicate - Duplicate invoice
GET    /api/invoices/:id/payments - Get payments
POST   /api/invoices/:id/payments - Add payment
GET    /api/invoices/:id/pdf      - Generate PDF

GET    /api/invoices/recurring    - List recurring
POST   /api/invoices/recurring    - Create recurring
PUT    /api/invoices/recurring/:id - Update recurring
DELETE /api/invoices/recurring/:id - Delete recurring
POST   /api/invoices/recurring/:id/toggle - Toggle active
```

### 3.2 Dashboard Routes

```
GET    /api/dashboard/metrics     - Get key metrics
GET    /api/dashboard/revenue     - Get revenue data
GET    /api/dashboard/expenses    - Get expense data
GET    /api/dashboard/cashflow    - Get cash flow data
GET    /api/dashboard/ratios      - Get financial ratios
GET    /api/dashboard/customers   - Get customer analytics
GET    /api/dashboard/vendors     - Get vendor analytics
```

### 3.3 Bank Reconciliation Routes

```
GET    /api/bank/accounts         - List bank accounts
POST   /api/bank/accounts         - Create bank account
PUT    /api/bank/accounts/:id     - Update bank account
DELETE /api/bank/accounts/:id     - Delete bank account

POST   /api/bank/import           - Import bank statement
GET    /api/bank/import/:id       - Get import status
GET    /api/bank/transactions     - Get bank transactions
PUT    /api/bank/transactions/:id - Update transaction

POST   /api/bank/match            - Match transactions
POST   /api/bank/match/auto       - Auto-match
POST   /api/bank/match/manual     - Manual match
POST   /api/bank/match/unmatch    - Unmatch

GET    /api/bank/reconciliation   - Get reconciliation
POST   /api/bank/reconciliation   - Create reconciliation
PUT    /api/bank/reconciliation/:id - Update reconciliation
GET    /api/bank/reconciliation/:id/report - Get report
```

### 3.4 Currency Routes

```
GET    /api/currency              - List currencies
POST   /api/currency              - Add currency
PUT    /api/currency/:code        - Update currency

GET    /api/currency/rates        - List exchange rates
POST   /api/currency/rates        - Add exchange rate
PUT    /api/currency/rates/:id    - Update exchange rate
DELETE /api/currency/rates/:id    - Delete exchange rate
POST   /api/currency/rates/fetch  - Fetch from API
GET    /api/currency/convert      - Convert amount
```

### 3.5 User & Roles Routes

```
GET    /api/users                 - List users
POST   /api/users                 - Create user
GET    /api/users/:id             - Get user
PUT    /api/users/:id             - Update user
DELETE /api/users/:id             - Delete user
POST   /api/users/:id/activate    - Activate user
POST   /api/users/:id/deactivate  - Deactivate user
POST   /api/users/:id/reset-password - Reset password

GET    /api/roles                 - List roles
POST   /api/roles                 - Create role
PUT    /api/roles/:id             - Update role
DELETE /api/roles/:id             - Delete role
GET    /api/roles/:id/permissions - Get permissions
PUT    /api/roles/:id/permissions - Update permissions

GET    /api/permissions           - List all permissions
```

### 3.6 Activity & Session Routes

```
GET    /api/activity              - List activities
GET    /api/activity/user/:userId - Get user activities
GET    /api/sessions              - List active sessions
DELETE /api/sessions/:id          - Terminate session
DELETE /api/sessions/user/:userId - Terminate all user sessions
```

### 3.7 Email Routes

```
GET    /api/email/templates       - List templates
POST   /api/email/templates       - Create template
GET    /api/email/templates/:id   - Get template
PUT    /api/email/templates/:id   - Update template
DELETE /api/email/templates/:id   - Delete template
POST   /api/email/templates/:id/test - Test template

GET    /api/email/config          - Get email config
PUT    /api/email/config          - Update email config
POST   /api/email/test            - Send test email

GET    /api/email/queue           - Get email queue
DELETE /api/email/queue/:id       - Delete queued email
POST   /api/email/send            - Send email directly
```

### 3.8 Notification Routes

```
GET    /api/notifications         - List notifications
PUT    /api/notifications/read    - Mark all read
PUT    /api/notifications/:id/read - Mark single read
DELETE /api/notifications/:id     - Delete notification

GET    /api/notifications/preferences - Get preferences
PUT    /api/notifications/preferences - Update preferences
```

---

## 4. Component Architecture

### 4.1 Invoice Components

```
src/components/invoices/
├── InvoiceList.tsx           # Invoice listing with filters
├── InvoiceForm.tsx           # Create/edit invoice form
├── InvoiceLineItems.tsx      # Line items editor
├── InvoicePreview.tsx        # Invoice preview modal
├── InvoiceStatusBadge.tsx    # Status display
├── InvoiceActions.tsx        # Action buttons
├── InvoicePaymentForm.tsx    # Payment entry
├── InvoicePaymentHistory.tsx # Payment history
├── InvoiceEmailDialog.tsx    # Email composition
├── RecurringInvoiceList.tsx  # Recurring list
└── RecurringInvoiceForm.tsx  # Recurring setup
```

### 4.2 Dashboard Components

```
src/components/dashboard/
├── MetricsCards.tsx          # Key metric cards
├── RevenueChart.tsx          # Revenue line chart
├── ExpenseChart.tsx          # Expense charts
├── CashFlowChart.tsx         # Cash flow visualization
├── FinancialRatios.tsx       # Ratio indicators
├── CustomerTable.tsx         # Top customers
├── VendorTable.tsx           # Top vendors
├── ActivityFeed.tsx          # Recent activity
└── QuickActions.tsx          # Quick action buttons
```

### 4.3 Bank Reconciliation Components

```
src/components/bank/
├── BankAccountList.tsx       # Bank accounts
├── BankAccountForm.tsx       # Account setup
├── ImportDialog.tsx          # CSV import
├── ImportPreview.tsx         # Import preview
├── TransactionList.tsx       # Transaction lists
├── MatchingInterface.tsx     # Manual match UI
├── ReconciliationReport.tsx  # Report display
└── UnmatchedList.tsx         # Unmatched items
```

### 4.4 Currency Components

```
src/components/currency/
├── CurrencySelector.tsx      # Currency dropdown
├── ExchangeRateTable.tsx     # Rate display
├── ExchangeRateForm.tsx      # Rate entry
├── CurrencyConverter.tsx     # Quick converter
└── MultiCurrencyBadge.tsx    # Currency indicator
```

### 4.5 User & Roles Components

```
src/components/settings/
├── UserList.tsx              # User listing
├── UserForm.tsx              # User form
├── RoleList.tsx              # Role listing
├── RoleForm.tsx              # Role form
├── PermissionMatrix.tsx      # Permission grid
├── ActivityLog.tsx           # Activity list
├── SessionList.tsx           # Active sessions
├── PasswordResetDialog.tsx   # Password reset
└── TwoFactorSetup.tsx        # 2FA setup
```

### 4.6 Email/Notification Components

```
src/components/email/
├── TemplateList.tsx          # Template list
├── TemplateForm.tsx          # Template editor
├── TemplatePreview.tsx       # Template preview
├── EmailConfigForm.tsx       # SMTP config
├── EmailQueueList.tsx        # Queue status
└── TestEmailDialog.tsx       # Test email

src/components/notifications/
├── NotificationBell.tsx      # Notification icon
├── NotificationList.tsx      # Notification dropdown
├── NotificationItem.tsx      # Individual item
└── NotificationPreferences.tsx # Settings
```

---

## 5. Implementation Phases

### Phase 4.1: Foundation & Security (Week 1)

1. Security headers implementation
2. Input validation & sanitization
3. User & Roles core (users, roles, permissions)
4. Authentication flow updates
5. Activity logging

### Phase 4.2: Multi-currency (Week 2)

1. Currency management
2. Exchange rate system
3. Multi-currency transactions
4. Currency conversion utilities
5. Multi-currency reports

### Phase 4.3: Invoice Management (Weeks 3-5)

1. Invoice CRUD
2. Line items & calculations
3. Invoice PDF generation
4. Payment tracking
5. Recurring invoices
6. Invoice status workflow

### Phase 4.4: Email System (Week 6)

1. SMTP configuration
2. Email templates system
3. Invoice email integration
4. Notification center
5. User preferences

### Phase 4.5: Dashboard & Analytics (Weeks 7-8)

1. Metrics calculation
2. Chart components
3. Dashboard layout
4. Financial ratios
5. Customer/vendor analytics

### Phase 4.6: Bank Reconciliation (Weeks 9-10)

1. Bank account management
2. CSV import with mapping
3. Auto-matching algorithm
4. Manual matching interface
5. Reconciliation reports

### Phase 4.7: Performance (Week 11)

1. Code splitting
2. Lazy loading
3. Query optimization
4. Caching strategies
5. Bundle optimization

### Phase 4.8: Final Polish (Weeks 12-13)

1. Integration testing
2. Security audit
3. Performance testing
4. Documentation
5. Bug fixes

---

## 6. Dependencies & External Services

### 6.1 New Dependencies

```json
{
  "nodemailer": "^6.9.0", // Email sending
  "@react-email/components": "^0.0.0", // Email templates
  "recharts": "^2.10.0", // Charts (already in use)
  "date-fns": "^3.0.0", // Date utilities
  "zod": "^3.22.0", // Validation (already in use)
  "@upstash/ratelimit": "^1.0.0", // Rate limiting
  "uuid": "^9.0.0" // ID generation
}
```

### 6.2 External Services

- **SMTP**: Any SMTP server (Gmail, SendGrid, Mailgun)
- **Exchange Rates**: ExchangeRate-API (free tier available)
- **Time Zones**: Built-in Intl API

---

## 7. Database Schema Changes

### New Tables

```sql
-- Invoice tables
CREATE TABLE invoices (...);
CREATE TABLE invoice_line_items (...);
CREATE TABLE invoice_payments (...);
CREATE TABLE recurring_invoices (...);
CREATE TABLE invoice_email_logs (...);

-- Bank tables
CREATE TABLE bank_accounts (...);
CREATE TABLE bank_statement_imports (...);
CREATE TABLE bank_transactions (...);
CREATE TABLE reconciliations (...);

-- Currency tables
CREATE TABLE currencies (...);
CREATE TABLE exchange_rates (...);
CREATE TABLE currency_balances (...);
CREATE TABLE currency_gain_losses (...);

-- User tables
CREATE TABLE users (...);
CREATE TABLE roles (...);
CREATE TABLE permissions (...);
CREATE TABLE role_permissions (...);
CREATE TABLE user_activities (...);
CREATE TABLE user_sessions (...);

-- Notification tables
CREATE TABLE email_templates (...);
CREATE TABLE email_queue (...);
CREATE TABLE email_configurations (...);
CREATE TABLE notifications (...);
CREATE TABLE notification_preferences (...);
```

### Modified Tables

- `customers` - Add currency, payment terms fields
- `accounts` - Add currency field
- `transactions` - Add currency, exchange rate fields
- `journal_entries` - Add currency fields

---

## 8. Testing Strategy

### Unit Tests

- Invoice calculations (totals, taxes)
- Currency conversion accuracy
- Permission checks
- Input validation

### Integration Tests

- Invoice → Payment → Bank reconciliation flow
- Email sending with templates
- User login → Role permission verification
- Multi-currency transaction recording

### E2E Tests

- Complete invoice workflow
- Bank reconciliation import and match
- Dashboard data display

---

## 9. Security Considerations

### Authentication

- JWT with refresh tokens
- Password hashing: bcrypt (cost factor 12)
- Session management with secure cookies

### Authorization

- Role-based access control
- Resource-level permissions
- API route protection

### Data Protection

- Input sanitization on all inputs
- SQL injection prevention via Prisma
- XSS prevention with React escaping
- Sensitive data masking in logs

### Infrastructure

- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)
- Rate limiting on all APIs
- Audit logging

---

## 10. Performance Targets

| Metric                  | Target          |
| ----------------------- | --------------- |
| Page Load Time          | < 3 seconds     |
| API Response Time       | < 500ms         |
| Dashboard Render        | < 2 seconds     |
| Initial Bundle Size     | < 500KB gzipped |
| Database Query          | < 100ms         |
| Email Send              | < 2 seconds     |
| Bank Import (1000 rows) | < 10 seconds    |

---

## 11. Documentation Requirements

### User Documentation

- Invoice management guide
- Dashboard interpretation guide
- Bank reconciliation walkthrough
- User management guide
- Email configuration guide

### Developer Documentation

- API documentation
- Data model reference
- Component library
- Security guidelines
- Performance optimization guide

---

## 12. Risks & Mitigation

| Risk                     | Impact          | Mitigation              |
| ------------------------ | --------------- | ----------------------- |
| Feature creep            | Delay           | Strict scope control    |
| Integration issues       | Blocker         | Incremental integration |
| Performance regression   | User experience | Early optimization      |
| Security vulnerabilities | Critical        | Security-first approach |
| Email deliverability     | User experience | SMTP testing            |

---

_Plan Version: 1.0_
_Last Updated: 2026-02-22_
_Next Review: Before implementation start_
