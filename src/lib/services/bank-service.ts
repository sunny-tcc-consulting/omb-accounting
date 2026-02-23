/**
 * Bank Service
 *
 * Business logic layer for Bank Reconciliation.
 */

import { dbManager } from "@/lib/database/database";
import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import {
  BankAccount,
  BankStatement,
  BankTransaction,
} from "@/lib/types/database";

export interface BankReconciliationResult {
  total_transactions: number;
  matched: number;
  unmatched: number;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export class BankService {
  constructor(
    private bankAccountRepository: BankAccountRepository,
    private bankStatementRepository: BankStatementRepository,
    private bankTransactionRepository: BankTransactionRepository,
  ) {}

  /**
   * Get all bank accounts
   */
  getAllBankAccounts(): BankAccount[] {
    return this.bankAccountRepository.findAll();
  }

  /**
   * Get primary bank account (first account with balance > 0)
   */
  getPrimaryBankAccount(): BankAccount | undefined {
    const accounts = this.getAllBankAccounts();
    return accounts.find((a) => a.balance > 0) || accounts[0];
  }

  /**
   * Get bank account by ID
   */
  getBankAccountById(id: string): BankAccount | undefined {
    return this.bankAccountRepository.findById(id);
  }

  /**
   * Get bank statements for an account
   */
  getBankStatements(bank_account_id: string): BankStatement[] {
    return this.bankStatementRepository.findByAccount(bank_account_id);
  }

  /**
   * Get bank transactions for a statement
   */
  getBankTransactions(statement_id: string): BankTransaction[] {
    return this.bankTransactionRepository.findByStatement(statement_id);
  }

  /**
   * Get bank transactions by status
   */
  getBankTransactionsByStatus(status: string): BankTransaction[] {
    return this.bankTransactionRepository.findByStatus(status);
  }

  /**
   * Get bank transactions by type
   */
  getBankTransactionsByType(type: string): BankTransaction[] {
    return this.bankTransactionRepository.findByType(type);
  }

  /**
   * Get bank transactions by account
   */
  getBankTransactionsByAccount(bank_account_id: string): BankTransaction[] {
    const statements =
      this.bankStatementRepository.findByAccount(bank_account_id);
    const transactionIds = statements.map((s) => s.id);
    return this.bankTransactionRepository.findByStatement(
      transactionIds.join(","),
    );
  }

  /**
   * Get reconciliation summary for an account
   */
  getReconciliationSummary(bank_account_id: string): BankReconciliationResult {
    const statements =
      this.bankStatementRepository.findByAccount(bank_account_id);
    const transactionIds = statements.map((s) => s.id);
    const transactions = this.bankTransactionRepository.findByStatement(
      transactionIds.join(","),
    );

    const matched = transactions.filter((t) => t.status === "matched").length;
    const unmatched = transactions.filter(
      (t) => t.status === "unmatched",
    ).length;
    const totalDebit = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCredit = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = statements.reduce((sum, s) => sum + s.closing_balance, 0);

    return {
      total_transactions: transactions.length,
      matched,
      unmatched,
      total_debit: totalDebit,
      total_credit: totalCredit,
      balance,
    };
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    id: string,
    status: "matched" | "unmatched" | "rejected",
  ): boolean {
    return this.bankTransactionRepository.update(id, { status }).exists;
  }

  /**
   * Update transaction with journal entry match
   */
  updateTransactionWithJournalEntry(
    id: string,
    matched_to_journal_entry_id: string,
  ): boolean {
    return this.bankTransactionRepository.update(id, {
      matched_to_journal_entry_id,
    }).exists;
  }

  /**
   * Update statement status
   */
  updateStatementStatus(id: string, status: "pending" | "processed"): boolean {
    return this.bankStatementRepository.update(id, { status }).exists;
  }

  /**
   * Get transactions for auto-matching
   */
  getUnmatchedTransactions(): BankTransaction[] {
    return this.bankTransactionRepository.findByStatus("unmatched");
  }

  /**
   * Get transactions by amount range
   */
  getTransactionsByAmountRange(
    minAmount: number,
    maxAmount: number,
  ): BankTransaction[] {
    return this.bankTransactionRepository
      .findAll()
      .filter((t) => t.amount >= minAmount && t.amount <= maxAmount);
  }

  /**
   * Get transactions by date range
   */
  getTransactionsByDateRange(
    startDate: number,
    endDate: number,
  ): BankTransaction[] {
    return this.bankTransactionRepository
      .findAll()
      .filter(
        (t) => t.transaction_date >= startDate && t.transaction_date <= endDate,
      );
  }
}

/**
 * Standalone function to get all bank accounts
 */
export function getAllBankAccounts(): BankAccount[] {
  const db = dbManager.getDatabase();
  const bankAccountRepository = new BankAccountRepository(db);
  const bankAccountService = new BankService(
    bankAccountRepository,
    new BankStatementRepository(db),
    new BankTransactionRepository(db),
  );
  return bankAccountService.getAllBankAccounts();
}

/**
 * Standalone function to get primary bank account
 */
export function getPrimaryBankAccount(): BankAccount | undefined {
  const db = dbManager.getDatabase();
  const bankAccountRepository = new BankAccountRepository(db);
  const bankAccountService = new BankService(
    bankAccountRepository,
    new BankStatementRepository(db),
    new BankTransactionRepository(db),
  );
  return bankAccountService.getPrimaryBankAccount();
}
