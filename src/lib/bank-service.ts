/**
 * Bank Service - Bank account management
 * Part of Phase 4.6: Bank Reconciliation
 */

import { BankAccount, BankTransaction, BankStatement } from "@/types";

// In-memory bank account store
const bankAccounts: Map<string, BankAccount> = new Map();

// In-memory bank statement store
const bankStatements: Map<string, BankStatement> = new Map();

// In-memory bank transaction store
const bankTransactions: Map<string, BankTransaction> = new Map();

/**
 * Generate unique ID for bank account
 */
const generateBankAccountId = (): string => {
  return `bank-${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Generate unique ID for bank statement
 */
const generateBankStatementId = (): string => {
  return `stmt-${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Generate unique ID for bank transaction
 */
const generateBankTransactionId = (): string => {
  return `txn-${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Create a new bank account
 */
export const createBankAccount = (data: {
  name: string;
  bankName: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  currency: string;
  openingBalance?: number;
  isPrimary?: boolean;
}): BankAccount => {
  const id = generateBankAccountId();
  const now = new Date();

  const bankAccount: BankAccount = {
    id,
    name: data.name,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountType: data.accountType,
    currency: data.currency,
    openingBalance: data.openingBalance || 0,
    isPrimary: data.isPrimary || false,
    balance: data.openingBalance || 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  bankAccounts.set(id, bankAccount);
  return bankAccount;
};

/**
 * Get all bank accounts
 */
export const getAllBankAccounts = (): BankAccount[] => {
  return Array.from(bankAccounts.values()).filter((a) => a.isActive);
};

/**
 * Get bank account by ID
 */
export const getBankAccountById = (id: string): BankAccount | undefined => {
  return bankAccounts.get(id);
};

/**
 * Get bank accounts by type
 */
export const getBankAccountsByType = (
  accountType: "checking" | "savings",
): BankAccount[] => {
  return getAllBankAccounts().filter((a) => a.accountType === accountType);
};

/**
 * Get primary bank account
 */
export const getPrimaryBankAccount = (): BankAccount | undefined => {
  return getAllBankAccounts().find((a) => a.isPrimary);
};

/**
 * Update bank account
 */
export const updateBankAccount = (
  id: string,
  updates: Partial<BankAccount>,
): BankAccount | null => {
  const bankAccount = bankAccounts.get(id);
  if (!bankAccount) {
    return null;
  }

  const updated: BankAccount = {
    ...bankAccount,
    ...updates,
    id: bankAccount.id, // Prevent ID change
    name: updates.name || bankAccount.name,
    bankName: updates.bankName || bankAccount.bankName,
    accountNumber: updates.accountNumber || bankAccount.accountNumber,
    accountType: updates.accountType || bankAccount.accountType,
    currency: updates.currency || bankAccount.currency,
    openingBalance: updates.openingBalance ?? bankAccount.openingBalance,
    isPrimary: updates.isPrimary ?? bankAccount.isPrimary,
    isActive: updates.isActive ?? bankAccount.isActive,
    updatedAt: new Date(),
  };

  bankAccounts.set(id, updated);
  return updated;
};

/**
 * Delete bank account
 */
export const deleteBankAccount = (id: string): boolean => {
  return bankAccounts.delete(id);
};

/**
 * Create bank statement
 */
export const createBankStatement = (data: {
  bankAccountId: string;
  statementNumber: string;
  startDate: Date;
  endDate: Date;
  closingBalance: number;
  currency: string;
}): BankStatement => {
  const id = generateBankStatementId();
  const now = new Date();

  const bankAccount = bankAccounts.get(data.bankAccountId);
  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  const bankStatement: BankStatement = {
    id,
    bankAccountId: data.bankAccountId,
    statementNumber: data.statementNumber,
    startDate: data.startDate,
    endDate: data.endDate,
    closingBalance: data.closingBalance,
    currency: data.currency,
    status: "imported",
    importedAt: now,
    reconciledAt: null,
    createdAt: now,
    updatedAt: now,
  };

  bankStatements.set(id, bankStatement);
  return bankStatement;
};

/**
 * Get bank statements by bank account
 */
export const getBankStatementsByAccountId = (
  bankAccountId: string,
): BankStatement[] => {
  return Array.from(bankStatements.values())
    .filter((s) => s.bankAccountId === bankAccountId)
    .sort((a, b) => b.importedAt.getTime() - a.importedAt.getTime());
};

/**
 * Get bank statement by ID
 */
export const getBankStatementById = (id: string): BankStatement | undefined => {
  return bankStatements.get(id);
};

/**
 * Get bank transaction by ID
 */
export const getBankTransactionById = (
  id: string,
): BankTransaction | undefined => {
  return bankTransactions.get(id);
};

/**
 * Create bank transaction
 */
export const createBankTransaction = (data: {
  statementId: string;
  transactionDate: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category?: string;
  reference?: string;
}): BankTransaction => {
  const id = generateBankTransactionId();
  const now = new Date();

  const bankStatement = bankStatements.get(data.statementId);
  if (!bankStatement) {
    throw new Error("Bank statement not found");
  }

  const bankTransaction: BankTransaction = {
    id,
    statementId: data.statementId,
    transactionDate: data.transactionDate,
    description: data.description,
    amount: data.amount,
    type: data.type,
    category: data.category,
    reference: data.reference,
    status: "pending",
    matchedBookTransactionId: null,
    matchedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  bankTransactions.set(id, bankTransaction);
  return bankTransaction;
};

/**
 * Get bank transactions by statement
 */
export const getBankTransactionsByStatementId = (
  statementId: string,
): BankTransaction[] => {
  return Array.from(bankTransactions.values())
    .filter((t) => t.statementId === statementId)
    .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
};

/**
 * Get all bank transactions
 */
export const getAllBankTransactions = (): BankTransaction[] => {
  return Array.from(bankTransactions.values());
};

/**
 * Match bank transaction with book transaction
 */
export const matchBankTransaction = (
  bankTransactionId: string,
  bookTransactionId: string,
): boolean => {
  const bankTransaction = bankTransactions.get(bankTransactionId);
  if (!bankTransaction) {
    return false;
  }

  bankTransaction.matchedBookTransactionId = bookTransactionId;
  bankTransaction.matchedAt = new Date();
  bankTransaction.status = "matched";

  bankTransactions.set(bankTransactionId, bankTransaction);
  return true;
};

/**
 * Unmatch bank transaction
 */
export const unmatchBankTransaction = (bankTransactionId: string): boolean => {
  const bankTransaction = bankTransactions.get(bankTransactionId);
  if (!bankTransaction) {
    return false;
  }

  bankTransaction.matchedBookTransactionId = null;
  bankTransaction.matchedAt = null;
  bankTransaction.status = "pending";

  bankTransactions.set(bankTransactionId, bankTransaction);
  return true;
};

/**
 * Get unmatched bank transactions
 */
export const getUnmatchedBankTransactions = (): BankTransaction[] => {
  return Array.from(bankTransactions.values()).filter(
    (t) => t.status === "pending",
  );
};

/**
 * Get matched bank transactions
 */
export const getMatchedBankTransactions = (): BankTransaction[] => {
  return Array.from(bankTransactions.values()).filter(
    (t) => t.status === "matched",
  );
};

/**
 * Initialize default bank account for demo
 */
export const initializeDefaultBankAccount = (): BankAccount => {
  return createBankAccount({
    name: "Main Business Account",
    bankName: "HSBC",
    accountNumber: "123456789",
    accountType: "checking",
    currency: "HKD",
    openingBalance: 100000,
    isPrimary: true,
  });
};

// Initialize default bank account
initializeDefaultBankAccount();
