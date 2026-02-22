/**
 * Invoice Service
 *
 * Business logic layer for Invoice entity.
 */

import { InvoiceRepository } from "@/lib/repositories/invoice-repository";
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@/lib/repositories/invoice-repository";
import { v4 as uuidv4 } from "uuid";

export interface InvoiceDTO {
  id: string;
  customer_id: string;
  invoice_number: string;
  quotation_id?: string;
  status: "draft" | "pending" | "partial" | "paid" | "overdue";
  total_amount: number;
  amount_paid: number;
  due_date: number;
  created_at: number;
  updated_at: number;
}

export class InvoiceService {
  constructor(private invoiceRepository: InvoiceRepository) {}

  /**
   * Create a new invoice
   */
  create(data: CreateInvoiceInput): InvoiceDTO {
    // Check if invoice number already exists
    const existing = this.invoiceRepository.findByNumber(data.invoice_number);
    if (existing) {
      throw new Error("Invoice with this number already exists");
    }

    // Validate due date is in the future (unless status is overdue)
    if (data.status !== "overdue" && data.due_date < Date.now()) {
      throw new Error(
        "Due date must be in the future unless status is overdue",
      );
    }

    const invoice = this.invoiceRepository.create(data);

    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    };
  }

  /**
   * Get invoice by ID
   */
  getById(id: string): InvoiceDTO | undefined {
    const invoice = this.invoiceRepository.findById(id);
    if (!invoice) {
      return undefined;
    }

    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    };
  }

  /**
   * Get all invoices
   */
  getAll(): InvoiceDTO[] {
    const invoices = this.invoiceRepository.findAll();
    return invoices.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));
  }

  /**
   * Get invoices by customer
   */
  getByCustomer(customer_id: string): InvoiceDTO[] {
    const invoices = this.invoiceRepository.findByCustomer(customer_id);
    return invoices.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));
  }

  /**
   * Get invoices by status
   */
  getByStatus(status: string): InvoiceDTO[] {
    const invoices = this.invoiceRepository.findByStatus(status);
    return invoices.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));
  }

  /**
   * Get invoices by quotation
   */
  getByQuotation(quotation_id: string): InvoiceDTO[] {
    const invoices = this.invoiceRepository.findByQuotation(quotation_id);
    return invoices.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_number: invoice.invoice_number,
      quotation_id: invoice.quotation_id,
      status: invoice.status,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    }));
  }

  /**
   * Update invoice
   */
  update(id: string, data: UpdateInvoiceInput): InvoiceDTO | undefined {
    // Check if invoice exists
    const existing = this.invoiceRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Check if invoice number is being changed to an existing invoice's number
    if (
      data.invoice_number &&
      data.invoice_number !== existing.invoice_number
    ) {
      const numberExists = this.invoiceRepository.findByNumber(
        data.invoice_number,
      );
      if (numberExists && numberExists.id !== id) {
        throw new Error("Invoice with this number already exists");
      }
    }

    // Validate due date is in the future (unless status is overdue)
    if (
      data.status !== "overdue" &&
      data.due_date &&
      data.due_date < Date.now()
    ) {
      throw new Error(
        "Due date must be in the future unless status is overdue",
      );
    }

    // Validate amount_paid cannot exceed total_amount
    if (data.amount_paid !== undefined && data.total_amount !== undefined) {
      if (data.amount_paid > data.total_amount) {
        throw new Error("Amount paid cannot exceed total amount");
      }
    }

    const updated = this.invoiceRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      customer_id: updated.customer_id,
      invoice_number: updated.invoice_number,
      quotation_id: updated.quotation_id,
      status: updated.status,
      total_amount: updated.total_amount,
      amount_paid: updated.amount_paid,
      due_date: updated.due_date,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Delete invoice
   */
  delete(id: string): boolean {
    return this.invoiceRepository.delete(id);
  }

  /**
   * Get invoice count
   */
  count(): number {
    return this.invoiceRepository.count();
  }
}
