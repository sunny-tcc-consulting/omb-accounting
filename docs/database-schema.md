# Database Schema

Complete database schema documentation for omb-accounting using SQLite.

---

## Overview

The omb-accounting application uses SQLite as its database backend, with a file-based storage system.

### Database Location

```
omb-accounting/data/omb-accounting.db
```

### Database Manager

Located at: `src/lib/database/database.ts`

```typescript
import { DatabaseManager } from "@/lib/database/database";

// Initialize database
const dbManager = new DatabaseManager();

// Get database instance
const db = dbManager.getDatabase();

// Close database connection
dbManager.close();
```

---

## Table Structures

### 1. users

Stores user account information and authentication data.

| Column          | Type    | Constraints      | Description                                  |
| --------------- | ------- | ---------------- | -------------------------------------------- |
| `id`            | TEXT    | PRIMARY KEY      | Unique user identifier (UUID)                |
| `email`         | TEXT    | UNIQUE, NOT NULL | User email address                           |
| `password_hash` | TEXT    | NOT NULL         | Bcrypt hashed password                       |
| `name`          | TEXT    | NOT NULL         | User's full name                             |
| `role`          | TEXT    | NOT NULL         | User role (admin/user/viewer/manager)        |
| `is_active`     | INTEGER | DEFAULT 1        | Account active status (1=active, 0=inactive) |
| `created_at`    | INTEGER | NOT NULL         | Account creation timestamp                   |
| `updated_at`    | INTEGER | NOT NULL         | Last update timestamp                        |

**Indexes**:

- `idx_users_email`: Email for fast lookup

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@omb-accounting.com",
  "password_hash": "$2b$10$...",
  "name": "Administrator",
  "role": "admin",
  "is_active": 1,
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

---

### 2. customers

Stores customer information for business transactions.

| Column       | Type    | Constraints | Description                       |
| ------------ | ------- | ----------- | --------------------------------- |
| `id`         | TEXT    | PRIMARY KEY | Unique customer identifier (UUID) |
| `name`       | TEXT    | NOT NULL    | Customer company name             |
| `email`      | TEXT    | UNIQUE      | Customer email address            |
| `phone`      | TEXT    |             | Customer phone number             |
| `address`    | TEXT    |             | Customer address                  |
| `created_at` | INTEGER | NOT NULL    | Account creation timestamp        |
| `updated_at` | INTEGER | NOT NULL    | Last update timestamp             |

**Indexes**:

- `idx_customers_email`: Email for fast lookup
- `idx_customers_name`: Name for search

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "ABC Company Ltd",
  "email": "abc@company.com",
  "phone": "+85212345678",
  "address": "123 Hong Kong Street",
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/customer-repository.ts`

---

### 3. quotations

Stores quotation documents.

| Column            | Type    | Constraints           | Description                           |
| ----------------- | ------- | --------------------- | ------------------------------------- |
| `id`              | TEXT    | PRIMARY KEY           | Unique quotation identifier (UUID)    |
| `quotationNumber` | TEXT    | UNIQUE, NOT NULL      | Quotation number (QT-YYYY-XXXXX)      |
| `customerId`      | TEXT    | NOT NULL, FOREIGN KEY | Customer ID                           |
| `items`           | TEXT    | NOT NULL              | JSON string of line items             |
| `subtotal`        | REAL    | NOT NULL              | Subtotal before tax                   |
| `tax`             | REAL    | NOT NULL              | Tax amount                            |
| `total`           | REAL    | NOT NULL              | Total amount (subtotal + tax)         |
| `validUntil`      | TEXT    | NOT NULL              | Expiration date                       |
| `status`          | TEXT    | DEFAULT 'draft'       | Status (draft/sent/approved/rejected) |
| `notes`           | TEXT    |                       | Additional notes                      |
| `created_at`      | INTEGER | NOT NULL              | Creation timestamp                    |
| `updated_at`      | INTEGER | NOT NULL              | Last update timestamp                 |

**Indexes**:

- `idx_quotations_number`: Quotation number for lookup
- `idx_quotations_customer`: Customer for filtering
- `idx_quotations_status`: Status for filtering

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "quotationNumber": "QT-2026-0001",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "items": "[{\"description\":\"Consulting\",\"quantity\":10,\"unitPrice\":1000}]",
  "subtotal": 10000.0,
  "tax": 1000.0,
  "total": 11000.0,
  "validUntil": "2026-03-23",
  "status": "draft",
  "notes": "Valid for 30 days",
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/quotation-repository.ts`

