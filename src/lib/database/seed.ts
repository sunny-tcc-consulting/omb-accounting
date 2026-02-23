/**
 * Seed Data
 *
 * Initialize the database with sample data for development.
 */

import { SQLiteDatabase } from "./sqlite";
import { v4 as uuidv4 } from "uuid";
import type {
  User,
  Customer,
  Quotation,
  Invoice,
  BankAccount,
  BankStatement,
  BankTransaction,
  UserPreferences,
  Permission,
} from "@/types";

export interface SeedData {
  users: User[];
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  bank_accounts: BankAccount[];
  bank_statements: BankStatement[];
  bank_transactions: BankTransaction[];
}

// Default user preferences
const defaultPreferences: UserPreferences = {
  language: "zh-HK",
  timezone: "Asia/Hong_Kong",
  dateFormat: "DD/MM/YYYY",
  currency: "HKD",
  theme: "light",
  notificationEmail: true,
  notificationInApp: true,
  emailDigest: "none",
};

const defaultPermissions: Permission[] = [];

/**
 * Generate sample seed data
 */
export function generateSeedData(): SeedData {
  const now = new Date();

  return {
    users: [
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@omb-accounting.com",
        passwordHash: "$2b$10$placeholder_hash",
        roleId: "admin",
        status: "active",
        loginCount: 0,
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        preferences: defaultPreferences,
        permissions: defaultPermissions,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        passwordChangedAt: now,
      },
      {
        id: uuidv4(),
        name: "Demo User",
        email: "demo@omb-accounting.com",
        passwordHash: "$2b$10$placeholder_hash",
        roleId: "user",
        status: "active",
        loginCount: 0,
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        preferences: defaultPreferences,
        permissions: defaultPermissions,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        passwordChangedAt: now,
      },
    ],
    customers: [
      {
        id: uuidv4(),
        name: "Tech Solutions Ltd.",
        email: "contact@techsolutions.com",
        phone: "+852 1234 5678",
        address: "123 Cyberport, Hong Kong",
        company: "Tech Solutions Ltd.",
        taxId: "12345678",
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: "Creative Studio",
        email: "hello@creativestudio.com",
        phone: "+852 8765 4321",
        address: "456 Design District, Hong Kong",
        company: "Creative Studio",
        taxId: "87654321",
        createdAt: now,
      },
      {
        id: uuidv4(),
        name: "Global Trading Co.",
        email: "orders@globaltrading.com",
        phone: "+852 2345 6789",
        address: "789 Business Centre, Hong Kong",
        company: "Global Trading Co.",
        taxId: "23456789",
        createdAt: now,
      },
    ],
    quotations: [
      {
        id: uuidv4(),
        quotationNumber: "QT-2026-001",
        customerId: "", // Will be filled dynamically
        customerName: "Tech Solutions Ltd.",
        customerEmail: "contact@techsolutions.com",
        items: [
          {
            id: uuidv4(),
            description: "Web Development Services",
            quantity: 1,
            unitPrice: 35000,
            total: 35000,
          },
          {
            id: uuidv4(),
            description: "UI/UX Design",
            quantity: 1,
            unitPrice: 15000,
            total: 15000,
          },
        ],
        currency: "HKD",
        subtotal: 50000,
        total: 50000,
        validityPeriod: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: "sent",
        issuedDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        quotationNumber: "QT-2026-002",
        customerId: "", // Will be filled dynamically
        customerName: "Creative Studio",
        customerEmail: "hello@creativestudio.com",
        items: [
          {
            id: uuidv4(),
            description: "Logo Design Package",
            quantity: 1,
            unitPrice: 8000,
            total: 8000,
          },
          {
            id: uuidv4(),
            description: "Brand Guidelines",
            quantity: 1,
            unitPrice: 5000,
            total: 5000,
          },
        ],
        currency: "HKD",
        subtotal: 13000,
        total: 13000,
        validityPeriod: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
        issuedDate: now,
      },
    ],
    invoices: [
      {
        id: uuidv4(),
        invoiceNumber: "INV-2026-001",
        customerId: "", // Will be filled dynamically
        customerName: "Tech Solutions Ltd.",
        customerEmail: "contact@techsolutions.com",
        items: [
          {
            id: uuidv4(),
            description: "Web Development - Phase 1",
            quantity: 1,
            unitPrice: 25000,
            total: 25000,
          },
        ],
        currency: "HKD",
        subtotal: 25000,
        total: 25000,
        paymentTerms: "Net 30",
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: "paid",
        issuedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        paidDate: now,
        amountPaid: 25000,
        amountRemaining: 0,
      },
      {
        id: uuidv4(),
        invoiceNumber: "INV-2026-002",
        customerId: "", // Will be filled dynamically
        customerName: "Creative Studio",
        customerEmail: "hello@creativestudio.com",
        items: [
          {
            id: uuidv4(),
            description: "Logo Design Final Delivery",
            quantity: 1,
            unitPrice: 15000,
            total: 15000,
          },
        ],
        currency: "HKD",
        subtotal: 15000,
        total: 15000,
        paymentTerms: "Net 15",
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        status: "pending",
        issuedDate: now,
        amountPaid: 0,
        amountRemaining: 15000,
      },
    ],
    bank_accounts: [
      {
        id: uuidv4(),
        name: "Main Checking Account",
        bankName: "HSBC",
        accountNumber: "1234567890",
        accountType: "checking",
        currency: "HKD",
        openingBalance: 100000,
        balance: 125000.5,
        isPrimary: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: "Savings Account",
        bankName: "DBS",
        accountNumber: "0987654321",
        accountType: "savings",
        currency: "HKD",
        openingBalance: 500000,
        balance: 500000,
        isPrimary: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    bank_statements: [
      {
        id: uuidv4(),
        bankAccountId: "", // Will be filled dynamically
        statementNumber: "STM-2026-001",
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: now,
        closingBalance: 125000.5,
        currency: "HKD",
        status: "reconciled",
        importedAt: now,
        reconciledAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ],
    bank_transactions: [
      {
        id: uuidv4(),
        statementId: "", // Will be filled dynamically
        transactionDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        description: "Sales Payment - Tech Solutions Ltd.",
        amount: 50000,
        type: "credit",
        status: "matched",
        matchedBookTransactionId: uuidv4(),
        matchedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        statementId: "", // Will be filled dynamically
        transactionDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        description: "Office Supplies Purchase",
        amount: 2500,
        type: "debit",
        status: "matched",
        matchedBookTransactionId: uuidv4(),
        matchedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        statementId: "", // Will be filled dynamically
        transactionDate: now,
        description: "Bank Service Fee",
        amount: 50,
        type: "debit",
        status: "pending",
        matchedBookTransactionId: null,
        matchedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

/**
 * Seed the database with sample data
 */
export async function seedDatabase(config?: {
  inMemory?: boolean;
}): Promise<void> {
  const db = new SQLiteDatabase(config);

  try {
    console.log("Seeding database with sample data...");

    const seedData = generateSeedData();

    // Get typed database connection
    const connection = db.getConnection() as unknown as {
      prepare(sql: string): {
        run(...params: unknown[]): void;
        get<T = unknown>(...params: unknown[]): T;
        all<T = unknown>(...params: unknown[]): T[];
      };
    };

    // Insert users
    const insertUser = connection.prepare(
      "INSERT INTO users (id, name, email, password_hash, role, status, login_count, failed_login_attempts, two_factor_enabled, preferences, permissions, created_at, updated_at, last_login_at, password_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.users.forEach((user) => {
      insertUser.run(
        user.id,
        user.name,
        user.email,
        user.passwordHash,
        user.roleId,
        user.status,
        user.loginCount,
        user.failedLoginAttempts,
        user.twoFactorEnabled ? 1 : 0,
        JSON.stringify(user.preferences),
        JSON.stringify(user.permissions),
        user.createdAt.getTime(),
        user.updatedAt.getTime(),
        user.lastLoginAt?.getTime() || null,
        user.passwordChangedAt?.getTime() || null,
      );
    });
    console.log(`Inserted ${seedData.users.length} users`);

    // Insert customers
    const insertCustomer = connection.prepare(
      "INSERT INTO customers (id, name, email, phone, address, company, tax_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.customers.forEach((customer) => {
      insertCustomer.run(
        customer.id,
        customer.name,
        customer.email,
        customer.phone || null,
        customer.address || null,
        customer.company || null,
        customer.taxId || null,
        customer.notes || null,
        customer.createdAt.getTime(),
        null, // updated_at
      );
    });
    console.log(`Inserted ${seedData.customers.length} customers`);

    // Insert quotations
    const insertQuotation = connection.prepare(
      "INSERT INTO quotations (id, quotation_number, customer_id, customer_name, customer_email, items, currency, subtotal, tax, discount, total, validity_period, status, issued_date, notes, terms_and_conditions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.quotations.forEach((quotation) => {
      insertQuotation.run(
        quotation.id,
        quotation.quotationNumber,
        quotation.customerId,
        quotation.customerName,
        quotation.customerEmail,
        JSON.stringify(quotation.items),
        quotation.currency,
        quotation.subtotal,
        quotation.tax || null,
        quotation.discount || null,
        quotation.total,
        quotation.validityPeriod.getTime(),
        quotation.status,
        quotation.issuedDate.getTime(),
        quotation.notes || null,
        quotation.termsAndConditions || null,
        Date.now(),
        null,
      );
    });
    console.log(`Inserted ${seedData.quotations.length} quotations`);

    // Insert invoices
    const insertInvoice = connection.prepare(
      "INSERT INTO invoices (id, invoice_number, customer_id, customer_name, customer_email, items, currency, subtotal, tax, discount, total, payment_terms, due_date, status, issued_date, paid_date, amount_paid, amount_remaining, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.invoices.forEach((invoice) => {
      insertInvoice.run(
        invoice.id,
        invoice.invoiceNumber,
        invoice.customerId,
        invoice.customerName,
        invoice.customerEmail,
        JSON.stringify(invoice.items),
        invoice.currency,
        invoice.subtotal,
        invoice.tax || null,
        invoice.discount || null,
        invoice.total,
        invoice.paymentTerms,
        invoice.dueDate.getTime(),
        invoice.status,
        invoice.issuedDate.getTime(),
        invoice.paidDate?.getTime() || null,
        invoice.amountPaid || 0,
        invoice.amountRemaining || null,
        invoice.notes || null,
        Date.now(),
        null,
      );
    });
    console.log(`Inserted ${seedData.invoices.length} invoices`);

    // Insert bank accounts
    const insertBankAccount = connection.prepare(
      "INSERT INTO bank_accounts (id, name, bank_name, account_number, account_type, currency, opening_balance, balance, is_primary, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_accounts.forEach((account) => {
      insertBankAccount.run(
        account.id,
        account.name,
        account.bankName,
        account.accountNumber,
        account.accountType,
        account.currency,
        account.openingBalance,
        account.balance,
        account.isPrimary ? 1 : 0,
        account.isActive ? 1 : 0,
        account.createdAt.getTime(),
        account.updatedAt.getTime(),
      );
    });
    console.log(`Inserted ${seedData.bank_accounts.length} bank accounts`);

    // Insert bank statements
    const insertBankStatement = connection.prepare(
      "INSERT INTO bank_statements (id, bank_account_id, statement_number, start_date, end_date, closing_balance, currency, status, imported_at, reconciled_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_statements.forEach((statement) => {
      insertBankStatement.run(
        statement.id,
        statement.bankAccountId,
        statement.statementNumber,
        statement.startDate.getTime(),
        statement.endDate.getTime(),
        statement.closingBalance,
        statement.currency,
        statement.status,
        statement.importedAt.getTime(),
        statement.reconciledAt?.getTime() || null,
        statement.createdAt.getTime(),
        statement.updatedAt.getTime(),
      );
    });
    console.log(`Inserted ${seedData.bank_statements.length} bank statements`);

    // Insert bank transactions
    const insertBankTransaction = connection.prepare(
      "INSERT INTO bank_transactions (id, statement_id, transaction_date, description, amount, type, category, reference, status, matched_book_transaction_id, matched_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    seedData.bank_transactions.forEach((transaction) => {
      insertBankTransaction.run(
        transaction.id,
        transaction.statementId,
        transaction.transactionDate.getTime(),
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.category || null,
        transaction.reference || null,
        transaction.status,
        transaction.matchedBookTransactionId || null,
        transaction.matchedAt?.getTime() || null,
        transaction.createdAt.getTime(),
        transaction.updatedAt.getTime(),
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
  const dbConn = db.getConnection() as any;
  const result = dbConn.get("SELECT COUNT(*) as count FROM users") as any;
  return result.count > 0;
}
