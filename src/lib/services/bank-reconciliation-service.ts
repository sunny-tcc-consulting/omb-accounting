/**
 * Bank Reconciliation Service
 *
 * Business logic layer for bank reconciliation.
 */

import { dbManager } from "@/lib/database/database";
import { JournalEntryRepository } from "@/lib/repositories/journal-entry-repository";
import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import { QuotationRepository } from "@/lib/repositories/quotation-repository";
import { InvoiceRepository } from "@/lib/repositories/invoice-repository";
import { BankStatement, BankTransaction } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface ReconciliationSummary {
  total_debit: number;
  total_credit: number;
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  rejected_transactions: number;
}

export class BankReconciliationService {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private bankStatementRepository: BankStatementRepository,
    private bankTransactionRepository: BankTransactionRepository,
    private quotationRepository: QuotationRepository,
    private invoiceRepository: InvoiceRepository,
  ) {}

  /**
   * Get reconciliation summary for a bank statement
   */
  getReconciliationSummary(statement_id: string): ReconciliationSummary {
    const transactions =
      this.bankTransactionRepository.findByStatement(statement_id);

    const summary: ReconciliationSummary = {
      total_debit: 0,
      total_credit: 0,
      total_transactions: transactions.length,
      matched_transactions: 0,
      unmatched_transactions: 0,
      rejected_transactions: 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "debit") {
        summary.total_debit += transaction.amount;
      } else {
        summary.total_credit += transaction.amount;
      }

      if (transaction.status === "matched") {
        summary.matched_transactions++;
      } else if (transaction.status === "unmatched") {
        summary.unmatched_transactions++;
      } else if (transaction.status === "rejected") {
        summary.rejected_transactions++;
      }
    });

    return summary;
  }

  /**
   * Match a bank transaction with a journal entry
   */
  matchTransaction(transaction_id: string, journal_entry_id: string): boolean {
    // Check if transaction exists
    const transaction = this.bankTransactionRepository.findById(transaction_id);
    if (!transaction) {
      return false;
    }

    // Check if journal entry exists
    const journalEntry = this.journalEntryRepository.findById(journal_entry_id);
    if (!journalEntry) {
      return false;
    }

    // Check if transaction is already matched
    if (transaction.status === "matched") {
      return false;
    }

    // Check if transaction amount matches journal entry amount
    if (
      transaction.amount !== journalEntry.debit ||
      transaction.amount !== journalEntry.credit
    ) {
      return false;
    }

    // Update transaction
    this.bankTransactionRepository.update(transaction_id, {
      status: "matched",
      matched_to_journal_entry_id: journal_entry_id,
    });

    return true;
  }

  /**
   * Reject a bank transaction
   */
  rejectTransaction(transaction_id: string): boolean {
    // Check if transaction exists
    const transaction = this.bankTransactionRepository.findById(transaction_id);
    if (!transaction) {
      return false;
    }

    // Update transaction
    this.bankTransactionRepository.update(transaction_id, {
      status: "rejected",
      matched_to_journal_entry_id: null,
    });

    return true;
  }

  /**
   * Unmatch a bank transaction
   */
  unmatchTransaction(transaction_id: string): boolean {
    // Check if transaction exists
    const transaction = this.bankTransactionRepository.findById(transaction_id);
    if (!transaction) {
      return false;
    }

    // Update transaction
    this.bankTransactionRepository.update(transaction_id, {
      status: "unmatched",
      matched_to_journal_entry_id: null,
    });

    return true;
  }

  /**
   * Reconcile a bank statement
   */
  reconcileStatement(statement_id: string): boolean {
    // Check if statement exists
    const statement = this.bankStatementRepository.findById(statement_id);
    if (!statement) {
      return false;
    }

    // Get all transactions for the statement
    const transactions =
      this.bankTransactionRepository.findByStatement(statement_id);

    // Calculate total transactions
    const total_transactions = transactions.length;
    const matched_transactions = transactions.filter(
      (t) => t.status === "matched",
    ).length;
    const unmatched_transactions = transactions.filter(
      (t) => t.status === "unmatched",
    ).length;
    const rejected_transactions = transactions.filter(
      (t) => t.status === "rejected",
    ).length;

    // Update statement status
    this.bankStatementRepository.update(statement_id, {
      status:
        matched_transactions === total_transactions ? "processed" : "pending",
    });

    return true;
  }

  /**
   * Get reconciliation history for a bank account
   */
  getReconciliationHistory(bank_account_id: string): BankStatement[] {
    const statements =
      this.bankStatementRepository.findByBankAccount(bank_account_id);
    return statements.map((statement) => {
      const summary = this.getReconciliationSummary(statement.id);
      return {
        ...statement,
        summary,
      };
    });
  }

  /**
   * Get all unmatched transactions
   */
  getAllUnmatchedTransactions(): BankTransaction[] {
    return this.bankTransactionRepository.findUnmatched();
  }
}

/**
 * Standalone function to get reconciliation history for a bank account
 */
export function getReconciliationHistory(
  bank_account_id: string,
): BankStatement[] {
  const db = dbManager.getDatabase();
  const bankStatementRepository = new BankStatementRepository(db);
  const bankReconciliationService = new BankReconciliationService(
    new JournalEntryRepository(db),
    bankStatementRepository,
    new BankTransactionRepository(db),
    new QuotationRepository(db),
    new InvoiceRepository(db),
  );
  return bankReconciliationService.getReconciliationHistory(bank_account_id);
}