---

### 4. invoices

Stores invoice documents.

| Column          | Type    | Constraints           | Description                             |
| --------------- | ------- | --------------------- | --------------------------------------- |
| `id`            | TEXT    | PRIMARY KEY           | Unique invoice identifier (UUID)        |
| `invoiceNumber` | TEXT    | UNIQUE, NOT NULL      | Invoice number (INV-YYYY-XXXXX)         |
| `customerId`    | TEXT    | NOT NULL, FOREIGN KEY | Customer ID                             |
| `items`         | TEXT    | NOT NULL              | JSON string of line items               |
| `subtotal`      | REAL    | NOT NULL              | Subtotal before tax                     |
| `tax`           | REAL    | NOT NULL              | Tax amount                              |
| `total`         | REAL    | NOT NULL              | Total amount (subtotal + tax)           |
| `dueDate`       | TEXT    | NOT NULL              | Due date                                |
| `status`        | TEXT    | DEFAULT 'pending'     | Status (pending/paid/overdue/cancelled) |
| `paidDate`      | TEXT    |                       | Payment date                            |
| `notes`         | TEXT    |                       | Additional notes                        |
| `created_at`    | INTEGER | NOT NULL              | Creation timestamp                      |
| `updated_at`    | INTEGER | NOT NULL              | Last update timestamp                   |

**Indexes**:

- `idx_invoices_number`: Invoice number for lookup
- `idx_invoices_customer`: Customer for filtering
- `idx_invoices_status`: Status for filtering

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "invoiceNumber": "INV-2026-0001",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "items": "[{\"description\":\"Consulting\",\"quantity\":10,\"unitPrice\":1000}]",
  "subtotal": 10000.0,
  "tax": 1000.0,
  "total": 11000.0,
  "dueDate": "2026-03-08",
  "status": "pending",
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/invoice-repository.ts`

---

### 5. journal_entries

Stores general ledger entries for accounting.

| Column          | Type    | Constraints      | Description                            |
| --------------- | ------- | ---------------- | -------------------------------------- |
| `id`            | TEXT    | PRIMARY KEY      | Unique journal entry identifier (UUID) |
| `entryNumber`   | TEXT    | UNIQUE, NOT NULL | Journal entry number (JE-YYYY-XXXXX)   |
| `date`          | TEXT    | NOT NULL         | Entry date                             |
| `description`   | TEXT    | NOT NULL         | Entry description                      |
| `debit`         | REAL    | DEFAULT 0.00     | Debit amount                           |
| `credit`        | REAL    | DEFAULT 0.00     | Credit amount                          |
| `accountId`     | TEXT    | NOT NULL         | Account ID                             |
| `referenceId`   | TEXT    |                  | Reference ID (quotation/invoice ID)    |
| `referenceType` | TEXT    |                  | Reference type (quotation/invoice)     |
| `created_at`    | INTEGER | NOT NULL         | Creation timestamp                     |
| `updated_at`    | INTEGER | NOT NULL         | Last update timestamp                  |

**Indexes**:

- `idx_journal_entries_date`: Date for filtering
- `idx_journal_entries_reference`: Reference for lookup

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "entryNumber": "JE-2026-0001",
  "date": "2026-02-23",
  "description": "Payment received from ABC Company",
  "debit": 11000.0,
  "credit": 0.0,
  "accountId": "acc-123",
  "referenceId": "inv-123",
  "referenceType": "invoice",
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/journal-entry-repository.ts`

---

### 6. bank_accounts

Stores bank account information.

| Column           | Type    | Constraints  | Description                           |
| ---------------- | ------- | ------------ | ------------------------------------- |
| `id`             | TEXT    | PRIMARY KEY  | Unique bank account identifier (UUID) |
| `accountName`    | TEXT    | NOT NULL     | Account name                          |
| `accountNumber`  | TEXT    | NOT NULL     | Account number                        |
| `bankName`       | TEXT    | NOT NULL     | Bank name                             |
| `currentBalance` | REAL    | DEFAULT 0.00 | Current balance                       |
| `isPrimary`      | INTEGER | DEFAULT 0    | Is primary account (1=yes, 0=no)      |
| `created_at`     | INTEGER | NOT NULL     | Creation timestamp                    |
| `updated_at`     | INTEGER | NOT NULL     | Last update timestamp                 |

**Indexes**:

