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
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  items?: string; // JSON string
  validity_period?: number;
  issued_date?: number;
  terms_and_conditions?: string;
  notes?: string;
}

export interface UpdateQuotationInput {
  customer_id?: string;
  quotation_number?: string;
  status?: "draft" | "sent" | "accepted" | "rejected";
  total_amount?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  items?: string; // JSON string
  validity_period?: number;
  issued_date?: number;
  terms_and_conditions?: string;
  notes?: string;
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
      customer_name: data.customer_name || null,
      customer_email: data.customer_email || null,
      customer_phone: data.customer_phone || null,
      currency: data.currency || "CNY",
      subtotal: data.subtotal || 0,
      tax: data.tax || 0,
      items: data.items || null,
      validity_period: data.validity_period || null,
      issued_date: data.issued_date || null,
      terms_and_conditions: data.terms_and_conditions || null,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };

    (this.db as any).run(
      `INSERT INTO quotations (
        id, customer_id, quotation_number, status, total_amount,
        customer_name, customer_email, customer_phone, currency, subtotal, tax,
        items, validity_period, issued_date, terms_and_conditions, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation.id,
        quotation.customer_id,
        quotation.quotation_number,
        quotation.status,
        quotation.total_amount,
        quotation.customer_name,
        quotation.customer_email,
        quotation.customer_phone,
        quotation.currency,
        quotation.subtotal,
        quotation.tax,
        quotation.items,
        quotation.validity_period,
        quotation.issued_date,
        quotation.terms_and_conditions,
        quotation.notes,
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
