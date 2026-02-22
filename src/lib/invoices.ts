/**
 * Invoices Service - Mock data for bank matching
 * Part of Phase 4.6: Bank Reconciliation
 */

import { Invoice } from "@/types";

// In-memory invoices store
const invoices: Map<string, Invoice> = new Map();

// Generate unique ID
const generateInvoiceId = (): string => {
  return `inv-${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Create an invoice
 */
export const createInvoice = (data: {
  invoiceNumber: string;
  customerId: string;
  issuedDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: "pending" | "paid" | "overdue";
}): Invoice => {
  const id = generateInvoiceId();

  const invoice: Invoice = {
    id,
    invoiceNumber: data.invoiceNumber,
    customerId: data.customerId,
    customerName: "",
    customerEmail: "",
    customerPhone: undefined,
    customerAddress: undefined,
    items: [],
    quotationId: undefined,
    currency: "HKD",
    subtotal: 0,
    tax: undefined,
    discount: undefined,
    total: 0,
    paymentTerms: "",
    dueDate: data.dueDate,
    status: data.status,
    issuedDate: data.issuedDate,
    paidDate: undefined,
    amountPaid: undefined,
    amountRemaining: undefined,
    notes: undefined,
  };

  invoices.set(id, invoice);
  return invoice;
};

/**
 * Get all invoices
 */
export const getAllInvoices = (): Invoice[] => {
  return Array.from(invoices.values()).sort(
    (a, b) => b.issuedDate.getTime() - a.issuedDate.getTime(),
  );
};

/**
 * Get invoices by date range
 */
export const getInvoicesByDateRange = (
  startDate: Date,
  endDate: Date,
): Invoice[] => {
  return getAllInvoices().filter(
    (invoice) =>
      invoice.issuedDate >= startDate && invoice.issuedDate <= endDate,
  );
};

/**
 * Get invoices by status
 */
export const getInvoicesByStatus = (
  status: "pending" | "paid" | "overdue" | "cancelled",
): Invoice[] => {
  return getAllInvoices().filter((invoice) => invoice.status === status);
};

// Initialize with some mock data
createInvoice({
  invoiceNumber: "INV-2026-0001",
  customerId: "cust-001",
  issuedDate: new Date("2026-02-01"),
  dueDate: new Date("2026-02-15"),
  totalAmount: 15000,
  status: "paid",
});

createInvoice({
  invoiceNumber: "INV-2026-0002",
  customerId: "cust-002",
  issuedDate: new Date("2026-02-10"),
  dueDate: new Date("2026-02-24"),
  totalAmount: 8000,
  status: "pending",
});

createInvoice({
  invoiceNumber: "INV-2026-0003",
  customerId: "cust-001",
  issuedDate: new Date("2026-02-15"),
  dueDate: new Date("2026-03-01"),
  totalAmount: 12000,
  status: "pending",
});

createInvoice({
  invoiceNumber: "INV-2026-0004",
  customerId: "cust-003",
  issuedDate: new Date("2026-02-05"),
  dueDate: new Date("2026-02-19"),
  totalAmount: 5000,
  status: "overdue",
});