- `idx_bank_accounts_primary`: Primary account lookup

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "accountName": "Business Account",
  "accountNumber": "123-456-789",
  "bankName": "HSBC",
  "currentBalance": 15000.0,
  "isPrimary": 1,
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/bank-account-repository.ts`

---

### 7. bank_statements

Stores bank statement records.

| Column            | Type    | Constraints           | Description                        |
| ----------------- | ------- | --------------------- | ---------------------------------- |
| `id`              | TEXT    | PRIMARY KEY           | Unique statement identifier (UUID) |
| `accountId`       | TEXT    | NOT NULL, FOREIGN KEY | Bank account ID                    |
| `statementNumber` | TEXT    | UNIQUE, NOT NULL      | Statement number                   |
| `periodStart`     | TEXT    | NOT NULL              | Statement period start             |
| `periodEnd`       | TEXT    | NOT NULL              | Statement period end               |
| `openingBalance`  | REAL    | NOT NULL              | Opening balance                    |
| `closingBalance`  | REAL    | NOT NULL              | Closing balance                    |
| `totalDebits`     | REAL    | NOT NULL              | Total debits                       |
| `totalCredits`    | REAL    | NOT NULL              | Total credits                      |
| `uploadedAt`      | INTEGER | NOT NULL              | Upload timestamp                   |
| `created_at`      | INTEGER | NOT NULL              | Creation timestamp                 |
| `updated_at`      | INTEGER | NOT NULL              | Last update timestamp              |

**Indexes**:

- `idx_bank_statements_account`: Account for filtering
- `idx_bank_statements_period`: Period for filtering

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "accountId": "550e8400-e29b-41d4-a716-446655440005",
  "statementNumber": "STM-2026-02-001",
  "periodStart": "2026-02-01",
  "periodEnd": "2026-02-28",
  "openingBalance": 14000.0,
  "closingBalance": 15000.0,
  "totalDebits": 5000.0,
  "totalCredits": 6000.0,
  "uploadedAt": 1708713600000,
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/bank-statement-repository.ts`

---

### 8. bank_transactions

Stores individual bank transactions.

| Column              | Type    | Constraints           | Description                          |
| ------------------- | ------- | --------------------- | ------------------------------------ |
| `id`                | TEXT    | PRIMARY KEY           | Unique transaction identifier (UUID) |
| `accountId`         | TEXT    | NOT NULL, FOREIGN KEY | Bank account ID                      |
| `statementId`       | TEXT    | NOT NULL, FOREIGN KEY | Statement ID                         |
| `transactionNumber` | TEXT    | NOT NULL              | Transaction number                   |
| `amount`            | REAL    | NOT NULL              | Transaction amount                   |
| `type`              | TEXT    | NOT NULL              | Type (credit/debit)                  |
| `description`       | TEXT    | NOT NULL              | Transaction description              |
| `date`              | INTEGER | NOT NULL              | Transaction date                     |
| `status`            | TEXT    | DEFAULT 'pending'     | Status (pending/matched/unmatched)   |
| `referenceId`       | TEXT    |                       | Reference ID (journal entry ID)      |
| `referenceType`     | TEXT    |                       | Reference type (journal entry)       |
| `created_at`        | INTEGER | NOT NULL              | Creation timestamp                   |
| `updated_at`        | INTEGER | NOT NULL              | Last update timestamp                |

**Indexes**:

