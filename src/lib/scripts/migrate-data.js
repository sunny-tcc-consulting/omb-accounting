/**
 * Data Migration Script
 *
 * Initializes database and migrates mock data to SQLite database.
 * Usage: node src/lib/scripts/migrate-data.js
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

// Helper functions
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function now() {
  return Date.now();
}

function randomDate(daysBack = 365) {
  return now() - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
}

// Initialize database tables
function initDatabase() {
  console.log('Initializing database tables...');
  
  db.pragma('foreign_keys = ON');

  // Users
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

  // Sessions
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

  // Customers
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

  // Quotations
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

  // Invoices
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

  // Categories
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

  // Transactions
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

  // Bank Accounts
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

  // Bank Statements
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

  // Bank Transactions
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

  // Journal Entries
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

  // Audit Logs
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

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_id ON bank_transactions(bank_account_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);`);

  console.log('Database tables initialized.\n');
}

console.log('='.repeat(60));
console.log('OMB Accounting - Data Migration Script');
console.log('='.repeat(60));
console.log(`Database: ${DB_PATH}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log('='.repeat(60));

try {
  // Initialize database
  initDatabase();

  // 1. Categories
  console.log('1. Migrating categories...');
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  let categoryCount = 0;
  
  if (existingCategories.count === 0) {
    const categories = [
      ['销售', 'income', '#22c55e', 'ShoppingCart'],
      ['服务', 'income', '#3b82f6', 'Briefcase'],
      ['咨询', 'income', '#8b5cf6', 'Lightbulb'],
      ['投资', 'income', '#f59e0b', 'TrendingUp'],
      ['版权', 'income', '#ec4899', 'Copyright'],
      ['其他收入', 'income', '#6b7280', 'MoreHorizontal'],
      ['租金', 'expense', '#ef4444', 'Home'],
      ['薪资', 'expense', '#f59e0b', 'Users'],
      ['营销', 'expense', '#ec4899', 'Megaphone'],
      ['软件', 'expense', '#3b82f6', 'Code'],
      ['差旅', 'expense', '#8b5cf6', 'Plane'],
      ['办公用品', 'expense', '#10b981', 'Printer'],
      ['保险', 'expense', '#6b7280', 'Shield'],
      ['法律', 'expense', '#f97316', 'Scale'],
      ['其他支出', 'expense', '#6b7280', 'MoreHorizontal'],
    ];
    
    const insertCategory = db.prepare(
      'INSERT INTO categories (id, name, type, color, icon, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    for (const [name, type, color, icon] of categories) {
      insertCategory.run(generateId(), name, type, color, icon, 1);
      categoryCount++;
    }
  } else {
    categoryCount = existingCategories.count;
  }
  console.log(`   - Categories: ${categoryCount}`);

  // 2. Customers
  console.log('\n2. Migrating customers...');
  const customers = [];
  const companyNames = [
    'ABC 科技有限公司',
    'XYZ 贸易有限公司',
    '123 咨询服务',
    '456 创意工作室',
    '789 软件解决方案',
    'ABC 装饰工程',
    'XYZ 建筑公司',
    '123 招商代理',
  ];
  
  const insertCustomer = db.prepare(
    'INSERT OR IGNORE INTO customers (id, name, email, phone, address, company, tax_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  for (let i = 0; i < 15; i++) {
    const isCompany = Math.random() > 0.5;
    const company = companyNames[i % companyNames.length];
    const customer = {
      id: generateId(),
      name: isCompany ? `${company} Ltd.` : `Person ${i + 1}`,
      email: `contact${i + 1}@example.com`,
      phone: `+852 1234 ${String(1000 + i).padStart(4, '0')}`,
      address: `${i + 1} Example Street, Hong Kong`,
      company: isCompany ? company : null,
      taxId: isCompany ? String(1000000000 + Math.floor(Math.random() * 9000000000)) : null,
      notes: 'Sample customer data',
      createdAt: randomDate(365),
    };
    customers.push(customer);
    
    try {
      insertCustomer.run(
        customer.id, customer.name, customer.email, customer.phone, 
        customer.address, customer.company, customer.taxId, customer.notes,
        customer.createdAt, customer.createdAt
      );
    } catch (e) {
      // Ignore duplicates
    }
  }
  console.log(`   - Customers: ${customers.length}`);

  // 3. Quotations
  console.log('\n3. Migrating quotations...');
  const insertQuotation = db.prepare(
    `INSERT OR IGNORE INTO quotations 
     (id, quotation_number, customer_id, customer_name, customer_email, customer_phone, customer_address,
      items, currency, subtotal, tax, discount, total_amount, validity_period, status,
      issued_date, notes, terms_and_conditions, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const unitPrice = 100 + Math.floor(Math.random() * 4900);
      const quantity = Math.floor(Math.random() * 5) + 1;
      const total = unitPrice * quantity;
      items.push({
        id: generateId(),
        description: `Service Item ${j + 1}`,
        quantity,
        unitPrice,
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        total,
      });
      subtotal += total;
    }
    
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const discount = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + tax - discount) * 100) / 100;
    const statuses = ['draft', 'sent', 'accepted', 'rejected'];
    const status = statuses[Math.floor(Math.random() * 4)];
    
    try {
      insertQuotation.run(
        generateId(),
        `QT-${String(i + 1).padStart(6, '0')}`,
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        JSON.stringify(items),
        'CNY',
        Math.round(subtotal * 100) / 100,
        tax,
        discount,
        total,
        now() + 30 * 24 * 60 * 60 * 1000,
        status,
        randomDate(30),
        'Standard terms apply',
        'Payment due within 30 days. All prices are in CNY.',
        now(),
        now()
      );
    } catch (e) {
      // Ignore errors
    }
  }
  console.log(`   - Quotations: 20`);

  // 4. Invoices
  console.log('\n4. Migrating invoices...');
  const insertInvoice = db.prepare(
    `INSERT OR IGNORE INTO invoices 
     (id, invoice_number, customer_id, customer_name, customer_email, customer_phone, customer_address,
      items, quotation_id, currency, subtotal, tax, discount, total_amount, payment_terms,
      due_date, status, issued_date, paid_date, amount_paid, amount_remaining, notes, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const unitPrice = 100 + Math.floor(Math.random() * 4900);
      const quantity = Math.floor(Math.random() * 5) + 1;
      const total = unitPrice * quantity;
      items.push({
        id: generateId(),
        description: `Product Item ${j + 1}`,
        quantity,
        unitPrice,
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        total,
      });
      subtotal += total;
    }
    
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const discount = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + tax - discount) * 100) / 100;
    const isPaid = Math.random() > 0.6;
    const statuses = ['draft', 'pending', 'partial', 'overdue'];
    const status = isPaid ? 'paid' : statuses[Math.floor(Math.random() * 4)];
    
    try {
      insertInvoice.run(
        generateId(),
        `INV-${String(i + 1).padStart(6, '0')}`,
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        JSON.stringify(items),
        null,
        'CNY',
        Math.round(subtotal * 100) / 100,
        tax,
        discount,
        total,
        'Payment due within 30 days',
        now() + (Math.random() * 60 - 30) * 24 * 60 * 60 * 1000,
        status,
        randomDate(30),
        isPaid ? now() : null,
        isPaid ? total : 0,
        isPaid ? 0 : total,
        'Invoice generated from migrated data',
        now(),
        now()
      );
    } catch (e) {
      // Ignore errors
    }
  }
  console.log(`   - Invoices: 30`);

  // 5. Transactions
  console.log('\n5. Migrating transactions...');
  const existingTx = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  let txCount = 0;
  
  if (existingTx.count === 0) {
    const insertTx = db.prepare(
      `INSERT INTO transactions (id, type, date, amount, category_id, category_name, description, reference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const incomeCats = db.prepare('SELECT id, name FROM categories WHERE type = ?').all('income');
    const expenseCats = db.prepare('SELECT id, name FROM categories WHERE type = ?').all('expense');
    
    for (let i = 0; i < 50; i++) {
      const isIncome = Math.random() > 0.5;
      const type = isIncome ? 'income' : 'expense';
      const categories = isIncome ? incomeCats : expenseCats;
      const category = categories[Math.floor(Math.random() * categories.length)] || { id: '1', name: '其他' };
      const amount = Math.round((100 + Math.random() * 99000) * 100) / 100;
      
      try {
        insertTx.run(
          generateId(),
          type,
          randomDate(365),
          amount,
          category.id,
          category.name,
          `Transaction ${i + 1}`,
          String(100000000 + Math.floor(Math.random() * 900000000)),
          'completed',
          now()
        );
        txCount++;
      } catch (e) {
        // Ignore errors
      }
    }
  }
  console.log(`   - Transactions: ${txCount}`);

  // 6. Users
  console.log('\n6. Seeding users...');
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  let userCount = 0;
  
  if (existingUsers.count === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    // Note: Password hash is bcrypt placeholder - in production, use proper hashing
    insertUser.run(generateId(), 'Admin', 'admin@example.com', '$2b$10$placeholder', 'admin', now(), now());
    insertUser.run(generateId(), 'Demo User', 'demo@example.com', '$2b$10$placeholder', 'user', now(), now());
    userCount = 2;
  }
  console.log(`   - Users: ${userCount}`);

  // 7. Bank Account
  console.log('\n7. Seeding bank account...');
  const existingBanks = db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get();
  let bankCount = 0;
  
  if (existingBanks.count === 0) {
    const insertBank = db.prepare(
      'INSERT INTO bank_accounts (id, account_name, bank_name, account_number, currency, initial_balance, current_balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertBank.run(generateId(), 'Main Account', 'Example Bank', '1234567890', 'CNY', 100000, 100000, now(), now());
    bankCount = 1;
  }
  console.log(`   - Bank Accounts: ${bankCount}`);

  // 8. Journal Entries
  console.log('\n8. Migrating journal entries...');
  const existingJe = db.prepare('SELECT COUNT(*) as count FROM journal_entries').get();
  let jeCount = 0;
  
  if (existingJe.count === 0) {
    const insertJe = db.prepare(
      `INSERT INTO journal_entries (id, entry_number, date, description, debit_account, credit_account, debit_amount, credit_amount, reference, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    const entries = [
      { desc: 'Initial capital contribution', debit: 'Bank Account', credit: 'Owner Equity', amount: 100000 },
      { desc: 'Office rent payment', debit: 'Rent Expense', credit: 'Bank Account', amount: 5000 },
      { desc: 'Software subscription', debit: 'Software Expense', credit: 'Bank Account', amount: 1200 },
      { desc: 'Client payment received', debit: 'Bank Account', credit: 'Sales Revenue', amount: 15000 },
      { desc: 'Equipment purchase', debit: 'Equipment', credit: 'Bank Account', amount: 8000 },
    ];
    
    for (let i = 0; i < 10; i++) {
      const entry = entries[i % entries.length];
      try {
        insertJe.run(
          generateId(),
          `JE-${String(i + 1).padStart(6, '0')}`,
          randomDate(90),
          entry.desc,
          entry.debit,
          entry.credit,
          entry.amount,
          entry.amount,
          `REF-${i + 1}`,
          'posted',
          now(),
          now()
        );
        jeCount++;
      } catch (e) {
        // Ignore errors
      }
    }
  }
  console.log(`   - Journal Entries: ${jeCount}`);

  console.log('\n' + '='.repeat(60));
  console.log('Migration completed successfully!');
  console.log('='.repeat(60));

  // Print summary
  console.log('\nSummary:');
  const summary = {
    categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
    customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
    quotations: db.prepare('SELECT COUNT(*) as count FROM quotations').get().count,
    invoices: db.prepare('SELECT COUNT(*) as count FROM invoices').get().count,
    transactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count,
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    bank_accounts: db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get().count,
    journal_entries: db.prepare('SELECT COUNT(*) as count FROM journal_entries').get().count,
  };
  
  console.log(`  - Categories: ${summary.categories}`);
  console.log(`  - Customers: ${summary.customers}`);
  console.log(`  - Quotations: ${summary.quotations}`);
  console.log(`  - Invoices: ${summary.invoices}`);
  console.log(`  - Transactions: ${summary.transactions}`);
  console.log(`  - Users: ${summary.users}`);
  console.log(`  - Bank Accounts: ${summary.bank_accounts}`);
  console.log(`  - Journal Entries: ${summary.journal_entries}`);

  console.log('\nDevelopment Login Credentials:');
  console.log(`  - Admin: admin@example.com`);
  console.log(`  - Demo: demo@example.com`);

} catch (error) {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
