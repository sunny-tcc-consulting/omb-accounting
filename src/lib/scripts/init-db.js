/**
 * Database Initialization Script
 *
 * Creates all database tables for omb-accounting.
 * Run this first before migrating data.
 *
 * Usage: node src/lib/scripts/init-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'omb-accounting.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

console.log('='.repeat(60));
console.log('OMB Accounting - Database Initialization');
console.log('='.repeat(60));

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Users table
  console.log('\n1. Creating users table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  console.log('   ✓ users table ready');

  // Sessions table
  console.log('\n2. Creating sessions table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('   ✓ sessions table ready');

  // Customers table
  console.log('\n3. Creating customers table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
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
  `);
  console.log('   ✓ customers table ready');

  // Quotations table
  console.log('\n4. Creating quotations table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quotation_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      items TEXT,
      currency TEXT DEFAULT 'CNY',
      subtotal REAL,
      tax REAL,
      discount REAL,
      total_amount REAL,
      validity_period INTEGER,
      status TEXT DEFAULT 'draft',
      issued_date INTEGER,
      notes TEXT,
      terms_and_conditions TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);
  console.log('   ✓ quotations table ready');

  // Invoices table
  console.log('\n5. Creating invoices table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      items TEXT,
      quotation_id TEXT,
      currency TEXT DEFAULT 'CNY',
      subtotal REAL,
      tax REAL,
      discount REAL,
      total_amount REAL,
      payment_terms TEXT,
      due_date INTEGER NOT NULL,
      status TEXT DEFAULT 'draft',
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
  `);
  console.log('   ✓ invoices table ready');

  // Categories table
  console.log('\n6. Creating categories table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      is_default INTEGER DEFAULT 0
    );
  `);
  console.log('   ✓ categories table ready');

  // Transactions table
  console.log('\n7. Creating transactions table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
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
  `);
  console.log('   ✓ transactions table ready');

  // Bank Accounts table
  console.log('\n8. Creating bank_accounts table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
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
  `);
  console.log('   ✓ bank_accounts table ready');

  // Bank Statements table
  console.log('\n9. Creating bank_statements table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS bank_statements (
      id TEXT PRIMARY KEY,
      bank_account_id TEXT NOT NULL,
      file_name TEXT,
      file_path TEXT,
      statement_date INTEGER NOT NULL,
      ending_balance REAL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
    );
  `);
  console.log('   ✓ bank_statements table ready');

  // Bank Transactions table
  console.log('\n10. Creating bank_transactions table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id TEXT PRIMARY KEY,
      bank_account_id TEXT NOT NULL,
      bank_statement_id TEXT,
      date INTEGER NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      reference TEXT,
      status TEXT DEFAULT 'pending',
      matched_transaction_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
      FOREIGN KEY (bank_statement_id) REFERENCES bank_statements(id)
    );
  `);
  console.log('   ✓ bank_transactions table ready');

  // Journal Entries table
  console.log('\n11. Creating journal_entries table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      entry_number TEXT UNIQUE NOT NULL,
      date INTEGER NOT NULL,
      description TEXT,
      debit_account TEXT,
      credit_account TEXT,
      debit_amount REAL NOT NULL,
      credit_amount REAL NOT NULL,
      reference TEXT,
      status TEXT DEFAULT 'draft',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  console.log('   ✓ journal_entries table ready');

  // Audit Logs table
  console.log('\n12. Creating audit_logs table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      operation TEXT NOT NULL,
      table_name TEXT,
      record_id TEXT,
      changes TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  console.log('   ✓ audit_logs table ready');

  // Create indexes for better performance
  console.log('\n13. Creating indexes...');
  
  db.exec(`CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_id ON bank_transactions(bank_account_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);`);
  
  console.log('   ✓ Indexes created');

  // Verify tables
  console.log('\n14. Verifying database...');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%' 
    ORDER BY name
  `).all();
  
  console.log(`   Found ${tables.length} tables:`);
  tables.forEach(t => console.log(`   - ${t.name}`));

  console.log('\n' + '='.repeat(60));
  console.log('Database initialization completed successfully!');
  console.log('='.repeat(60));
  console.log(`\nDatabase file: ${DB_PATH}`);

} catch (error) {
  console.error('\n❌ Initialization failed:', error);
  process.exit(1);
} finally {
  db.close();
}