- `idx_bank_transactions_account`: Account for filtering
- `idx_bank_transactions_date`: Date for filtering
- `idx_bank_transactions_status`: Status for filtering
- `idx_bank_transactions_reference`: Reference for lookup

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "accountId": "550e8400-e29b-41d4-a716-446655440005",
  "statementId": "550e8400-e29b-41d4-a716-446655440006",
  "transactionNumber": "TXN-001",
  "amount": 500.0,
  "type": "credit",
  "description": "Deposit from ABC Company",
  "date": 1708713600000,
  "status": "matched",
  "referenceId": "je-123",
  "referenceType": "journal_entry",
  "created_at": 1708713600000,
  "updated_at": 1708713600000
}
```

**Repository**: `src/lib/repositories/bank-transaction-repository.ts`

---

### 9. audit_logs

Stores audit trail for all operations.

| Column      | Type    | Constraints           | Description                                        |
| ----------- | ------- | --------------------- | -------------------------------------------------- |
| `id`        | TEXT    | PRIMARY KEY           | Unique audit log identifier (UUID)                 |
| `userId`    | TEXT    | NOT NULL, FOREIGN KEY | User ID                                            |
| `tableName` | TEXT    | NOT NULL              | Table name                                         |
| `operation` | TEXT    | NOT NULL              | Operation (CREATE/READ/UPDATE/DELETE/LOGIN/LOGOUT) |
| `recordId`  | TEXT    | NOT NULL              | Record ID                                          |
| `oldValue`  | TEXT    |                       | Old value (JSON string)                            |
| `newValue`  | TEXT    |                       | New value (JSON string)                            |
| `ipAddress` | TEXT    | NOT NULL              | IP address                                         |
| `userAgent` | TEXT    |                       | User agent string                                  |
| `createdAt` | INTEGER | NOT NULL              | Creation timestamp                                 |

**Indexes**:

- `idx_audit_logs_user`: User for filtering
- `idx_audit_logs_table`: Table for filtering
- `idx_audit_logs_operation`: Operation for filtering
- `idx_audit_logs_created`: Created timestamp for filtering

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "John Doe",
  "tableName": "customers",
  "operation": "CREATE",
  "recordId": "550e8400-e29b-41d4-a716-446655440001",
  "oldValue": null,
  "newValue": "{\"name\":\"ABC Company Ltd\",\"email\":\"abc@company.com\"}",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0",
  "createdAt": 1708713600000
}
```

**Repository**: `src/lib/repositories/audit-log-repository.ts`

---

### 10. sessions

Stores user session information.

| Column           | Type    | Constraints           | Description                      |
| ---------------- | ------- | --------------------- | -------------------------------- |
| `id`             | TEXT    | PRIMARY KEY           | Unique session identifier (UUID) |
| `sessionId`      | TEXT    | UNIQUE, NOT NULL      | Session ID                       |
| `userId`         | TEXT    | NOT NULL, FOREIGN KEY | User ID                          |
| `ipAddress`      | TEXT    | NOT NULL              | IP address                       |
| `userAgent`      | TEXT    |                       | User agent string                |
| `expiresAt`      | INTEGER | NOT NULL              | Session expiration timestamp     |
| `createdAt`      | INTEGER | NOT NULL              | Creation timestamp               |
| `lastActivityAt` | INTEGER | NOT NULL              | Last activity timestamp          |

**Indexes**:

- `idx_sessions_user`: User for filtering
- `idx_sessions_session`: Session ID for lookup
- `idx_sessions_expires`: Expiration for cleanup

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440009",
  "sessionId": "sess-abc123",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0",
  "expiresAt": 1708800000000,
  "createdAt": 1708713600000,
  "lastActivityAt": 1708713600000
}
```

**Repository**: `src/lib/repositories/session-repository.ts`

---

## Relationships

### Foreign Key Relationships

```
customers.quotations.customerId → customers.id
customers.invoices.customerId → customers.id

quotations.invoices.referenceId → invoices.id
invoices.journal_entries.referenceId → invoices.id

bank_accounts.bank_statements.accountId → bank_accounts.id
bank_statements.bank_transactions.statementId → bank_statements.id

users.audit_logs.userId → users.id
users.sessions.userId → users.id
```

---

## Database Initialization

### Seed Data

Location: `src/lib/database/seed.ts`

```typescript
import { dbManager } from "./database";
import { UserRepository } from "@/lib/repositories/user-repository";
import { CustomerRepository } from "@/lib/repositories/customer-repository";

async function seedDatabase() {
  const db = dbManager.getDatabase();
  const userRepository = new UserRepository(db);
  const customerRepository = new CustomerRepository(db);

  // Create admin user
  const admin = await userRepository.create({
    email: "admin@omb-accounting.com",
    password: "Admin123!",
    name: "Administrator",
    role: "admin",
  });

  // Create sample customer
  const customer = await customerRepository.create({
    name: "ABC Company Ltd",
    email: "abc@company.com",
    phone: "+85212345678",
    address: "123 Hong Kong Street",
  });

  console.log("Database seeded successfully!");
}
```

### Run Seed

```bash
npm run db:seed
```

---

## Database Migrations

### Migration System

Location: `src/lib/database/migrations.ts`

The application uses a version-based migration system.

```typescript
interface Migration {
  version: number;
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      // Create users table
      await db.run(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    },
    down: async (db) => {
      await db.run("DROP TABLE users");
    },
  },
  // ... more migrations
];
```

---

## Repository Pattern

### Repository Structure

Each entity has a corresponding repository:

```
src/lib/repositories/
├── user-repository.ts
├── customer-repository.ts
├── quotation-repository.ts
├── invoice-repository.ts
├── journal-entry-repository.ts
├── bank-account-repository.ts
├── bank-statement-repository.ts
├── bank-transaction-repository.ts
├── audit-log-repository.ts
└── session-repository.ts
```

### Example Repository

`src/lib/repositories/customer-repository.ts`:

```typescript
import { Database } from "better-sqlite3";
import { Customer } from "@/types";

