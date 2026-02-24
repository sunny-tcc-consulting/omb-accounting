/**
 * Database Migrations
 *
 * Defines the database schema and initialization.
 * Run migrations to set up the database.
 */

import { SQLiteDatabase } from "./sqlite";

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => void;
  down?: (db: SQLiteDatabase) => void;
}

/**
 * Create tables
 */
const createTables = (db: SQLiteDatabase): void => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Quotations table
  db.run(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      quotation_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      total_amount REAL NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // Invoices table
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
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
    )
  `);

  // Journal Entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      debit REAL NOT NULL DEFAULT 0,
      credit REAL NOT NULL DEFAULT 0,
      account_id TEXT NOT NULL,
      transaction_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);

  // Bank Accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      account_number TEXT UNIQUE NOT NULL,
      bank_name TEXT,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'HKD',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Bank Statements table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_statements (
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
    )
  `);

  // Bank Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
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
    )
  `);

  // Audit Logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
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
    )
  `);

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

/**
 * Create indexes for performance
 */
const createIndexes = (db: SQLiteDatabase): void => {
  // Customers
  db.run("CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)");
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at)",
  );

  // Invoices
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)",
  );
  db.run("CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)");
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at)",
  );

  // Quotations
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status)",
  );

  // Journal Entries
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(transaction_date)",
  );

  // Bank Statements
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_bank_statements_account_id ON bank_statements(bank_account_id)",
  );

  // Bank Transactions
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement_id ON bank_transactions(statement_id)",
  );

  // Audit Logs
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)",
  );
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)",
  );

  // Sessions
  db.run("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)");
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
  );
};

/**
 * Initial migration (version 1)
 */
export const migration_001_initial: Migration = {
  version: 1,
  name: "initial",
  up: (db: SQLiteDatabase) => {
    console.log("Running migration: initial");
    createTables(db);
    createIndexes(db);
  },
  down: (db: SQLiteDatabase) => {
    console.log("Rolling back migration: initial");
    // Drop all tables
    db.run("DROP TABLE IF EXISTS sessions");
    db.run("DROP TABLE IF EXISTS audit_logs");
    db.run("DROP TABLE IF EXISTS bank_transactions");
    db.run("DROP TABLE IF EXISTS bank_statements");
    db.run("DROP TABLE IF EXISTS bank_accounts");
    db.run("DROP TABLE IF EXISTS journal_entries");
    db.run("DROP TABLE IF EXISTS invoices");
    db.run("DROP TABLE IF EXISTS quotations");
    db.run("DROP TABLE IF EXISTS customers");
    db.run("DROP TABLE IF EXISTS users");
  },
};

/**
 * Migration 002: Add missing quotation fields
 */
export const migration_002_add_quotation_fields: Migration = {
  version: 2,
  name: "add_quotation_fields",
  up: (db: SQLiteDatabase) => {
    console.log("Running migration: add_quotation_fields");

    // Add missing columns to quotations table
    db.run("ALTER TABLE quotations ADD COLUMN customer_name TEXT");
    db.run("ALTER TABLE quotations ADD COLUMN customer_email TEXT");
    db.run("ALTER TABLE quotations ADD COLUMN customer_phone TEXT");
    db.run("ALTER TABLE quotations ADD COLUMN currency TEXT DEFAULT 'CNY'");
    db.run("ALTER TABLE quotations ADD COLUMN subtotal REAL DEFAULT 0");
    db.run("ALTER TABLE quotations ADD COLUMN tax REAL DEFAULT 0");
    db.run("ALTER TABLE quotations ADD COLUMN items TEXT");
    db.run("ALTER TABLE quotations ADD COLUMN validity_period INTEGER");
    db.run("ALTER TABLE quotations ADD COLUMN issued_date INTEGER");
    db.run("ALTER TABLE quotations ADD COLUMN terms_and_conditions TEXT");
    db.run("ALTER TABLE quotations ADD COLUMN notes TEXT");

    console.log("Migration completed successfully");
  },
  down: (db: SQLiteDatabase) => {
    console.log("Rolling back migration: add_quotation_fields");
    // Note: SQLite doesn't support DROP COLUMN, so we can't easily rollback
    // In production, you'd need to recreate the table
  },
};

/**
 * Get all migrations
 */
export const migrations: Migration[] = [
  migration_001_initial,
  migration_002_add_quotation_fields,
];

/**
 * Run migrations to initialize database
 */
export async function runMigrations(config?: {
  inMemory?: boolean;
}): Promise<void> {
  const { SQLiteDatabase } = await import("./sqlite");

  const db = new SQLiteDatabase(config);

  try {
    // Check if users table exists (migration has run)
    const tableExists = db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
    );

    if (!tableExists) {
      console.log("Running initial migration...");
      migration_001_initial.up(db);
      console.log("Migration completed successfully");
    } else {
      console.log("Database already initialized");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Get database version
 */
export function getDatabaseVersion(db: SQLiteDatabase): number {
  const result = db.get(
    "SELECT value FROM sqlite_master WHERE type='table' AND name='schema_version'",
  ) as { value: number } | undefined;
  return result?.value || 0;
}

/**
 * Set database version
 */
export function setDatabaseVersion(db: SQLiteDatabase, version: number): void {
  db.run("CREATE TABLE IF NOT EXISTS schema_version (value INTEGER)");
  db.run("INSERT OR REPLACE INTO schema_version (value) VALUES (?)", [version]);
}
