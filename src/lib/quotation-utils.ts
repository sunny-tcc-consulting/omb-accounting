/**
 * Quotation to Invoice Conversion Utilities
 *
 * This module provides functions to convert quotation data to invoice data.
 * Used by the QuotationContext to enable quotation-to-invoice conversion.
 */

import { Quotation, QuotationItem, Invoice, InvoiceItem } from '@/types';

/**
 * Convert a quotation to an invoice
 *
 * @param quotation - The quotation to convert
 * @param options - Conversion options
 * @returns A new invoice object
 */
export function convertQuotationToInvoice(
  quotation: Quotation,
  options: {
    invoiceDate?: Date;
    dueDate?: Date;
    paymentTerms?: string;
    currency?: string;
  } = {}
): Invoice {
  // Parse invoice date (default to today)
  const invoiceDate = options.invoiceDate ? new Date(options.invoiceDate) : new Date();

  // Calculate due date based on payment terms if not provided
  let dueDate = options.dueDate;
  if (!dueDate) {
    dueDate = calculateDueDate(invoiceDate, 'Net 30');
  }

  // Generate invoice number (format: INV-YYYY-XXXXX)
  const invoiceNumber = generateInvoiceNumber(invoiceDate);

  // Convert quotation items to invoice items
  const items = quotation.items.map((item) => ({
    id: `${invoiceNumber}-${item.id}`,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate || 0,
    discount: item.discount || 0,
    total: calculateItemTotal(item),
  }));

  // Calculate invoice totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalTax = items.reduce((sum, item) => sum + (item.total - (item.quantity * item.unitPrice) + (item.discount || 0)), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal + totalTax - totalDiscount;

  // Calculate paid amount (default to 0 for new invoice)
  const amountPaid = 0;
  const amountRemaining = total;

  // Create the invoice object
  const invoice: Invoice = {
    id: `${invoiceNumber}-${Date.now()}`,
    invoiceNumber,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    customerEmail: quotation.customerEmail,
    customerPhone: quotation.customerPhone,
    items,
    currency: options.currency || quotation.currency || 'HKD',
    subtotal,
    tax: totalTax,
    discount: totalDiscount,
    total,
    paymentTerms: options.paymentTerms || 'Net 30',
    issuedDate: invoiceDate,
    dueDate: dueDate || new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending', // New invoices are pending by default
    amountPaid,
    amountRemaining,
    notes: quotation.notes ? `Converted from quotation ${quotation.quotationNumber}. ${quotation.notes}` : `Converted from quotation ${quotation.quotationNumber}`,
  };

  return invoice;
}

/**
 * Calculate due date based on payment terms
 *
 * @param startDate - The start date (invoice date)
 * @param paymentTerms - Payment terms string (e.g., "Net 30", "COD")
 * @returns Due date
 */
export function calculateDueDate(startDate: Date, paymentTerms: string): Date {
  const date = new Date(startDate);

  // Handle special payment terms
  const terms = paymentTerms.toLowerCase();

  // COD (Cash on Delivery) - due immediately
  if (terms.includes('cod') || terms.includes('cash on delivery')) {
    return date;
  }

  // Immediate payment
  if (terms.includes('immediate') || terms.includes('pay now')) {
    return date;
  }

  // Net terms (extract number)
  const match = paymentTerms.match(/(\d+)/);
  const days = match ? parseInt(match[1], 10) : 30;

  // Add days to start date
  date.setDate(date.getDate() + days);

  return date;
}

/**
 * Generate a unique invoice number
 *
 * Format: INV-YYYY-XXXXX
 * Example: INV-2026-00123
 *
 * @param date - The date to use for invoice number
 * @returns A unique invoice number
 */
export function generateInvoiceNumber(date: Date): string {
  const year = date.getFullYear();
  const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV-${year}-${randomSuffix}`;
}

/**
 * Calculate the total for a single invoice item
 *
 * @param item - The invoice item
 * @returns The item total
 */
function calculateItemTotal(item: QuotationItem | InvoiceItem): number {
  const subtotal = item.quantity * item.unitPrice;
  const tax = subtotal * (item.taxRate || 0);
  const discount = item.discount || 0;
  return subtotal + tax - discount;
}

/**
 * Validate quotation data before conversion
 *
 * @param quotation - The quotation to validate
 * @returns True if valid, false otherwise
 */
export function validateQuotationForConversion(quotation: Quotation): boolean {
  if (!quotation) {
    console.error('Quotation is required for conversion');
    return false;
  }

  if (!quotation.customerId) {
    console.error('Quotation must have a customer');
    return false;
  }

  if (!quotation.items || quotation.items.length === 0) {
    console.error('Quotation must have at least one item');
    return false;
  }

  if (!quotation.quotationNumber) {
    console.error('Quotation must have a quotation number');
    return false;
  }

  return true;
}
