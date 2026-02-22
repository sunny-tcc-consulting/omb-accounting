# Phase 5: SQLite Backend Implementation - Task Breakdown

## Task 5.1: Database Setup

- [ ] 5.1.1 Install dependencies (better-sqlite3, bcrypt, jsonwebtoken)
- [ ] 5.1.2 Create database abstraction interface (`Database` interface in `lib/database/database.ts`)
- [ ] 5.1.3 Implement `SQLiteDatabase` class (`lib/database/sqlite.ts`)
- [ ] 5.1.4 Create database schema migration (`lib/database/migrations.ts`)
- [ ] 5.1.5 Set up database connection management (`lib/database/database.ts`)
- [ ] 5.1.6 Create seed data script (`lib/database/seed.ts`)
- [ ] 5.1.7 Update `.gitignore` to exclude `data/omb-accounting.db`
- [ ] 5.1.8 Create environment variables for database config (`.env.local`)

**Files to create:**

- `src/lib/database/database.ts`
- `src/lib/database/sqlite.ts`
- `src/lib/database/migrations.ts`
- `src/lib/database/seed.ts`
- `src/lib/types/database.ts`

**Tests to create:**

- `src/lib/database/__tests__/database.test.ts`
- `src/lib/database/__tests__/sqlite.test.ts`

---

## Task 5.2: User Authentication

- [ ] 5.2.1 Create users table in migration (`users` table with id, name, email, password_hash, role, timestamps)
- [ ] 5.2.2 Create user repository (`src/lib/repositories/user-repository.ts`)
- [ ] 5.2.3 Implement password hashing utility (`src/lib/utils/password.ts`)
- [ ] 5.2.4 Implement JWT token utilities (`src/lib/utils/jwt.ts`)
- [ ] 5.2.5 Create auth service (`src/lib/services/auth-service.ts`)
- [ ] 5.2.6 Create login API endpoint (`POST /api/auth/login`)
- [ ] 5.2.7 Create logout API endpoint (`POST /api/auth/logout`)
- [ ] 5.2.8 Add authentication middleware (`src/lib/middleware/auth.ts`)
- [ ] 5.2.9 Create user type definitions (`src/lib/types/database.ts`)

**Files to create:**

- `src/lib/repositories/user-repository.ts`
- `src/lib/services/auth-service.ts`
- `src/lib/middleware/auth.ts`
- `src/lib/utils/password.ts`
- `src/lib/utils/jwt.ts`
- `src/lib/types/user.ts`

**Tests to create:**

- `src/lib/repositories/__tests__/user-repository.test.ts`
- `src/lib/services/__tests__/auth-service.test.ts`
- `src/lib/utils/__tests__/password.test.ts`
- `src/lib/utils/__tests__/jwt.test.ts`

---

## Task 5.3: Customer Management

- [ ] 5.3.1 Create customers table in migration (`customers` table with id, name, email, phone, address, timestamps)
- [ ] 5.3.2 Create customer repository (`src/lib/repositories/customer-repository.ts`)
- [ ] 5.3.3 Create customer service (`src/lib/services/customer-service.ts`)
- [ ] 5.3.4 Add customer validation schema (Zod schema)
- [ ] 5.3.5 Update existing customer API routes to use repository
- [ ] 5.3.6 Add audit logging to customer operations
- [ ] 5.3.7 Create customer API endpoints (GET/POST/PUT/DELETE)

**Files to modify:**

- `src/app/api/customers/route.ts`
- `src/app/api/customers/[id]/route.ts`

**Files to create:**

- `src/lib/repositories/customer-repository.ts`
- `src/lib/services/customer-service.ts`
- `src/lib/validations/customer.validation.ts`

**Tests to create:**

- `src/lib/repositories/__tests__/customer-repository.test.ts`
- `src/lib/services/__tests__/customer-service.test.ts`

---

## Task 5.4: Quotation & Invoice Persistence

### Quotation

