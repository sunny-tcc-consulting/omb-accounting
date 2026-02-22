/**
 * Bank Statement Repository
 *
 * Data access layer for BankStatement entity.
 */

import { SQLiteDatabase } from "../sqlite";
import { BankStatement } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateBankStatementInput {
  bank_account_id: string;
  statement_number: string;
  statement_date: number;
  closing_balance: number;
  file_path?: string;
  status?: "pending" | "processed";
}

export interface UpdateBankStatementInput {
  bank_account_id?: string;
  statement_number?: string;
  statement_date?: number;
  closing_balance?: number;
  file_path?: string;
  status?: "pending" | "processed";
}

export class BankStatementRepository {
  constructor(private db: SQLiteDatabase) {}

  /**
   * Create a new bank statement
   */
  create(data: CreateBankStatementInput): BankStatement {
    const now = Date.now();
    const bankStatement: BankStatement = {
      id: uuidv4(),
      bank_account_id: data.bank_account_id,
      statement_number: data.statement_number,
      statement_date: data.statement_date,
      closing_balance: data.closing_balance,
      file_path: data.file_path || null,
      status: data.status || "pending",
      created_at: now,
      updated_at: now,
    };

    this.db.run(
      "INSERT INTO bank_statements (id, bank_account_id, statement_number, statement_date, closing_balance, file_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        bankStatement.id,
        bankStatement.bank_account_id,
        bankStatement.statement_number,
        bankStatement.statement_date,
        bankStatement.closing_balance,
        bankStatement.file_path,
        bankStatement.status,
        bankStatement.created_at,
        bankStatement.updated_at,
      ],
    );

    return bankStatement;
  }

  /**
   * Get bank statement by ID
   */
  findById(id: string): BankStatement | undefined {
    return this.db.get<BankStatement>(
      "SELECT * FROM bank_statements WHERE id = ?",
      [id],
    );
  }

  /**
   * Get bank statement by number
   */
  findByNumber(statement_number: string): BankStatement | undefined {
    return this.db.get<BankStatement>(
      "SELECT * FROM bank_statements WHERE statement_number = ?",
      [statement_number],
    );
  }

  /**
   * Get all bank statements
   */
  findAll(): BankStatement[] {
    return this.db.query<BankStatement>(
      "SELECT * FROM bank_statements ORDER BY statement_date DESC",
    );
  }

  /**
   * Get bank statements by bank account
   */
  findByBankAccount(bank_account_id: string): BankStatement[] {
    return this.db.query<BankStatement>(
      "SELECT * FROM bank_statements WHERE bank_account_id = ? ORDER BY statement_date DESC",
      [bank_account_id],
    );
  }

  /**
   * Get bank statements by status
   */
  findByStatus(status: string): BankStatement[] {
    return this.db.query<BankStatement>(
      "SELECT * FROM bank_statements WHERE status = ? ORDER BY statement_date DESC",
      [status],
    );
  }

  /**
   * Get bank statements by date range
   */
  findByDateRange(startDate: number, endDate: number): BankStatement[] {
    return this.db.query<BankStatement>(
      "SELECT * FROM bank_statements WHERE statement_date >= ? AND statement_date <= ? ORDER BY statement_date DESC",
      [startDate, endDate],
    );
  }

  /**
   * Get bank statements by date
   */
  findByDate(statement_date: number): BankStatement[] {
    return this.db.query<BankStatement>(
      "SELECT * FROM bank_statements WHERE statement_date = ? ORDER BY statement_date DESC",
      [statement_date],
    );
  }

  /**
   * Update bank statement
   */
  update(
    id: string,
    data: UpdateBankStatementInput,
  ): BankStatement | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.bank_account_id !== undefined) {
      updates.push("bank_account_id = ?");
      values.push(data.bank_account_id);
    }
    if (data.statement_number !== undefined) {
      updates.push("statement_number = ?");
      values.push(data.statement_number);
    }
    if (data.statement_date !== undefined) {
      updates.push("statement_date = ?");
      values.push(data.statement_date);
    }
    if (data.closing_balance !== undefined) {
      updates.push("closing_balance = ?");
      values.push(data.closing_balance);
    }
    if (data.file_path !== undefined) {
      updates.push("file_path = ?");
      values.push(data.file_path);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    this.db.run(
      `UPDATE bank_statements SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete bank statement
   */
  delete(id: string): boolean {
    const result = this.db.run("DELETE FROM bank_statements WHERE id = ?", [
      id,
    ]);
    return result.changes > 0;
  }

  /**
   * Check if bank statement exists
   */
  exists(id: string): boolean {
    const result = this.db.get<Record<string, unknown>>(
      "SELECT 1 FROM bank_statements WHERE id = ?",
      [id],
    );
    return !!result;
  }

  /**
   * Get bank statement count
   */
  count(): number {
    const result = this.db.get<Record<string, unknown>>(
      "SELECT COUNT(*) as count FROM bank_statements",
    );
    return (result as Record<string, unknown>).count as number;
  }
}
