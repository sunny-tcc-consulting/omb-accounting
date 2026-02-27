# Data Migration Guide

## Overview

This document describes the data migration process for migrating mock data from `src/lib/mock-data.ts` to the SQLite database.

## Quick Start

### Option 1: Using npm script (recommended)

```bash
# Run migration
npm run migrate

# Seed with fresh data (clears existing data)
npm run migrate:seed
```

### Option 2: Direct execution

```bash
# TypeScript (requires ts-node)
npx ts-node src/lib/scripts/migrate-data.ts

# JavaScript
node src/lib/scripts/migrate-data.js
```

## Migration Script Features

### Idempotent

The migration script is safe to run multiple times:

- Checks if data already exists before inserting
- Uses `INSERT OR IGNORE` to skip duplicates
- Reports what was migrated vs. what already existed

### Data Coverage

| Table         | Description                   | Default Count             |
| ------------- | ----------------------------- | ------------------------- |
| categories    | Income and expense categories | 14 (7 income + 7 expense) |
| customers     | Customer records              | 15                        |
| quotations    | Sales quotations              | 20                        |
| invoices      | Invoice records               | 30                        |
| transactions  | Financial transactions        | 50                        |
| users         | System users                  | 2 (admin + demo)          |
| bank_accounts | Bank accounts                 | 1                         |

### Seed Data

The migration includes seed data for development:

**Users:**
| Email | Role | Password |
|-------|------|----------|
| admin@example.com | admin | (placeholder - change in production) |
| demo@example.com | user | (placeholder - change in production) |

**Bank Account:**

- Account Name: Main Account
- Bank: Example Bank
- Account Number: 1234567890
- Initial Balance: ¥100,000 CNY

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  color TEXT,
  icon TEXT,
  is_default INTEGER DEFAULT 0
);
```

### Customers Table

```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  company TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Quotations Table

```sql
CREATE TABLE quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  items TEXT, -- JSON array
  currency TEXT DEFAULT 'CNY',
  subtotal REAL,
  tax REAL,
  discount REAL,
  total_amount REAL,
  validity_period INTEGER,
  status TEXT,
  issued_date INTEGER,
  notes TEXT,
  terms_and_conditions TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  items TEXT, -- JSON array
  quotation_id TEXT,
  currency TEXT DEFAULT 'CNY',
  subtotal REAL,
  tax REAL,
  discount REAL,
  total_amount REAL,
  payment_terms TEXT,
  due_date INTEGER NOT NULL,
  status TEXT,
  issued_date INTEGER,
  paid_date INTEGER,
  amount_paid REAL DEFAULT 0,
  amount_remaining REAL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'income' or 'expense'
  date INTEGER NOT NULL,
  amount REAL NOT NULL,
  category_id TEXT,
  category_name TEXT,
  description TEXT,
  reference TEXT,
  status TEXT DEFAULT 'completed',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Bank Accounts Table

```sql
CREATE TABLE bank_accounts (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  currency TEXT DEFAULT 'CNY',
  initial_balance REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## Troubleshooting

### Error: Database file not found

Make sure the `data` directory exists:

```bash
mkdir -p data
```

### Error: Table already exists

The migration script automatically handles existing tables. If you need a fresh start:

```bash
# Delete the database file
rm data/omb-accounting.db

# Re-run migration
npm run migrate:seed
```

### Error: Duplicate key violations

This is normal and handled by the script. It means the data already exists.

## Development Notes

### Password Hashing

The seed users have placeholder password hashes. For development:

- Admin user: `admin@example.com` / `admin123`
- Demo user: `demo@example.com` / `demo123`

In production, use proper bcrypt hashing:

```typescript
import bcrypt from "bcrypt";
const hash = await bcrypt.hash("password", 10);
```

### Adding New Data Types

To add new data types to migration:

1. Create a migration function in `migrate-data.ts`:

```typescript
function migrateNewData(): number {
  const data = generateNewData();
  let count = 0;
  for (const item of data) {
    try {
      db.execute('INSERT OR IGNORE INTO new_table ...', [...]);
      count++;
    } catch (e) { /* ignore */ }
  }
  return count;
}
```

2. Call it in the main function:

```typescript
console.log("\nN. Migrating new data...");
const newCount = migrateNewData();
console.log(`   - New data: ${newCount}`);
```

## Related Documentation

- [Database Schema](../DATABASE_SETUP.md)
- [API Documentation](../README.md)
- [Testing Guide](../__tests__/README.md)
