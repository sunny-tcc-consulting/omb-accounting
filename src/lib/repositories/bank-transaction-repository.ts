/**
 * Bank Transaction Repository
 *
 * Data access layer for BankTransaction entity.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

import { SQLiteDatabase } from "../database/sqlite";
import { BankTransaction } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateBankTransactionInput {
  statement_id: string;
  transaction_date: number;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status?: "unmatched" | "matched" | "rejected";
  matched_to_journal_entry_id?: string;
}

export interface UpdateBankTransactionInput {
  statement_id?: string;
  transaction_date?: number;
  description?: string;
  amount?: number;
  type?: "credit" | "debit";
  status?: "unmatched" | "matched" | "rejected";
  matched_to_journal_entry_id?: string;
}

export class BankTransactionRepository {
  constructor(private db: unknown) {}

  /**
   * Create a new bank transaction
   */
  create(data: CreateBankTransactionInput): BankTransaction {
    const now = Date.now();
    const bankTransaction: BankTransaction = {
      id: uuidv4(),
      statement_id: data.statement_id,
      transaction_date: data.transaction_date,
      description: data.description,
      amount: data.amount,
      type: data.type,
      status: data.status || "unmatched",
      matched_to_journal_entry_id: data.matched_to_journal_entry_id,
      created_at: now,
    };

    (this.db as any).run(
      "INSERT INTO bank_transactions (id, statement_id, transaction_date, description, amount, type, status, matched_to_journal_entry_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        bankTransaction.id,
        bankTransaction.statement_id,
        bankTransaction.transaction_date,
        bankTransaction.description,
        bankTransaction.amount,
        bankTransaction.type,
        bankTransaction.status,
        bankTransaction.matched_to_journal_entry_id,
        bankTransaction.created_at,
      ],
    );

    return bankTransaction;
  }

  /**
   * Get bank transaction by ID
   */
  findById(id: string): BankTransaction | undefined {
    return (this.db as any).get("SELECT * FROM bank_transactions WHERE id = ?", [id]) as
      | BankTransaction
      | undefined;
  }

  /**
   * Get all bank transactions
   */
  findAll(): BankTransaction[] {
    return (this.db as any).query(
      "SELECT * FROM bank_transactions ORDER BY transaction_date DESC",
    ) as BankTransaction[];
  }

  /**
   * Get bank transactions by statement
   */
  findByStatement(statement_id: string): BankTransaction[] {
    return (this.db as any).query(
      "SELECT * FROM bank_transactions WHERE statement_id = ? ORDER BY transaction_date ASC",
      [statement_id],
    ) as BankTransaction[];
  }

  /**
   * Get bank transactions by status
   */
  findByStatus(status: string): BankTransaction[] {
    return (this.db as any).query(
      "SELECT * FROM bank_transactions WHERE status = ? ORDER BY transaction_date DESC",
      [status],
    ) as BankTransaction[];
  }

  /**
   * Get unmatched bank transactions
   */
  findUnmatched(): BankTransaction[] {
    return (this.db as any).query(
      "SELECT * FROM bank_transactions WHERE status = 'unmatched' ORDER BY transaction_date DESC",
    ) as BankTransaction[];
  }

  /**
   * Update bank transaction
   */
  update(
    id: string,
    data: UpdateBankTransactionInput,
  ): BankTransaction | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.statement_id !== undefined) {
      updates.push("statement_id = ?");
      values.push(data.statement_id);
    }
    if (data.transaction_date !== undefined) {
      updates.push("transaction_date = ?");
      values.push(data.transaction_date);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.amount !== undefined) {
      updates.push("amount = ?");
      values.push(data.amount);
    }
    if (data.type !== undefined) {
      updates.push("type = ?");
      values.push(data.type);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.matched_to_journal_entry_id !== undefined) {
      updates.push("matched_to_journal_entry_id = ?");
      values.push(data.matched_to_journal_entry_id);
    }

    if (updates.length === 0) return existing;

    updates.push("created_at = ?");
    values.push(existing.created_at);
    values.push(id);

    (this.db as any).run(
      `UPDATE bank_transactions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete bank transaction
   */
  delete(id: string): boolean {
    const result = (this.db as any).run("DELETE FROM bank_transactions WHERE id = ?", [
      id,
    ]);
    return result.changes > 0;
  }

  /**
   * Check if bank transaction exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get("SELECT 1 FROM bank_transactions WHERE id = ?", [
      id,
    ]) as Record<string, unknown>;
    return !!result;
  }

  /**
   * Get bank transaction count
   */
  count(): number {
    const result = (this.db as any).get(
      "SELECT COUNT(*) as count FROM bank_transactions",
    ) as Record<string, unknown>;
    return (result as Record<string, unknown>).count as number;
  }
}
