# Phase 5: SQLite Backend Implementation - Technical Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (Next.js API)                │
│  /api/customers, /api/invoices, /api/auth, etc.             │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Service Layer (Business Logic)            │
│  CustomerService, InvoiceService, BankService, etc.         │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Repository Layer (Data Access)                 │
│  CustomerRepository, InvoiceRepository, etc.                │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Database Abstraction Layer                     │
│  Database Interface → SQLiteDatabase Implementation         │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    SQLite Database                          │
│  Tables: users, customers, quotations, invoices, etc.       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Database

- **Primary**: SQLite3 (better-sqlite3 package)
- **Features**: ACID compliance, file-based, no server required
- **Location**: `data/omb-accounting.db`
- **Development**: In-memory SQLite (for faster testing)

### ORM / Query Builder

- **Choice**: Native SQL with better-sqlite3
- **Reason**: Simpler than Prisma for this use case, better performance
- **Alternative**: Prisma (if needed later for migrations)

### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Library**: jsonwebtoken
- **Secret**: Environment variable (JWT_SECRET)
- **Duration**: 30 minutes (configurable)

### Validation

- **Library**: Zod (already used in project)
- **Usage**: Validate all inputs before database operations

### Password Hashing

- **Library**: bcrypt
- **Rounds**: 10 (standard)

## Database Schema

### Tables Structure

```sql
-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Customers
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Quotations
CREATE TABLE quotations (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    quotation_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    total_amount REAL NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Invoices
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    quotation_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount REAL NOT NULL,
    amount_paid REAL NOT NULL DEFAULT 0,
    due_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL
);

-- Journal Entries
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    debit REAL NOT NULL DEFAULT 0,
    credit REAL NOT NULL DEFAULT 0,
    account_id TEXT NOT NULL,
    transaction_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Bank Accounts
CREATE TABLE bank_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    bank_name TEXT,
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'HKD',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Bank Statements
CREATE TABLE bank_statements (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT NOT NULL,
    statement_number TEXT NOT NULL,
    statement_date INTEGER NOT NULL,
    closing_balance REAL NOT NULL,
    file_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
);

-- Bank Transactions
CREATE TABLE bank_transactions (
    id TEXT PRIMARY KEY,
    statement_id TEXT NOT NULL,
    transaction_date INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
    status TEXT NOT NULL DEFAULT 'unmatched',
    matched_to_journal_entry_id TEXT,
    FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_to_journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL
);

-- Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    changes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_journal_entries_date ON journal_entries(transaction_date);
CREATE INDEX idx_bank_statements_account_id ON bank_statements(bank_account_id);
CREATE INDEX idx_bank_transactions_statement_id ON bank_transactions(statement_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

## Project Structure

```
src/
├── lib/
│   ├── database/
│   │   ├── database.ts              # Database abstraction interface
│   │   ├── sqlite.ts                # SQLiteDatabase implementation
│   │   ├── migrations.ts            # Database migrations
│   │   └── seed.ts                  # Seed initial data
│   ├── repositories/
│   │   ├── customer-repository.ts   # Customer data access
│   │   ├── invoice-repository.ts    # Invoice data access
│   │   ├── quotation-repository.ts  # Quotation data access
│   │   ├── user-repository.ts       # User data access
│   │   ├── journal-entry-repository.ts
│   │   ├── bank-repository.ts
│   │   └── audit-log-repository.ts
│   ├── services/
│   │   ├── auth-service.ts          # Authentication logic
│   │   ├── customer-service.ts      # Customer business logic
│   │   ├── invoice-service.ts       # Invoice business logic
│   │   ├── quotation-service.ts     # Quotation business logic
│   │   └── bank-service.ts          # Bank reconciliation logic
│   └── utils/
│       ├── password.ts              # Password hashing utilities
│       └── jwt.ts                   # JWT token utilities
├── types/
│   └── database.ts                  # Database types
└── app/
    └── api/
        ├── auth/
        │   ├── login/route.ts       # POST /api/auth/login
        │   └── logout/route.ts      # POST /api/auth/logout
        ├── customers/
        │   ├── route.ts             # GET/POST /api/customers
        │   └── [id]/route.ts        # GET/PUT/DELETE /api/customers/[id]
        ├── invoices/
        │   ├── route.ts             # GET/POST /api/invoices
        │   └── [id]/route.ts        # GET/PUT/DELETE /api/invoices/[id]
        └── ...
