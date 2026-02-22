# Phase 5: SQLite Backend Implementation

## Overview

Implement a file-based SQLite backend for the omb-accounting application with database abstraction layer to support future database migration.

## User Stories

### US-5.1: Database Abstraction Layer

**As a** developer
**I want** a database abstraction layer that isolates database-specific code
**So that** I can switch between SQLite and other databases (PostgreSQL, MySQL) without changing application logic

**Acceptance Criteria:**

- [ ] Create a `Database` interface defining common operations (CRUD, queries)
- [ ] Implement `SQLiteDatabase` class implementing the interface
- [ ] All data operations go through the abstraction layer
- [ ] Database-specific code is isolated in the implementation
- [ ] Database connection is managed centrally

### US-5.2: User Authentication Persistence

**As a** user
**I want** user authentication to persist across sessions
**So that** I don't need to log in every time I use the application

**Acceptance Criteria:**

- [ ] User credentials stored in SQLite database
- [ ] JWT tokens stored for session management
- [ ] Login API validates credentials against database
- [ ] Session tokens are validated on API requests
- [ ] User sessions expire after configured timeout (30 minutes)

### US-5.3: Customer CRUD Operations

**As a** admin
**I want** to create, read, update, and delete customers
**So that** I can manage customer information in the database

**Acceptance Criteria:**

- [ ] Customer table created in SQLite
- [ ] API endpoints for CRUD operations (createCustomer, getCustomers, updateCustomer, deleteCustomer)
- [ ] Data validation on all inputs
- [ ] Unique constraint on customer email
- [ ] Foreign key relationships maintained

### US-5.4: Quotation Persistence

**As a** admin
**I want** quotations to be stored in the database
**So that** quotation history is preserved

**Acceptance Criteria:**

- [ ] Quotation table created with proper schema
- [ ] Foreign key to customer table
- [ ] Status tracking (draft, sent, accepted, rejected)
- [ ] Timestamps for created/updated dates
- [ ] API endpoints for CRUD operations

### US-5.5: Invoice Persistence

**As a** admin
**I want** invoices to be stored in the database
**So that** invoicing history is preserved

**Acceptance Criteria:**

- [ ] Invoice table created with proper schema
- [ ] Foreign key to customer table
- [ ] Foreign key to quotation table (optional)
- [ ] Status tracking (draft, pending, partial, paid, overdue)
- [ ] Payment tracking (amount paid, payment date)
- [ ] API endpoints for CRUD operations
- [ ] Integration with existing invoice mock data

### US-5.6: Journal Entry Persistence

**As a** accountant
**I want** journal entries to be stored in the database
**So that** double-entry bookkeeping is preserved

**Acceptance Criteria:**

- [ ] JournalEntry table created
- [ ] Debit/Credit balance tracking
- [ ] Account relationships
- [ ] Timestamps
- [ ] API endpoints for CRUD operations
- [ ] Balance validation (total debit = total credit)

### US-5.7: Bank Reconciliation Persistence

**As a** accountant
**I want** bank reconciliation data to be stored
**So that** bank statement matching is preserved

**Acceptance Criteria:**

- [ ] BankAccount table created
- [ ] BankStatement table with file import support
- [ ] BankTransaction table
- [ ] Reconciliation status tracking
- [ ] API endpoints for all operations

### US-5.8: Audit Logging

**As a** system admin
**I want** all database operations to be logged
**So that** I can track changes and maintain audit trail

**Acceptance Criteria:**

- [ ] AuditLog table created
- [ ] All CRUD operations logged with timestamp
- [ ] User ID tracked for each operation
- [ ] Operation type and details recorded
- [ ] API endpoints for querying audit logs

### US-5.9: Data Migration from Mock Data

**As a** developer
**I want** existing mock data to be migrated to the database
**So that** the application has initial data to work with

**Acceptance Criteria:**

- [ ] Migration script created
- [ ] Existing mock data loaded into database tables
- [ ] Data validation during migration
- [ ] Migration script can be run multiple times safely
- [ ] Test data seeded for development

### US-5.10: API Backward Compatibility

**As a** developer
**I want** existing API endpoints to continue working
**So that** frontend integration is not broken

**Acceptance Criteria:**

- [ ] All existing API routes continue to work
- [ ] Response formats remain unchanged
- [ ] Error handling remains consistent
- [ ] No breaking changes to API contracts

## Non-Functional Requirements

### Performance

- Database operations should complete within 100ms for simple CRUD
- Concurrent request handling should be supported
- Indexes created for frequently queried columns

### Security

- SQL injection prevention through parameterized queries
- Password hashing for user credentials (bcrypt)
- Input validation on all database operations
- Row-level security (user can only access their own data)

### Maintainability

- Clear separation of concerns (API → Repository → Database)
- Comprehensive TypeScript type definitions
- Database schema versioning support
- Error handling and logging

### Extensibility

- Database abstraction layer supports multiple database backends
- Repository pattern for data access
- Configuration-based database connection settings
- Easy to add new tables and relationships

## Constraints

- Use SQLite as primary database
- File-based storage in `data/omb-accounting.db`
- Database file should be in `.gitignore`
- Support both development (in-memory) and production (file-based) modes
- No external database dependencies
- All operations must be ACID compliant
