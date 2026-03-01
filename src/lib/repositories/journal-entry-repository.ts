/**
 * Journal Entry Repository
 *
 * Data access layer for JournalEntry entity.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

import { SQLiteDatabase } from "../database/sqlite";
import { JournalEntry } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateJournalEntryInput {
  description: string;
  debit: number;
  credit: number;
  account_id: string;
  transaction_date: number;
}

export interface UpdateJournalEntryInput {
  description?: string;
  debit?: number;
  credit?: number;
  account_id?: string;
  transaction_date?: number;
}

export class JournalEntryRepository {
  constructor(private db: any) {}

  /**
   * Create a new journal entry
   */
  create(data: CreateJournalEntryInput): JournalEntry {
    const now = Date.now();
    const journalEntry: JournalEntry = {
      id: uuidv4(),
      description: data.description,
      debit: data.debit,
      credit: data.credit,
      account_id: data.account_id,
      transaction_date: data.transaction_date,
      created_at: now,
    };

    (this.db as any).run(
      "INSERT INTO journal_entries (id, description, debit, credit, account_id, transaction_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        journalEntry.id,
        journalEntry.description,
        journalEntry.debit,
        journalEntry.credit,
        journalEntry.account_id,
        journalEntry.transaction_date,
        journalEntry.created_at,
      ],
    );

    return journalEntry;
  }

  /**
   * Get journal entry by ID
   */
  findById(id: string): JournalEntry | undefined {
    return (this.db as any).get("SELECT * FROM journal_entries WHERE id = ?", [
      id,
    ]) as JournalEntry | undefined;
  }

  /**
   * Get all journal entries
   */
  findAll(): JournalEntry[] {
    return (this.db as any).prepare(
      "SELECT * FROM journal_entries ORDER BY transaction_date DESC",
    ) as JournalEntry[];
  }

  /**
   * Get journal entries by account
   */
  findByAccount(account_id: string): JournalEntry[] {
    return (this.db as any).prepare(
      "SELECT * FROM journal_entries WHERE account_id = ? ORDER BY transaction_date DESC",
      [account_id],
    ) as JournalEntry[];
  }

  /**
   * Get journal entries by date range
   */
  findByDateRange(startDate: number, endDate: number): JournalEntry[] {
    return (this.db as any).prepare(
      "SELECT * FROM journal_entries WHERE transaction_date >= ? AND transaction_date <= ? ORDER BY transaction_date DESC",
      [startDate, endDate],
    ) as JournalEntry[];
  }

  /**
   * Get journal entries by date
   */
  findByDate(transaction_date: number): JournalEntry[] {
    return (this.db as any).prepare(
      "SELECT * FROM journal_entries WHERE transaction_date = ? ORDER BY transaction_date DESC",
      [transaction_date],
    ) as JournalEntry[];
  }

  /**
   * Update journal entry
   */
  update(id: string, data: UpdateJournalEntryInput): JournalEntry | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.debit !== undefined) {
      updates.push("debit = ?");
      values.push(data.debit);
    }
    if (data.credit !== undefined) {
      updates.push("credit = ?");
      values.push(data.credit);
    }
    if (data.account_id !== undefined) {
      updates.push("account_id = ?");
      values.push(data.account_id);
    }
    if (data.transaction_date !== undefined) {
      updates.push("transaction_date = ?");
      values.push(data.transaction_date);
    }

    if (updates.length === 0) return existing;

    updates.push("created_at = ?");
    values.push(existing.created_at);
    values.push(id);

    (this.db as any).run(
      `UPDATE journal_entries SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete journal entry
   */
  delete(id: string): boolean {
    const result = (this.db as any).run(
      "DELETE FROM journal_entries WHERE id = ?",
      [id],
    );
    return result.changes > 0;
  }

  /**
   * Check if journal entry exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get(
      "SELECT 1 FROM journal_entries WHERE id = ?",
      [id],
    ) as Record<string, unknown>;
    return !!result;
  }

  /**
   * Get journal entry count
   */
  count(): number {
    const result = (this.db as any).get(
      "SELECT COUNT(*) as count FROM journal_entries",
    ) as Record<string, unknown>;
    return (result as Record<string, unknown>).count as number;
  }
}
