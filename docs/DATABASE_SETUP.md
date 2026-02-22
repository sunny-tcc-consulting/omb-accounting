# Database Setup Guide

## Overview

omb-accounting uses SQLite as its primary database with a file-based storage approach. The database is wrapped in an abstraction layer to support future migration to other databases.

## Features

- **File-based Storage**: Single database file (`data/omb-accounting.db`)
- **ACID Compliance**: Transaction-safe operations
- **No Server Required**: SQLite runs directly in the application
- **Database Abstraction**: Easy to swap databases in the future
- **Migration Support**: Schema versioning and migrations

## Installation

Dependencies are already installed:

- `better-sqlite3` - Synchronous SQLite driver
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation

## Initial Setup

### 1. Copy Environment Variables

```bash
cp .env.local.example .env.local
```

### 2. Initialize Database

Run the initialization script:

```bash
node scripts/init-database.js
```

This will:

1. Create the database schema
2. Create indexes for performance
3. Seed sample data (if `SEED_DATA=true`)

### 3. Verify Setup

Check that the database file was created:

```bash
ls -lh data/omb-accounting.db
```

## Database Schema

### Tables

| Table             | Description                      |
| ----------------- | -------------------------------- |
| users             | User accounts and authentication |
| customers         | Customer information             |
| quotations        | Quotation records                |
| invoices          | Invoice records                  |
| journal_entries   | Double-entry bookkeeping         |
| bank_accounts     | Bank account information         |
| bank_statements   | Bank statement records           |
| bank_transactions | Individual bank transactions     |
| audit_logs        | Operation audit trail            |
| sessions          | Active user sessions             |

### Key Relationships

- `customers` → `quotations` (one-to-many)
- `customers` → `invoices` (one-to-many)
- `quotations` → `invoices` (one-to-zero/one)
- `bank_accounts` → `bank_statements` (one-to-many)
- `bank_statements` → `bank_transactions` (one-to-many)
- `users` → `sessions` (one-to-many)
- `users` → `audit_logs` (one-to-many)

## Configuration

### Environment Variables

| Variable        | Description                            | Default                  |
| --------------- | -------------------------------------- | ------------------------ |
| `DATABASE_PATH` | Path to database file                  | `data/omb-accounting.db` |
| `DATABASE_MODE` | Database mode (development/production) | `production`             |
| `JWT_SECRET`    | Secret for JWT tokens                  | - (required)             |
| `JWT_EXPIRY`    | Token expiry time                      | `30m`                    |
| `SEED_DATA`     | Whether to seed sample data            | `true`                   |

### Development vs Production

**Development**:

- Uses in-memory SQLite (faster, no file I/O)
- Always seeds sample data
- No persistent database

**Production**:

- Uses file-based SQLite
- Only seeds on first run
- Persistent database

## Database Operations

### Connection Management

```typescript
import { dbManager } from "@/lib/database/database";

// Initialize database
await dbManager.initialize();

// Get database connection
const db = dbManager.getDatabase();

// Close database
await dbManager.close();
```

### Running Migrations

```typescript
import { runMigrations } from "@/lib/database/migrations";

await runMigrations({ inMemory: false });
```

### Seeding Data

```typescript
import { seedDatabase } from "@/lib/database/seed";

await seedDatabase({ inMemory: false });
```

### Using Transactions

```typescript
const db = dbManager.getDatabase();

db.transaction(() => {
  db.run(
    "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      uuidv4(),
      "Test User",
      "test@example.com",
      hashedPassword,
      "user",
      Date.now(),
      Date.now(),
    ],
  );
})();
```

## API Integration

All existing API routes continue to work. The backend implementation will replace mock data with real database operations.

### Example: Customer API

```typescript
// src/app/api/customers/route.ts
import { dbManager } from "@/lib/database/database";

export async function GET() {
  const db = dbManager.getDatabase();
  const customers = db.query("SELECT * FROM customers");
  return Response.json(customers);
}

export async function POST(request: Request) {
  const db = dbManager.getDatabase();
  const body = await request.json();

  const result = db.run(
    "INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      uuidv4(),
      body.name,
      body.email,
      body.phone,
      body.address,
      Date.now(),
      Date.now(),
    ],
  );

  return Response.json({ success: true, id: result.lastInsertRowid });
}
```

## Testing

### Unit Tests

```typescript
import { SQLiteDatabase } from "@/lib/database/sqlite";

describe("Database Tests", () => {
  let db: SQLiteDatabase;

  beforeEach(() => {
    db = new SQLiteDatabase({ inMemory: true });
  });

  afterEach(() => {
    db.close();
  });

  test("should create table", () => {
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY)");
    const result = db.get("SELECT COUNT(*) as count FROM test");
    expect(result.count).toBe(0);
  });
});
```

### Integration Tests

```typescript
import { dbManager } from "@/lib/database/database";

describe("API Integration Tests", () => {
  beforeAll(async () => {
    await dbManager.initialize();
  });

  afterAll(async () => {
    await dbManager.close();
  });

  test("should create customer via API", async () => {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Customer" }),
    });
    expect(response.status).toBe(201);
  });
});
```

## Troubleshooting

### Database File Not Found

```bash
# Ensure the data directory exists
mkdir -p data

# Run initialization again
node scripts/init-database.js
```

### Migration Errors

```bash
# Delete and recreate database (development)
rm data/omb-accounting.db
node scripts/init-database.js
```

### Permission Errors

```bash
# Ensure data directory is writable
chmod 755 data/
```

## Future Extensibility

To switch to another database (PostgreSQL, MySQL, etc.):

1. Create new database implementation (e.g., `PostgresDatabase`)
2. Implement the same `Database` interface
3. Keep repositories unchanged
4. Keep services unchanged
5. Update configuration to use new implementation

## Security Considerations

- Never commit `data/omb-accounting.db` to version control
- Use strong `JWT_SECRET` in production
- Hash passwords using bcrypt (already implemented)
- Validate all inputs before database operations
- Use parameterized queries to prevent SQL injection

## Performance Tips

- Index frequently queried columns
- Use transactions for batch operations
- Close database connections when not in use
- Consider caching for frequently accessed data
- Use `SELECT *` sparingly (select only needed columns)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the migration and seed scripts
3. Examine the database schema in `src/lib/database/migrations.ts`
4. Check the type definitions in `src/lib/types/database.ts`