```

## Implementation Phases

### Phase 5.1: Database Setup

1. Install better-sqlite3 and dependencies
2. Create database abstraction interface
3. Implement SQLiteDatabase class
4. Create database schema (SQL migration)
5. Set up connection management
6. Create seed data script

### Phase 5.2: User Authentication

1. Create users table and user repository
2. Implement password hashing (bcrypt)
3. Implement JWT token generation and validation
4. Create login/logout API endpoints
5. Add session management
6. Add authentication middleware

### Phase 5.3: Customer Management

1. Create customers table and customer repository
2. Create customer service with business logic
3. Update existing customer API routes to use repository
4. Add data validation with Zod
5. Add audit logging for customer operations
6. Create customer CRUD API endpoints

### Phase 5.4: Quotation & Invoice Persistence

1. Create quotations and invoices tables
2. Create repositories for both entities
3. Create services with business logic
4. Update existing API routes
5. Add foreign key relationships
6. Add audit logging
7. Create API endpoints

### Phase 5.5: Journal Entry & Bank Reconciliation

1. Create journal entries and bank tables
2. Create repositories and services
3. Implement bank statement import logic
4. Implement auto-matching algorithm in database
5. Update bank reconciliation API routes
6. Add audit logging

### Phase 5.6: Audit Logging

1. Create audit_logs table
2. Create audit log repository
3. Create audit log service
4. Add logging to all repository operations
5. Create audit log API endpoints
6. Add IP address and user agent tracking

### Phase 5.7: API Backward Compatibility

1. Verify all existing API routes work
2. Test response formats
3. Test error handling
4. Update any broken routes
5. Document API changes (if any)

### Phase 5.8: Testing

1. Write unit tests for repositories
2. Write unit tests for services
3. Write integration tests for API routes
4. Test data migration
5. Test backward compatibility

### Phase 5.9: Documentation

1. Update API documentation
2. Document database schema
3. Document migration process
4. Create developer guide for database operations

## Dependencies

```json
{
  "dependencies": {
    "better-sqlite3": "^9.2.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

## Configuration

```env
# Database
DATABASE_PATH=data/omb-accounting.db
DATABASE_MODE=production  # or development (in-memory)

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=30m  # Token expiry time

# Development
SEED_DATA=true  # Whether to seed initial data
```

## Database Connection Management

```typescript
class Database {
  private static instance: Database;
  private db: DatabaseConnection;

  private constructor() {
    this.db = new SQLiteDatabase(getDatabasePath());
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  getConnection(): DatabaseConnection {
    return this.db;
  }
}
```

## Migration Strategy

1. **Development**: Drop and recreate database (simple)
2. **Production**: Create migration files with `CREATE TABLE IF NOT EXISTS`
3. **Versioning**: Track database schema version
4. **Rollback**: Support schema rollback for development

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns indexed
2. **Connection Pooling**: Use a single connection (SQLite limitation)
3. **Query Optimization**: Use parameterized queries (prevents SQL injection)
4. **Batch Operations**: Use transactions for bulk inserts
5. **Caching**: Consider caching for frequently accessed data

## Security Considerations

1. **SQL Injection**: Use parameterized queries only
2. **Password Hashing**: Use bcrypt with 10 rounds
3. **Input Validation**: Validate all inputs with Zod
4. **Error Messages**: Don't expose database errors to clients
5. **Environment Variables**: Never hardcode secrets
6. **File Permissions**: Database file should be readable/writable only by application

## Future Extensibility

To support switching to another database (PostgreSQL, MySQL):

1. Create new database implementation (e.g., PostgresDatabase)
2. Implement the same Database interface
3. Keep repositories unchanged
4. Keep services unchanged
5. Switch configuration to use new implementation

## Testing Strategy

1. **Unit Tests**: Test repositories and services in isolation
2. **Integration Tests**: Test API routes with real database
3. **E2E Tests**: Test full user flows
4. **Migration Tests**: Test migration scripts
5. **Performance Tests**: Test query performance
