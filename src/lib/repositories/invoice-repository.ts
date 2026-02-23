/**
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

 * Invoice Repository
 *
 * Data access layer for Invoice entity.
 */

import { SQLiteDatabase } from "../database/sqlite";
import { Invoice } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateInvoiceInput {
  customer_id: string;
  invoice_number: string;
  quotation_id?: string;
  status?: "draft" | "pending" | "partial" | "paid" | "overdue";
  total_amount: number;
  amount_paid: number;
  due_date: number;
}

export interface UpdateInvoiceInput {
  customer_id?: string;
  invoice_number?: string;
  quotation_id?: string;
  status?: "draft" | "pending" | "partial" | "paid" | "overdue";
  total_amount?: number;
  amount_paid?: number;
  due_date?: number;
}

export class InvoiceRepository {
  constructor(private db: unknown) {}

  /**
   * Create a new invoice
   */
  create(data: CreateInvoiceInput): Invoice {
    const now = Date.now();
    const invoice: Invoice = {
      id: uuidv4(),
      customer_id: data.customer_id,
      invoice_number: data.invoice_number,
      quotation_id: data.quotation_id,
      status: data.status || "pending",
      total_amount: data.total_amount,
      amount_paid: data.amount_paid,
      due_date: data.due_date,
      created_at: now,
      updated_at: now,
    };

    (this.db as any).run(
      "INSERT INTO invoices (id, customer_id, invoice_number, quotation_id, status, total_amount, amount_paid, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        invoice.id,
        invoice.customer_id,
        invoice.invoice_number,
        invoice.quotation_id,
        invoice.status,
        invoice.total_amount,
        invoice.amount_paid,
        invoice.due_date,
        invoice.created_at,
        invoice.updated_at,
      ],
    );

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  findById(id: string): Invoice | undefined {
    return (this.db as any).get("SELECT * FROM invoices WHERE id = ?", [id]) as
      | Invoice
      | undefined;
  }

  /**
   * Get invoice by number
   */
  findByNumber(invoice_number: string): Invoice | undefined {
    return (this.db as any).get("SELECT * FROM invoices WHERE invoice_number = ?", [
      invoice_number,
    ]) as Invoice | undefined;
  }

  /**
   * Get all invoices
   */
  findAll(): Invoice[] {
    return (this.db as any).query(
      "SELECT * FROM invoices ORDER BY created_at DESC",
    ) as Invoice[];
  }

  /**
   * Get invoices by customer
   */
  findByCustomer(customer_id: string): Invoice[] {
    return (this.db as any).query(
      "SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC",
      [customer_id],
    ) as Invoice[];
  }

  /**
   * Get invoices by status
   */
  findByStatus(status: string): Invoice[] {
    return (this.db as any).query(
      "SELECT * FROM invoices WHERE status = ? ORDER BY created_at DESC",
      [status],
    ) as Invoice[];
  }

  /**
   * Get invoices by quotation
   */
  findByQuotation(quotation_id: string): Invoice[] {
    return (this.db as any).query(
      "SELECT * FROM invoices WHERE quotation_id = ? ORDER BY created_at DESC",
      [quotation_id],
    ) as Invoice[];
  }

  /**
   * Update invoice
   */
  update(id: string, data: UpdateInvoiceInput): Invoice | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.customer_id !== undefined) {
      updates.push("customer_id = ?");
      values.push(data.customer_id);
    }
    if (data.invoice_number !== undefined) {
      updates.push("invoice_number = ?");
      values.push(data.invoice_number);
    }
    if (data.quotation_id !== undefined) {
      updates.push("quotation_id = ?");
      values.push(data.quotation_id);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.total_amount !== undefined) {
      updates.push("total_amount = ?");
      values.push(data.total_amount);
    }
    if (data.amount_paid !== undefined) {
      updates.push("amount_paid = ?");
      values.push(data.amount_paid);
    }
    if (data.due_date !== undefined) {
      updates.push("due_date = ?");
      values.push(data.due_date);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    (this.db as any).run(
      `UPDATE invoices SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete invoice
   */
  delete(id: string): boolean {
    const result = (this.db as any).run("DELETE FROM invoices WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Check if invoice exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get("SELECT 1 FROM invoices WHERE id = ?", [
      id,
    ]) as Record<string, unknown>;
    return !!result;
  }

  /**
   * Get invoice count
   */
  count(): number {
    const result = (this.db as any).get(
      "SELECT COUNT(*) as count FROM invoices",
    ) as Record<string, unknown>;
    return (result as Record<string, unknown>).count as number;
  }
}