- [ ] 5.4.1 Create quotations table in migration (`quotations` table with id, customer_id, quotation_number, status, total_amount, timestamps)
- [ ] 5.4.2 Create quotation repository (`src/lib/repositories/quotation-repository.ts`)
- [ ] 5.4.3 Create quotation service (`src/lib/services/quotation-service.ts`)
- [ ] 5.4.4 Add quotation validation schema
- [ ] 5.4.5 Update quotation API routes to use repository
- [ ] 5.4.6 Add audit logging to quotation operations

### Invoice

- [ ] 5.4.7 Create invoices table in migration (`invoices` table with id, customer_id, invoice_number, quotation_id, status, total_amount, amount_paid, due_date, timestamps)
- [ ] 5.4.8 Create invoice repository (`src/lib/services/invoice-repository.ts`) - [P] Can start now
- [ ] 5.4.9 Create invoice service (`src/lib/services/invoice-service.ts`) - [P] Can start now
- [ ] 5.4.10 Add invoice validation schema - [P] Can start now
- [ ] 5.4.11 Update invoice API routes to use repository - [P] Can start now
- [ ] 5.4.12 Add audit logging to invoice operations - [P] Can start now

**Files to modify:**

- `src/app/api/quotations/route.ts`
- `src/app/api/quotations/[id]/route.ts`
- `src/app/api/invoices/route.ts`
- `src/app/api/invoices/[id]/route.ts`

**Files to create:**

- `src/lib/repositories/quotation-repository.ts`
- `src/lib/repositories/invoice-repository.ts`
- `src/lib/services/quotation-service.ts`
- `src/lib/services/invoice-service.ts`
- `src/lib/validations/quotation.validation.ts`
- `src/lib/validations/invoice.validation.ts`

**Tests to create:**

- `src/lib/repositories/__tests__/quotation-repository.test.ts`
- `src/lib/repositories/__tests__/invoice-repository.test.ts`
- `src/lib/services/__tests__/quotation-service.test.ts`
- `src/lib/services/__tests__/invoice-service.test.ts`

---

## Task 5.5: Journal Entry & Bank Reconciliation

### Journal Entry

- [ ] 5.5.1 Create journal entries table in migration (`journal_entries` table with id, description, debit, credit, account_id, transaction_date, timestamps)
- [ ] 5.5.2 Create journal entry repository (`src/lib/repositories/journal-entry-repository.ts`)
- [ ] 5.5.3 Create journal entry service (`src/lib/services/journal-entry-service.ts`)
- [ ] 5.5.4 Add journal entry validation schema
- [ ] 5.5.5 Update journal entry API routes to use repository

### Bank Reconciliation

- [ ] 5.5.6 Create bank accounts table in migration (`bank_accounts` table with id, name, account_number, bank_name, balance, currency, timestamps)
- [ ] 5.5.7 Create bank statements table in migration (`bank_statements` table with id, bank_account_id, statement_number, statement_date, closing_balance, file_path, status, timestamps)
- [ ] 5.5.8 Create bank transactions table in migration (`bank_transactions` table with id, statement_id, transaction_date, description, amount, type, status, matched_to_journal_entry_id)
- [ ] 5.5.9 Create bank repository (`src/lib/repositories/bank-repository.ts`)
- [ ] 5.5.10 Create bank service (`src/lib/services/bank-service.ts`)
- [ ] 5.5.11 Add bank validation schema
- [ ] 5.5.12 Update bank API routes to use repository
- [ ] 5.5.13 Add audit logging to bank operations

**Files to modify:**

- `src/app/api/bank/accounts/route.ts`
- `src/app/api/bank/accounts/[id]/route.ts`
- `src/app/api/bank/transactions/route.ts`
- `src/app/api/bank/transactions/[id]/route.ts`
- `src/app/api/bank/reconciliation/route.ts`
- `src/app/api/bank/reconciliation/report/route.ts`

**Files to create:**

- `src/lib/repositories/journal-entry-repository.ts`
- `src/lib/services/journal-entry-service.ts`
- `src/lib/validations/journal-entry.validation.ts`
- `src/lib/validations/bank.validation.ts`

**Tests to create:**

