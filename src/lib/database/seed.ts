/**
 * Seed Data
 *
 * Initialize the database with sample data for development.
 */

import { SQLiteDatabase } from "./sqlite";
import { v4 as uuidv4 } from "uuid";

export interface SeedData {
  users: User[];
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  bank_accounts: BankAccount[];
  bank_statements: BankStatement[];
  bank_transactions: BankTransaction[];
}

/**
 * Generate sample seed data
 */
export function generateSeedData(): SeedData {
  const now = Date.now();

  return {
    users: [
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@omb-accounting.com",
        password_hash: "$2b$10$placeholder_hash", // Placeholder, will be hashed
        role: "admin",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Demo User",
        email: "demo@omb-accounting.com",
        password_hash: "$2b$10$placeholder_hash",
        role: "user",
        created_at: now,
        updated_at: now,
      },
    ],
    customers: [
      {
        id: uuidv4(),
        name: "Tech Solutions Ltd.",
        email: "contact@techsolutions.com",
        phone: "+852 1234 5678",
        address: "123 Cyberport, Hong Kong",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Creative Studio",
        email: "hello@creativestudio.com",
        phone: "+852 8765 4321",
        address: "456 Design District, Hong Kong",
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Global Trading Co.",
        email: "orders@globalearning.com",
        phone: "+852 2345 6789",
        address: "789 Business Centre, Hong Kong",
        created_at: now,
        updated_at: now,
      },
    ],
    quotations: [
      {
        id: uuidv4(),
        customer_id: generateUUID(),
        quotation_number: "QT-2026-001",
        status: "sent",
        total_amount: 50000,
        created_at: now - 86400000,
        updated_at: now - 86400000,
      },
      {
        id: uuidv4(),
        customer_id: generateUUID(),
        quotation_number: "QT-2026-002",
        status: "draft",
        total_amount: 35000,
        created_at: now - 172800000,
        updated_at: now - 172800000,
      },
    ],
    invoices: [
      {
        id: uuidv4(),
        customer_id: generateUUID(),
        invoice_number: "INV-2026-001",
        status: "paid",
        total_amount: 50000,
        amount_paid: 50000,
        due_date: now + 86400000,
        created_at: now - 86400000,
        updated_at: now - 86400000,
      },
      {
        id: uuidv4(),
        customer_id: generateUUID(),
        invoice_number: "INV-2026-002",
        status: "pending",
        total_amount: 35000,
        amount_paid: 0,
        due_date: now + 259200000,
        created_at: now - 172800000,
        updated_at: now - 172800000,
      },
    ],
    bank_accounts: [
      {
        id: uuidv4(),
        name: "Main Checking Account",
        account_number: "1234567890",
        bank_name: "HSBC",
        balance: 125000.5,
        currency: "HKD",
        created_at: now - 259200000,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Savings Account",
        account_number: "0987654321",
        bank_name: "DBS",
        balance: 500000.0,
        currency: "HKD",
        created_at: now - 259200000,
        updated_at: now,
      },
    ],
    bank_statements: [
      {
        id: uuidv4(),
        bank_account_id: generateUUID(),
        statement_number: "STM-2026-001",
        statement_date: now - 86400000,
        closing_balance: 125000.5,
        status: "processed",
        created_at: now - 86400000,
        updated_at: now - 86400000,
      },
    ],
    bank_transactions: [
      {
        id: uuidv4(),
        statement_id: generateUUID(),
        transaction_date: now - 86400000,
        description: "Sales Payment - Tech Solutions Ltd.",
        amount: 50000,
        type: "credit",
        status: "matched",
        matched_to_journal_entry_id: generateUUID(),
      },
      {
        id: uuidv4(),
        statement_id: generateUUID(),
        transaction_date: now - 86400000,
        description: "Office Supplies",
        amount: 2500,
        type: "debit",
        status: "matched",
        matched_to_journal_entry_id: generateUUID(),
      },
    ],
  };
}

/**
 * Helper function to generate UUID
 */