export class CustomerRepository {
  constructor(private db: Database) {}

  create(data: Partial<Customer>): Customer {
    const id = crypto.randomUUID();
    const now = Date.now();

    const query = `
      INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      id,
      data.name || "",
      data.email || null,
      data.phone || null,
      data.address || null,
      now,
      now,
    ]);

    return this.findById(id)!;
  }

  findById(id: string): Customer | undefined {
    const row = this.db.prepare("SELECT * FROM customers WHERE id = ?").get(id);

    return row as Customer;
  }

  findAll(): Customer[] {
    const rows = this.db.prepare("SELECT * FROM customers ORDER BY name").all();

    return rows as Customer[];
  }

  update(id: string, data: Partial<Customer>): boolean {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }

    if (data.phone !== undefined) {
      fields.push("phone = ?");
      values.push(data.phone);
    }

    if (data.address !== undefined) {
      fields.push("address = ?");
      values.push(data.address);
    }

    fields.push("updated_at = ?");
    values.push(now);
    values.push(id);

    const query = `
      UPDATE customers
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    const result = this.db.run(query, values);
    return result.changes > 0;
  }

  delete(id: string): boolean {
    const result = this.db.run("DELETE FROM customers WHERE id = ?", id);
    return result.changes > 0;
  }
}
```

---

## Database Utilities

### Database Manager

Location: `src/lib/database/database.ts`

```typescript
import { Database } from "better-sqlite3";
import { migrations } from "./migrations";

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  getDatabase(): Database {
    if (!this.db) {
      this.db = this.initDatabase();
    }
    return this.db;
  }

  private initDatabase(): Database {
    const dbPath = path.join(process.cwd(), "data", "omb-accounting.db");
    const db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");

    // Run migrations
    this.runMigrations(db);

    return db;
  }

  private runMigrations(db: Database) {
    const currentVersion = db.prepare("PRAGMA user_version").get() as {
      user_version: number;
    };

    for (const migration of migrations) {
      if (migration.version > currentVersion.user_version) {
        console.log(`Running migration v${migration.version}`);
        migration.up(db);

        db.prepare("PRAGMA user_version = ?").run(migration.version);
      }
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const dbManager = DatabaseManager.getInstance();
```

---

## Testing Database

### Test Database Setup

Location: `src/lib/database/sqlite.ts`

```typescript
import { Database } from "better-sqlite3";
import { migrations } from "./migrations";

export function createTestDatabase(): Database {
  const db = new Database(":memory:");

  // Run migrations
  for (const migration of migrations) {
    migration.up(db);
  }

  return db;
}
```

---

## Best Practices

### Connection Management

1. Always use the `DatabaseManager` singleton
2. Close database connections when shutting down
3. Use prepared statements to prevent SQL injection

### Transaction Handling

```typescript
const db = dbManager.getDatabase();
const transaction = db.transaction(() => {
  // Multiple operations
  db.run("INSERT INTO customers ...");
  db.run("INSERT INTO invoices ...");
});

transaction();
```

### Error Handling

```typescript
try {
  const customer = customerRepository.create(data);
} catch (error) {
  console.error("Failed to create customer:", error);
  throw error;
}
```

---

## Performance Considerations

### Indexing

- Index frequently queried columns (email, names, dates)
- Use composite indexes for filtered queries
- Monitor index usage with `EXPLAIN QUERY PLAN`

### Query Optimization

- Use parameterized queries (prepared statements)
- Limit result sets with `LIMIT` and `OFFSET`
- Use `EXPLAIN` to analyze query performance

### Database Maintenance

```bash
# Backup database
cp data/omb-accounting.db data/omb-accounting.db.backup

# Vacuum database (reclaim space)
sqlite3 data/omb-accounting.db "VACUUM"

# Analyze database
sqlite3 data/omb-accounting.db "ANALYZE"
```

---

**Last Updated**: 2026-02-23
