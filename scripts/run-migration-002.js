#!/usr/bin/env node
/**
 * Run Migration 002: Add missing quotation fields
 */

const path = require('path');
const DatabaseImpl = require('better-sqlite3');

const dbPath = path.join(process.cwd(), 'data', 'omb-accounting.db');

console.log('Database path:', dbPath);

const db = new DatabaseImpl(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  console.log('Adding missing quotation fields...');

  // Add missing columns to quotations table
  db.exec("ALTER TABLE quotations ADD COLUMN customer_name TEXT");
  db.exec("ALTER TABLE quotations ADD COLUMN customer_email TEXT");
  db.exec("ALTER TABLE quotations ADD COLUMN customer_phone TEXT");
  db.exec("ALTER TABLE quotations ADD COLUMN currency TEXT DEFAULT 'CNY'");
  db.exec("ALTER TABLE quotations ADD COLUMN subtotal REAL DEFAULT 0");
  db.exec("ALTER TABLE quotations ADD COLUMN tax REAL DEFAULT 0");
  db.exec("ALTER TABLE quotations ADD COLUMN items TEXT");
  db.exec("ALTER TABLE quotations ADD COLUMN validity_period INTEGER");
  db.exec("ALTER TABLE quotations ADD COLUMN issued_date INTEGER");
  db.exec("ALTER TABLE quotations ADD COLUMN terms_and_conditions TEXT");
  db.exec("ALTER TABLE quotations ADD COLUMN notes TEXT");

  console.log('Migration 002 completed successfully!');

  // Verify columns
  const columns = db.prepare("PRAGMA table_info(quotations)").all();
  console.log('Quotations table columns:', columns.map(c => c.name));

} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