function generateUUID(): string {
  return uuidv4();
}

/**
 * Seed the database with sample data
 */
export async function seedDatabase(config?: {
  inMemory?: boolean;
}): Promise<void> {
  const { SQLiteDatabase } = await import("./sqlite");

  const db = new SQLiteDatabase(config);

  try {
    console.log("Seeding database with sample data...");

    const seedData = generateSeedData();

    // Insert users
    const insertUser = db.prepare(
      "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.users.forEach((user) => {
      insertUser.run(
        user.id,
        user.name,
        user.email,
        user.password_hash,
        user.role,
        user.created_at,
        user.updated_at,
      );
    });
    console.log(`Inserted ${seedData.users.length} users`);

    // Insert customers
    const insertCustomer = db.prepare(
      "INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.customers.forEach((customer) => {
      insertCustomer.run(
        customer.id,
        customer.name,
        customer.email || null,
        customer.phone || null,
        customer.address || null,
        customer.created_at,
        customer.updated_at,
      );
    });
    console.log(`Inserted ${seedData.customers.length} customers`);

    // Insert quotations
    const insertQuotation = db.prepare(
      "INSERT INTO quotations (id, customer_id, quotation_number, status, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.quotations.forEach((quotation) => {
      insertQuotation.run(
        quotation.id,
        quotation.customer_id,
        quotation.quotation_number,
        quotation.status,
        quotation.total_amount,
        quotation.created_at,
        quotation.updated_at,
      );
    });
    console.log(`Inserted ${seedData.quotations.length} quotations`);

    // Insert invoices
    const insertInvoice = db.prepare(
      "INSERT INTO invoices (id, customer_id, invoice_number, quotation_id, status, total_amount, amount_paid, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.invoices.forEach((invoice) => {
      insertInvoice.run(
        invoice.id,
        invoice.customer_id,
        invoice.invoice_number,
        invoice.quotation_id || null,
        invoice.status,
        invoice.total_amount,
        invoice.amount_paid,
        invoice.due_date,
        invoice.created_at,
        invoice.updated_at,
      );
    });
    console.log(`Inserted ${seedData.invoices.length} invoices`);

    // Insert bank accounts
    const insertBankAccount = db.prepare(
      "INSERT INTO bank_accounts (id, name, account_number, bank_name, balance, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_accounts.forEach((account) => {
      insertBankAccount.run(
        account.id,
        account.name,
        account.account_number,
        account.bank_name || null,
        account.balance,
        account.currency,
        account.created_at,
        account.updated_at,
      );
    });
    console.log(`Inserted ${seedData.bank_accounts.length} bank accounts`);

    // Insert bank statements
    const insertBankStatement = db.prepare(
      "INSERT INTO bank_statements (id, bank_account_id, statement_number, statement_date, closing_balance, file_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_statements.forEach((statement) => {
      insertBankStatement.run(
        statement.id,
        statement.bank_account_id,
        statement.statement_number,
        statement.statement_date,
        statement.closing_balance,
        statement.file_path || null,
        statement.status,
        statement.created_at,
        statement.updated_at,
      );
    });
    console.log(`Inserted ${seedData.bank_statements.length} bank statements`);

    // Insert bank transactions
    const insertBankTransaction = db.prepare(
      "INSERT INTO bank_transactions (id, statement_id, transaction_date, description, amount, type, status, matched_to_journal_entry_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_transactions.forEach((transaction) => {
      insertBankTransaction.run(
        transaction.id,
        transaction.statement_id,
        transaction.transaction_date,
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.status,
        transaction.matched_to_journal_entry_id || null,
      );
    });
    console.log(
      `Inserted ${seedData.bank_transactions.length} bank transactions`,
    );

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  } finally {
    db.close();
  }
}

/**
 * Check if database has been seeded
 */
export function isDatabaseSeeded(db: SQLiteDatabase): boolean {
  const result = db.get("SELECT COUNT(*) as count FROM users");
  return (result as Record<string, unknown>).count > 0;
}
