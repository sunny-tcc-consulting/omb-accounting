/**
 * Bank Account Repository
 *
 * Data access layer for BankAccount entity.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

import { SQLiteDatabase } from "../database/sqlite";
import { BankAccount } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateBankAccountInput {
  name: string;
  account_number: string;
  bank_name?: string;
  balance?: number;
  currency?: string;
}

export interface UpdateBankAccountInput {
  name?: string;
  account_number?: string;
  bank_name?: string;
  balance?: number;
  currency?: string;
}

export class BankAccountRepository {
  constructor(private db: unknown) {}

  /**
   * Create a new bank account
   */
  create(data: CreateBankAccountInput): BankAccount {
    const now = Date.now();
    const bankAccount: BankAccount = {
      id: uuidv4(),
      name: data.name,
      account_number: data.account_number,
      bank_name: data.bank_name,
      balance: data.balance || 0,
      currency: data.currency || "HKD",
      created_at: now,
      updated_at: now,
    };

    (this.db as any).run(
      "INSERT INTO bank_accounts (id, name, account_number, bank_name, balance, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        bankAccount.id,
        bankAccount.name,
        bankAccount.account_number,
        bankAccount.bank_name,
        bankAccount.balance,
        bankAccount.currency,
        bankAccount.created_at,
        bankAccount.updated_at,
      ],
    );

    return bankAccount;
  }

  /**
   * Get bank account by ID
   */
  findById(id: string): BankAccount | undefined {
    return (this.db as any).get("SELECT * FROM bank_accounts WHERE id = ?", [id]) as
      | BankAccount
      | undefined;
  }

  /**
   * Get bank account by account number
   */
  findByAccountNumber(account_number: string): BankAccount | undefined {
    return (this.db as any).get("SELECT * FROM bank_accounts WHERE account_number = ?", [
      account_number,
    ]) as BankAccount | undefined;
  }

  /**
   * Get all bank accounts
   */
  findAll(): BankAccount[] {
    return (this.db as any).prepare(
      "SELECT * FROM bank_accounts ORDER BY created_at DESC",
    ) as BankAccount[];
  }

  /**
   * Get bank account by name
   */
  findByName(name: string): BankAccount[] {
    return (this.db as any).prepare(
      "SELECT * FROM bank_accounts WHERE name LIKE ? ORDER BY created_at DESC",
      [`%${name}%`],
    ) as BankAccount[];
  }

  /**
   * Get primary bank account
   */
  getPrimary(): BankAccount | undefined {
    // For now, return the first account. Could add a 'is_primary' flag.
    return this.findAll()[0];
  }

  /**
   * Update bank account
   */
  update(id: string, data: UpdateBankAccountInput): BankAccount | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.account_number !== undefined) {
      updates.push("account_number = ?");
      values.push(data.account_number);
    }
    if (data.bank_name !== undefined) {
      updates.push("bank_name = ?");
      values.push(data.bank_name);
    }
    if (data.balance !== undefined) {
      updates.push("balance = ?");
      values.push(data.balance);
    }
    if (data.currency !== undefined) {
      updates.push("currency = ?");
      values.push(data.currency);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    (this.db as any).run(
      `UPDATE bank_accounts SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete bank account
   */
  delete(id: string): boolean {
    const result = (this.db as any).run("DELETE FROM bank_accounts WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Check if bank account exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get("SELECT 1 FROM bank_accounts WHERE id = ?", [
      id,
    ]) as Record<string, unknown>;
    return !!result;
  }

  /**
   * Get bank account count
   */
  count(): number {
    const result = (this.db as any).get(
      "SELECT COUNT(*) as count FROM bank_accounts",
    ) as Record<string, unknown>;
    return (result as Record<string, unknown>).count as number;
  }
}
