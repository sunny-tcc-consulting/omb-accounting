/**
 * Quotation Repository
 *
 * Data access layer for Quotation entity.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

import { SQLiteDatabase } from "../database/sqlite";
import { Quotation } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateQuotationInput {
  customer_id: string;
  quotation_number: string;
  status?: "draft" | "sent" | "accepted" | "rejected";
  total_amount?: number;
}

export interface UpdateQuotationInput {
  customer_id?: string;
  quotation_number?: string;
  status?: "draft" | "sent" | "accepted" | "rejected";
  total_amount?: number;
}

export class QuotationRepository {
  constructor(private db: unknown) {}

  /**
   * Create a new quotation
   */
  create(data: CreateQuotationInput): Quotation {
    const now = Date.now();
    const quotation: Quotation = {
      id: uuidv4(),
      customer_id: data.customer_id,
      quotation_number: data.quotation_number,
      status: data.status || "draft",
      total_amount: data.total_amount || 0,
      created_at: now,
      updated_at: now,
    };

    (this.db as any).run(
      "INSERT INTO quotations (id, customer_id, quotation_number, status, total_amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        quotation.id,
        quotation.customer_id,
        quotation.quotation_number,
        quotation.status,
        quotation.total_amount,
        quotation.created_at,
        quotation.updated_at,
      ],
    );

    return quotation;
  }

  /**
   * Get quotation by ID
   */
  findById(id: string): Quotation | undefined {
    return (this.db as any).get("SELECT * FROM quotations WHERE id = ?", [id]) as
      | Quotation
      | undefined;
  }

  /**
   * Get quotation by number
   */
  findByNumber(quotation_number: string): Quotation | undefined {
    return (this.db as any).get("SELECT * FROM quotations WHERE quotation_number = ?", [
      quotation_number,
    ]) as Quotation | undefined;
  }

  /**
   * Get all quotations
   */
  findAll(): Quotation[] {
    return (this.db as any).query(
      "SELECT * FROM quotations ORDER BY created_at DESC",
    ) as Quotation[];
  }

  /**
   * Get quotations by customer
   */
  findByCustomer(customer_id: string): Quotation[] {
    return (this.db as any).query(
      "SELECT * FROM quotations WHERE customer_id = ? ORDER BY created_at DESC",
      [customer_id],
    ) as Quotation[];
  }

  /**
   * Get quotations by status
   */
  findByStatus(status: string): Quotation[] {
    return (this.db as any).query(
      "SELECT * FROM quotations WHERE status = ? ORDER BY created_at DESC",
      [status],
    ) as Quotation[];
  }

  /**
   * Update quotation
   */
  update(id: string, data: UpdateQuotationInput): Quotation | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.customer_id !== undefined) {
      updates.push("customer_id = ?");
      values.push(data.customer_id);
    }
    if (data.quotation_number !== undefined) {
      updates.push("quotation_number = ?");
      values.push(data.quotation_number);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.total_amount !== undefined) {
      updates.push("total_amount = ?");
      values.push(data.total_amount);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    (this.db as any).run(
      `UPDATE quotations SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete quotation
   */
  delete(id: string): boolean {
    const result = (this.db as any).run("DELETE FROM quotations WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Check if quotation exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get("SELECT 1 FROM quotations WHERE id = ?", [
      id,
    ]) as Record<string, unknown>;
    return !!result;
  }

  /**
   * Get quotation count
   */
  count(): number {
    const result = (this.db as any).get(
      "SELECT COUNT(*) as count FROM quotations",
    ) as Record<string, unknown>;
    return (result as Record<string, unknown>).count as number;
  }
}
