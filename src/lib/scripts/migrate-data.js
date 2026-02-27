/**
 * Data Migration Script (Complete - Creates tables + seeds data)
 *
 * Usage: npm run migrate:seed
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

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId() {
  return uuid();
}

function now() {
  return Date.now();
}

// ==================== Create Tables ====================

function createTables() {
  console.log('Creating database tables...');
  
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

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      company TEXT,
      tax_id TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quotation_number TEXT UNIQUE,
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
      status TEXT,
      issued_date INTEGER,
      notes TEXT,
      terms_and_conditions TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE,
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
      status TEXT,
      issued_date INTEGER,
      paid_date INTEGER,
      amount_paid REAL DEFAULT 0,
      amount_remaining REAL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

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
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      is_default INTEGER DEFAULT 0
    );

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

    CREATE TABLE IF NOT EXISTS bank_statements (
      id TEXT PRIMARY KEY,
      bank_account_id TEXT NOT NULL,
      statement_date INTEGER NOT NULL,
      starting_balance REAL NOT NULL,
      ending_balance REAL NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_transactions (
      id TEXT PRIMARY KEY,
      bank_statement_id TEXT NOT NULL,
      transaction_date INTEGER NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      reference TEXT,
      status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      entry_number TEXT UNIQUE,
      date INTEGER NOT NULL,
      description TEXT,
      reference TEXT,
      status TEXT DEFAULT 'draft',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id TEXT PRIMARY KEY,
      journal_entry_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      account_code TEXT UNIQUE NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      changes TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  
  console.log('   Tables created successfully.');
}

// ==================== Seed Data ====================

console.log('='.repeat(60));
console.log('OMB Accounting - Data Migration Script');
console.log('='.repeat(60));

try {
  // Create tables
  createTables();

  // 1. Categories
  console.log('\n1. Migrating categories...');
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  let categoryCount = 0;
  
  if (existingCategories.count === 0) {
    const insertCategory = db.prepare(
      'INSERT INTO categories (id, name, type, color, icon, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    const incomeCategories = [
      ['销售', 'income', '#22c55e', 'ShoppingCart'],
      ['服务', 'income', '#3b82f6', 'Briefcase'],
      ['咨询', 'income', '#8b5cf6', 'Lightbulb'],
      ['投资', 'income', '#f59e0b', 'TrendingUp'],
      ['版权', 'income', '#ec4899', 'Copyright'],
      ['其他收入', 'income', '#6b7280', 'MoreHorizontal'],
    ];
    
    const expenseCategories = [
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
    
    for (const [name, type, color, icon] of [...incomeCategories, ...expenseCategories]) {
      insertCategory.run(generateId(), name, type, color, icon, 1);
      categoryCount++;
    }
  }
  console.log(`   - Categories: ${categoryCount}`);

  // 2. Accounts (Chart of Accounts)
  console.log('\n2. Creating chart of accounts...');
  const existingAccounts = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
  let accountCount = 0;
  
  if (existingAccounts.count === 0) {
    const insertAccount = db.prepare(
      'INSERT INTO accounts (id, account_code, account_name, account_type, balance, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    const accounts = [
      ['1001', '现金', 'asset', 50000],
      ['1002', '银行存款', 'asset', 200000],
      ['1003', '应收账款', 'asset', 150000],
      ['1101', '存货', 'asset', 80000],
      ['1201', '固定资产', 'asset', 500000],
      ['2001', '应付账款', 'liability', 50000],
      ['2002', '短期借款', 'liability', 100000],
      ['2101', '应付工资', 'liability', 30000],
      ['3001', '实收资本', 'equity', 500000],
      ['3002', '利润留存', 'equity', 150000],
      ['4001', '销售收入', 'revenue', 0],
      ['4002', '服务收入', 'revenue', 0],
      ['5001', '销售成本', 'expense', 0],
      ['5002', '工资费用', 'expense', 0],
      ['5003', '租金费用', 'expense', 0],
      ['5004', '水电费用', 'expense', 0],
      ['5005', '办公费用', 'expense', 0],
      ['5006', '营销费用', 'expense', 0],
      ['5007', '差旅费用', 'expense', 0],
      ['5008', '其他费用', 'expense', 0],
    ];
    
    const accountTypes = {
      '1001': 'asset', '1002': 'asset', '1003': 'asset', '1101': 'asset', '1201': 'asset',
      '2001': 'liability', '2002': 'liability', '2101': 'liability',
      '3001': 'equity', '3002': 'equity',
      '4001': 'revenue', '4002': 'revenue',
      '5001': 'expense', '5002': 'expense', '5003': 'expense', '5004': 'expense',
      '5005': 'expense', '5006': 'expense', '5007': 'expense', '5008': 'expense',
    };
    
    for (const [code, name, type, balance] of accounts) {
      insertAccount.run(generateId(), code, name, accountTypes[code], balance, 1, now(), now());
      accountCount++;
    }
  }
  console.log(`   - Accounts: ${accountCount}`);

  // 3. Customers
  console.log('\n3. Migrating customers...');
  const customers = [];
  const companyNames = [
    'ABC 科技有限公司',
    'XYZ 贸易有限公司',
    '123 咨询服务',
    '456 创意工作室',
    '789 软件解决方案',
  ];
  
  const insertCustomer = db.prepare(
    'INSERT OR IGNORE INTO customers (id, name, email, phone, address, company, tax_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  for (let i = 0; i < 15; i++) {
    const isCompany = Math.random() > 0.5;
    const customer = {
      id: generateId(),
      name: isCompany ? companyNames[i % companyNames.length] : `客户 ${i + 1}`,
      email: `contact${i + 1}@example.com`,
      phone: `138${randomInt(10000000, 99999999)}`,
      address: `地址 ${i + 1}号`,
      company: isCompany ? companyNames[i % companyNames.length] : null,
      taxId: isCompany ? String(randomInt(1000000000, 9999999999)) : null,
      notes: `客户备注 ${i + 1}`,
      createdAt: now() - randomInt(1, 365) * 24 * 60 * 60 * 1000,
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

  // 4. Quotations
  console.log('\n4. Migrating quotations...');
  const insertQuotation = db.prepare(
    'INSERT OR IGNORE INTO quotations (id, quotation_number, customer_id, customer_name, customer_email, items, currency, subtotal, tax, total_amount, validity_period, status, issued_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = randomInt(1, 3);
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const unitPrice = randomFloat(100, 5000);
      const quantity = randomInt(1, 5);
      const total = unitPrice * quantity;
      items.push({
        id: generateId(),
        description: `产品 ${j + 1}`,
        quantity,
        unitPrice,
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        total,
      });
      subtotal += total;
    }
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const statuses = ['draft', 'sent', 'accepted', 'rejected'];
    
    try {
      insertQuotation.run(
        generateId(),
        `QT-${String(i + 1).padStart(6, '0')}`,
        customer.id,
        customer.name,
        customer.email,
        JSON.stringify(items),
        'CNY',
        subtotal.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2),
        now() + 30 * 24 * 60 * 60 * 1000,
        statuses[randomInt(0, 3)],
        now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
        now(),
        now()
      );
    } catch (e) {
      // Ignore errors
    }
  }
  console.log(`   - Quotations: 20`);

  // 5. Invoices
  console.log('\n5. Migrating invoices...');
  const insertInvoice = db.prepare(
    'INSERT OR IGNORE INTO invoices (id, invoice_number, customer_id, customer_name, customer_email, items, currency, subtotal, tax, total_amount, payment_terms, due_date, status, issued_date, amount_paid, amount_remaining, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  for (let i = 0; i < 30; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = randomInt(1, 3);
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const unitPrice = randomFloat(100, 5000);
      const quantity = randomInt(1, 5);
      const total = unitPrice * quantity;
      items.push({
        id: generateId(),
        description: `产品 ${j + 1}`,
        quantity,
        unitPrice,
        taxRate: Math.random() > 0.5 ? 10 : undefined,
        total,
      });
      subtotal += total;
    }
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const isPaid = Math.random() > 0.6;
    const statuses = ['draft', 'pending', 'partial', 'overdue'];
    
    try {
      insertInvoice.run(
        generateId(),
        `INV-${String(i + 1).padStart(6, '0')}`,
        customer.id,
        customer.name,
        customer.email,
        JSON.stringify(items),
        'CNY',
        subtotal.toFixed(2),
        tax.toFixed(2),
        total.toFixed(2),
        'Payment due within 30 days',
        now() + (randomInt(-30, 60)) * 24 * 60 * 60 * 1000,
        isPaid ? 'paid' : statuses[randomInt(0, 3)],
        now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
        isPaid ? total.toFixed(2) : '0',
        isPaid ? '0' : total.toFixed(2),
        now(),
        now()
      );
    } catch (e) {
      // Ignore errors
    }
  }
  console.log(`   - Invoices: 30`);

  // 6. Transactions
  console.log('\n6. Migrating transactions...');
  const existingTx = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  let txCount = 0;
  const insertTransaction = db.prepare(
    'INSERT INTO transactions (id, type, date, amount, category_id, category_name, description, reference, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  if (existingTx.count === 0) {
    const incomeCats = db.prepare('SELECT id, name FROM categories WHERE type = ?').all('income');
    const expenseCats = db.prepare('SELECT id, name FROM categories WHERE type = ?').all('expense');
    
    for (let i = 0; i < 50; i++) {
      const isIncome = Math.random() > 0.5;
      const type = isIncome ? 'income' : 'expense';
      const categories = isIncome ? incomeCats : expenseCats;
      const category = categories[Math.floor(Math.random() * categories.length)] || { id: '1', name: '其他' };
      const amount = randomFloat(100, 100000);
      
      try {
        insertTransaction.run(
          generateId(),
          type,
          now() - randomInt(0, 365) * 24 * 60 * 60 * 1000,
          amount.toFixed(2),
          category.id,
          category.name,
          `交易描述 ${i + 1}`,
          String(randomInt(100000, 999999)),
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

  // 7. Users
  console.log('\n7. Seeding users...');
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  let userCount = 0;
  const insertUser = db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  
  if (existingUsers.count === 0) {
    insertUser.run(generateId(), 'Admin', 'admin@example.com', '$2b$10$dummy_hash', 'admin', now(), now());
    insertUser.run(generateId(), 'Demo User', 'demo@example.com', '$2b$10$dummy_hash', 'user', now(), now());
    userCount = 2;
  }
  console.log(`   - Users: ${userCount}`);

  // 8. Bank Account
  console.log('\n8. Seeding bank account...');
  const existingBanks = db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get();
  let bankCount = 0;
  const insertBank = db.prepare(
    'INSERT INTO bank_accounts (id, account_name, bank_name, account_number, currency, initial_balance, current_balance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  if (existingBanks.count === 0) {
    insertBank.run(generateId(), 'Main Account', 'Example Bank', '1234567890', 'CNY', 100000, 100000, now(), now());
    bankCount = 1;
  }
  console.log(`   - Bank Accounts: ${bankCount}`);

  console.log('\n' + '='.repeat(60));
  console.log('Migration completed successfully!');
  console.log('='.repeat(60));

  const summary = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM categories) as categories,
      (SELECT COUNT(*) FROM accounts) as accounts,
      (SELECT COUNT(*) FROM customers) as customers,
      (SELECT COUNT(*) FROM quotations) as quotations,
      (SELECT COUNT(*) FROM invoices) as invoices,
      (SELECT COUNT(*) FROM transactions) as transactions,
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM bank_accounts) as bank_accounts
  `).get();
  
  console.log('\nSummary:');
  console.log(`  - Categories: ${summary.categories}`);
  console.log(`  - Accounts: ${summary.accounts}`);
  console.log(`  - Customers: ${summary.customers}`);
  console.log(`  - Quotations: ${summary.quotations}`);
  console.log(`  - Invoices: ${summary.invoices}`);
  console.log(`  - Transactions: ${summary.transactions}`);
  console.log(`  - Users: ${summary.users}`);
  console.log(`  - Bank Accounts: ${summary.bank_accounts}`);

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  db.close();
}
