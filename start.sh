#!/bin/sh
# Application startup script
# Runs database migrations before starting the server

set -e

echo "🚀 Starting OMB Accounting..."
echo "DATABASE_PATH: ${DATABASE_PATH:-/app/data/omb-accounting.db}"

# Run database migrations using the compiled version
echo "📦 Running database migrations..."

# Create a migration script that works in production
cat > /tmp/run-migrations.js << 'EOFM'
const path = require('path');

// Set the database path before importing migrations
process.env.DATABASE_PATH = process.env.DATABASE_PATH || '/app/data/omb-accounting.db';

console.log('Using database:', process.env.DATABASE_PATH);

// In production, we need to use the compiled migration or run it differently
// For now, we'll create the tables directly using better-sqlite3
const Database = require('better-sqlite3');
const fs = require('fs');
const dbPath = process.env.DATABASE_PATH;

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
}

console.log('Opening database:', dbPath);
const db = new Database(dbPath);

// Run migrations inline
console.log('Creating tables...');

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

db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS bank_statements (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT NOT NULL,
    statement_date INTEGER NOT NULL,
    opening_balance REAL NOT NULL,
    closing_balance REAL NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS bank_transactions (
    id TEXT PRIMARY KEY,
    statement_id TEXT NOT NULL,
    transaction_date INTEGER NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    is_reconciled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE
  )
`);

db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    created_at INTEGER NOT NULL
  )
`);

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

console.log('✅ Tables created successfully');

// Create default admin user if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@omb.com');
if (!adminExists) {
  const bcrypt = require('bcrypt');
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const now = Date.now();
  
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'admin-' + now,
    'Admin',
    'admin@omb.com',
    passwordHash,
    'admin',
    now,
    now
  );
  
  console.log('✅ Default admin user created (admin@omb.com / admin123)');
}

db.close();
console.log('✅ Migrations completed');
EOFM

node /tmp/run-migrations.js

if [ $? -eq 0 ]; then
  echo "✅ Migrations successful, starting server..."
  exec node server.js
else
  echo "❌ Migrations failed, exiting..."
  exit 1
fi
