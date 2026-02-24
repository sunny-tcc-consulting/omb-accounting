#!/usr/bin/env node
/**
 * Initialize database with all migrations
 */

const path = require('path');
const fs = require('fs');
const DatabaseImpl = require('better-sqlite3');

const dbPath = path.join(process.cwd(), 'data', 'omb-accounting.db');

// Create data directory if it doesn't exist
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Database path:', dbPath);

const db = new DatabaseImpl(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  console.log('Creating tables...');

  // Users table
  db.exec(`
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
  db.exec(`
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

  // Quotations table (with all fields)
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      quotation_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      total_amount REAL NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      currency TEXT DEFAULT 'CNY',
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      items TEXT,
      validity_period INTEGER,
      issued_date INTEGER,
      terms_and_conditions TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // Invoices table
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      debit REAL NOT NULL DEFAULT 0,
      credit REAL NOT NULL DEFAULT 0,
      account_id TEXT NOT NULL,
      transaction_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // Bank Accounts table
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('All tables created successfully!');

  // Verify quotations table
  const columns = db.prepare("PRAGMA table_info(quotations)").all();
  console.log('Quotations table columns:', columns.map(c => c.name));

} catch (error) {
  console.error('Failed to initialize database:', error.message);
  process.exit(1);
} finally {
  db.close();
}
