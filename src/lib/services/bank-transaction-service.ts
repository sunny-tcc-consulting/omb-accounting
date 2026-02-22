/**
 * Bank Transaction Service
 *
 * Business logic layer for BankTransaction entity.
 */

import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import {
  CreateBankTransactionInput,
  UpdateBankTransactionInput,
} from "@/lib/repositories/bank-transaction-repository";
import { v4 as uuidv4 } from "uuid";

export interface BankTransactionDTO {
  id: string;
  statement_id: string;
  transaction_date: number;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: "unmatched" | "matched" | "rejected";
  matched_to_journal_entry_id?: string;
  created_at: number;
}

export class BankTransactionService {
  constructor(private bankTransactionRepository: BankTransactionRepository) {}

  /**
   * Create a new bank transaction
   */
  create(data: CreateBankTransactionInput): BankTransactionDTO {
    // Validate amount is positive
    if (data.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate type is either credit or debit
    if (data.type !== "credit" && data.type !== "debit") {
      throw new Error("Type must be either credit or debit");
    }

    // Validate transaction date
    if (data.transaction_date < 0) {
      throw new Error("Transaction date must be a valid timestamp");
    }

    const bankTransaction = this.bankTransactionRepository.create(data);

    return {
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    };
  }

  /**
   * Get bank transaction by ID
   */
  getById(id: string): BankTransactionDTO | undefined {
    const bankTransaction = this.bankTransactionRepository.findById(id);
    if (!bankTransaction) {
      return undefined;
    }

    return {
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    };
  }

  /**
   * Get all bank transactions
   */
  getAll(): BankTransactionDTO[] {
    const bankTransactions = this.bankTransactionRepository.findAll();
    return bankTransactions.map((bankTransaction) => ({
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    }));
  }

  /**
   * Get bank transactions by statement
   */
  getByStatement(statement_id: string): BankTransactionDTO[] {
    const bankTransactions =
      this.bankTransactionRepository.findByStatement(statement_id);
    return bankTransactions.map((bankTransaction) => ({
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    }));
  }

  /**
   * Get bank transactions by status
   */
  getByStatus(status: string): BankTransactionDTO[] {
    const bankTransactions =
      this.bankTransactionRepository.findByStatus(status);
    return bankTransactions.map((bankTransaction) => ({
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    }));
  }

  /**
   * Get unmatched bank transactions
   */
  getUnmatched(): BankTransactionDTO[] {
    const bankTransactions = this.bankTransactionRepository.findUnmatched();
    return bankTransactions.map((bankTransaction) => ({
      id: bankTransaction.id,
      statement_id: bankTransaction.statement_id,
      transaction_date: bankTransaction.transaction_date,
      description: bankTransaction.description,
      amount: bankTransaction.amount,
      type: bankTransaction.type,
      status: bankTransaction.status,
      matched_to_journal_entry_id: bankTransaction.matched_to_journal_entry_id,
      created_at: bankTransaction.created_at,
    }));
  }

  /**
   * Update bank transaction
   */
  update(
    id: string,
    data: UpdateBankTransactionInput,
  ): BankTransactionDTO | undefined {
    // Check if bank transaction exists
    const existing = this.bankTransactionRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Validate amount is positive
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate type is either credit or debit
    if (
      data.type !== undefined &&
      data.type !== "credit" &&
      data.type !== "debit"
    ) {
      throw new Error("Type must be either credit or debit");
    }

    // Validate transaction date
    if (data.transaction_date !== undefined && data.transaction_date < 0) {
      throw new Error("Transaction date must be a valid timestamp");
    }

    const updated = this.bankTransactionRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      statement_id: updated.statement_id,
      transaction_date: updated.transaction_date,
      description: updated.description,
      amount: updated.amount,
      type: updated.type,
      status: updated.status,
      matched_to_journal_entry_id: updated.matched_to_journal_entry_id,
      created_at: updated.created_at,
    };
  }

  /**
   * Delete bank transaction
   */
  delete(id: string): boolean {
    return this.bankTransactionRepository.delete(id);
  }

  /**
   * Get bank transaction count
   */
  count(): number {
    return this.bankTransactionRepository.count();
  }
}
