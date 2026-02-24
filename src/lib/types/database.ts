/**
 * Database Types
 *
 * TypeScript type definitions for database entities.
 */

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  created_at: number;
  updated_at: number;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: number;
  updated_at: number;
}

// Quotation types
export interface Quotation {
  id: string;
  customer_id: string;
  quotation_number: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  total_amount: number;
  // Additional fields
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  tax?: number | null;
  items?: string | null; // JSON string
  validity_period?: number | null;
  issued_date?: number | null;
  terms_and_conditions?: string | null;
  notes?: string | null;
  created_at: number;
  updated_at: number;
}

// Invoice types
export interface Invoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  quotation_id?: string;
  status: "draft" | "pending" | "partial" | "paid" | "overdue";
  total_amount: number;
  amount_paid: number;
  due_date: number;
  created_at: number;
  updated_at: number;
}

// Journal Entry types
export interface JournalEntry {
  id: string;
  description: string;
  debit: number;
  credit: number;
  account_id: string;
  transaction_date: number;
  created_at: number;
}

// Bank Account types
export interface BankAccount {
  id: string;
  name: string;
  account_number: string;
  bank_name?: string;
  balance: number;
  currency: string;
  created_at: number;
  updated_at: number;
}

// Bank Statement types
export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_number: string;
  statement_date: number;
  closing_balance: number;
  file_path?: string;
  status: "pending" | "processed";
  created_at: number;
  updated_at: number;
}

// Bank Transaction types
export interface BankTransaction {
  id: string;
  statement_id: string;
  transaction_date: number;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: "unmatched" | "matched" | "rejected";
  matched_to_journal_entry_id?: string;
  created_at: number;
  updated_at?: number;
}

// Audit Log types
export interface AuditLog {
  id: string;
  user_id: string;
  operation: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  changes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: number;
}

// Session types
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
  created_at: number;
}

// Generic query result types
export type SelectUser = Pick<
  User,
  "id" | "name" | "email" | "role" | "created_at" | "updated_at"
>;
export type SelectCustomer = Pick<
  Customer,
  "id" | "name" | "email" | "phone" | "address" | "created_at" | "updated_at"
>;
export type SelectQuotation = Pick<
  Quotation,
  | "id"
  | "customer_id"
  | "quotation_number"
  | "status"
  | "total_amount"
  | "created_at"
  | "updated_at"
>;
export type SelectInvoice = Pick<
  Invoice,
  | "id"
  | "customer_id"
  | "invoice_number"
  | "status"
  | "total_amount"
  | "amount_paid"
  | "due_date"
  | "created_at"
  | "updated_at"
>;
export type SelectJournalEntry = Pick<
  JournalEntry,
  | "id"
  | "description"
  | "debit"
  | "credit"
  | "account_id"
  | "transaction_date"
  | "created_at"
>;
export type SelectBankAccount = Pick<
  BankAccount,
  | "id"
  | "name"
  | "account_number"
  | "bank_name"
  | "balance"
  | "currency"
  | "created_at"
  | "updated_at"
>;
export type SelectBankStatement = Pick<
  BankStatement,
  | "id"
  | "bank_account_id"
  | "statement_number"
  | "statement_date"
  | "closing_balance"
  | "status"
  | "created_at"
  | "updated_at"
>;
export type SelectBankTransaction = Pick<
  BankTransaction,
  | "id"
  | "statement_id"
  | "transaction_date"
  | "description"
  | "amount"
  | "type"
  | "status"
  | "matched_to_journal_entry_id"
>;
export type SelectAuditLog = Pick<
  AuditLog,
  "id" | "user_id" | "operation" | "table_name" | "record_id" | "created_at"
>;
export type SelectSession = Pick<
  Session,
  "id" | "user_id" | "token" | "expires_at" | "created_at"
>;