- `src/lib/repositories/__tests__/journal-entry-repository.test.ts`
- `src/lib/repositories/__tests__/bank-repository.test.ts`
- `src/lib/services/__tests__/journal-entry-service.test.ts`
- `src/lib/services/__tests__/bank-service.test.ts`

---

## Task 5.6: Audit Logging

- [ ] 5.6.1 Create audit logs table in migration (`audit_logs` table with id, user_id, operation, table_name, record_id, changes, ip_address, user_agent, timestamps)
- [ ] 5.6.2 Create audit log repository (`src/lib/repositories/audit-log-repository.ts`)
- [ ] 5.6.3 Create audit log service (`src/lib/services/audit-log-service.ts`)
- [ ] 5.6.4 Add logging middleware for API routes
- [ ] 5.6.5 Update all repositories to log operations
- [ ] 5.6.6 Create audit log API endpoints (GET /api/audit-logs)
- [ ] 5.6.7 Add IP address and user agent tracking

**Files to create:**

- `src/lib/repositories/audit-log-repository.ts`
- `src/lib/services/audit-log-service.ts`
- `src/lib/middleware/audit.ts`
- `src/lib/validations/audit-log.validation.ts`

**Tests to create:**

- `src/lib/repositories/__tests__/audit-log-repository.test.ts`
- `src/lib/services/__tests__/audit-log-service.test.ts`

---

## Task 5.7: API Backward Compatibility

- [ ] 5.7.1 Test all existing customer API routes
- [ ] 5.7.2 Test all existing invoice API routes
- [ ] 5.7.3 Test all existing quotation API routes
- [ ] 5.7.4 Test all existing bank API routes
- [ ] 5.7.5 Verify response formats match existing structure
- [ ] 5.7.6 Verify error handling is consistent
- [ ] 5.7.7 Fix any breaking changes
- [ ] 5.7.8 Document any API changes

---

## Task 5.8: Testing

- [ ] 5.8.1 Run all existing tests to ensure backward compatibility
- [ ] 5.8.2 Write unit tests for all repositories
- [ ] 5.8.3 Write unit tests for all services
- [ ] 5.8.4 Write integration tests for API routes
- [ ] 5.8.5 Test data migration script
- [ ] 5.8.6 Test database connection management
- [ ] 5.8.7 Test authentication flow
- [ ] 5.8.8 Test audit logging

---

## Task 5.9: Documentation

- [ ] 5.9.1 Update API documentation with new endpoints
- [ ] 5.9.2 Document database schema
- [ ] 5.9.3 Document migration process
- [ ] 5.9.4 Create developer guide for database operations
- [ ] 5.9.5 Update README with backend setup instructions
- [ ] 5.9.6 Document environment variables

---

## Task 5.10: Final Polish

- [ ] 5.10.1 Clean up unused code
- [ ] 5.10.2 Remove mock data files (now using database)
- [ ] 5.10.3 Update any remaining references to mock data
- [ ] 5.10.4 Run final test suite
- [ ] 5.10.5 Generate build
- [ ] 5.10.6 Create summary of changes

---

## Task Dependencies

```
Task 5.1 (Database Setup) must complete before:
  - Task 5.2 (User Authentication)
  - Task 5.3 (Customer Management)
  - Task 5.4 (Quotation & Invoice)
  - Task 5.5 (Journal Entry & Bank)
  - Task 5.6 (Audit Logging)

Task 5.2 (User Authentication) must complete before:
  - Task 5.6 (Audit Logging) - for user tracking

Task 5.3 (Customer Management) must complete before:
  - Task 5.4 (Quotation & Invoice) - for foreign keys

Task 5.4 (Quotation & Invoice) must complete before:
  - Task 5.5 (Journal Entry & Bank) - for integration

Task 5.5 (Journal Entry & Bank) must complete before:
  - Task 5.6 (Audit Logging) - for comprehensive logging
```

## Parallel Execution

Tasks marked with [P] can be executed in parallel:

- Task 5.4.8, 5.4.9, 5.4.10, 5.4.11, 5.4.12 (Invoice operations)
- Task 5.3.1, 5.3.2, 5.3.3, 5.3.4, 5.3.5, 5.3.6, 5.3.7 (Customer operations)
