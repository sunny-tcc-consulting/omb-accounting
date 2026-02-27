/**
 * Invoice DTO
 *
 * Converts between database Invoice entities and frontend Invoice formats.
 */

import { Invoice as DbInvoice } from "@/lib/types/database";
import {
  Invoice as FrontendInvoice,
  InvoiceItem as FrontendInvoiceItem,
} from "@/types";

interface DbInvoiceItem {
  id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  unitPrice?: number;
  tax_rate?: number;
  taxRate?: number;
  discount?: number;
  total?: number;
}

interface ExtendedDbInvoice extends DbInvoice {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  items?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  tax?: number | null;
  discount?: number | null;
  payment_terms?: string | null;
  issued_date?: number | null;
  paid_date?: number | null;
  notes?: string | null;
}

/**
 * Parse JSON items from database
 */
function parseItems(
  itemsJson: string | null | undefined,
): FrontendInvoiceItem[] {
  if (!itemsJson) return [];
  try {
    const items = JSON.parse(itemsJson) as DbInvoiceItem[];
    return items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      description: item.description || "",
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || item.unitPrice || 0,
      taxRate: item.tax_rate || item.taxRate,
      discount: item.discount,
      total: item.total || 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Convert database invoice to frontend format
 */
export function toFrontendInvoice(dbInvoice: DbInvoice): FrontendInvoice {
  const extInvoice = dbInvoice as ExtendedDbInvoice;
  const total = dbInvoice.total_amount || 0;
  const paid = dbInvoice.amount_paid || 0;

  return {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoice_number,
    customerId: dbInvoice.customer_id,
    customerName: extInvoice.customer_name || "",
    customerEmail: extInvoice.customer_email || "",
    customerPhone: extInvoice.customer_phone || undefined,
    customerAddress: extInvoice.customer_address || undefined,
    items: parseItems(extInvoice.items),
    quotationId: dbInvoice.quotation_id || undefined,
    currency: extInvoice.currency || "CNY",
    subtotal: extInvoice.subtotal || 0,
    tax: extInvoice.tax || undefined,
    discount: extInvoice.discount || undefined,
    total: total,
    paymentTerms: extInvoice.payment_terms || "Due within 30 days",
    dueDate: new Date(dbInvoice.due_date),
    status: dbInvoice.status as FrontendInvoice["status"],
    issuedDate: extInvoice.issued_date
      ? new Date(extInvoice.issued_date)
      : new Date(),
    paidDate: extInvoice.paid_date ? new Date(extInvoice.paid_date) : undefined,
    amountPaid: paid,
    amountRemaining: total - paid,
    notes: extInvoice.notes || undefined,
  };
}

/**
 * Convert list of database invoices to frontend format
 */
export function toFrontendInvoiceList(
  dbInvoices: DbInvoice[],
): FrontendInvoice[] {
  return dbInvoices.map(toFrontendInvoice);
}

/**
 * Convert frontend invoice to database format for creation
 */
export function toDbInvoiceInput(frontendData: {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  items?: FrontendInvoiceItem[];
  quotationId?: string | null;
  currency?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  paymentTerms?: string;
  dueDate?: Date;
  issuedDate?: Date;
  notes?: string;
}): Omit<DbInvoice, "id" | "created_at" | "updated_at"> {
  return {
    customer_id: frontendData.customerId || "",
    invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    quotation_id: frontendData.quotationId || undefined,
    status: "draft",
    total_amount: frontendData.total || 0,
    amount_paid: 0,
    due_date:
      frontendData.dueDate?.getTime() || Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
}
