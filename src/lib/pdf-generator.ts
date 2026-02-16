/**
 * PDF Generation Utilities for omb-accounting
 *
 * This module provides functions to generate PDF documents for quotations and invoices.
 * Uses jsPDF and jsPDF-AutoTable for professional-looking PDF output.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation, Invoice } from '@/types';

/**
 * Company information for PDF generation
 */
const companyInfo = {
  name: 'omb-accounting',
  address: '123 Business Road, Hong Kong',
  email: 'info@omb-accounting.com',
  phone: '+852 1234 5678',
};

/**
 * Generate PDF filename with timestamp
 *
 * @param type - Type of document ('quotation' or 'invoice')
 * @param number - Document number
 * @returns Formatted filename
 */
export function generatePDFFilename(type: 'quotation' | 'invoice', number: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${type}-${number}-${timestamp}.pdf`;
}

/**
 * Set document properties and header
 *
 * @param doc - jsPDF instance
 * @param title - Document title
 * @param type - Document type
 */
function setDocumentProperties(doc: jsPDF, title: string, type: 'quotation' | 'invoice') {
  doc.setProperties({
    title: title,
    subject: `${type} document`,
    author: companyInfo.name,
    creator: 'omb-accounting',
  });
}

/**
 * Add company header to PDF
 *
 * @param doc - jsPDF instance
 */
function addCompanyHeader(doc: jsPDF) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address, 14, 26);
  doc.text(companyInfo.email, 14, 31);
  doc.text(companyInfo.phone, 14, 36);
}

/**
 * Add document title
 *
 * @param doc - jsPDF instance
 * @param type - Document type
 * @param number - Document number
 */
function addDocumentTitle(doc: jsPDF, type: 'quotation' | 'invoice', number: string) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${type === 'quotation' ? 'QUOTATION' : 'INVOICE'}`, 14, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Number: ${number}`, 14, 56);
}

/**
 * Add customer details section
 *
 * @param doc - jsPDF instance
 * @param customerName - Customer name
 * @param customerAddress - Customer address
 * @param customerEmail - Customer email
 * @param customerPhone - Customer phone
 */
function addCustomerDetails(
  doc: jsPDF,
  customerName: string,
  customerAddress?: string,
  customerEmail?: string,
  customerPhone?: string
) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 14, 75);

  if (customerAddress) {
    doc.text(customerAddress, 14, 80);
  }

  if (customerEmail) {
    doc.text(customerEmail, 14, 85);
  }

  if (customerPhone) {
    doc.text(customerPhone, 14, 90);
  }
}

/**
 * Add date information
 *
 * @param doc - jsPDF instance
 * @param date - Issue date
 * @param dueDate - Due date (optional)
 */
function addDateInformation(doc: jsPDF, date: string, dueDate?: string) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 140, 70);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), 140, 75);

  if (dueDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 140, 80);

    doc.setFont('helvetica', 'normal');
    doc.text(new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 140, 85);
  }
}

/**
 * Generate quotation PDF
 *
 * @param quotation - Quotation data
 * @returns jsPDF instance
 */
export function generateQuotationPDF(quotation: Quotation): jsPDF {
  const doc = new jsPDF();

  // Set document properties
  setDocumentProperties(doc, `Quotation ${quotation.quotationNumber}`, 'quotation');

  // Add company header
  addCompanyHeader(doc);

  // Add document title
  addDocumentTitle(doc, 'quotation', quotation.quotationNumber);

  // Add customer details
  addCustomerDetails(
    doc,
    quotation.customerName,
    quotation.customerAddress,
    quotation.customerEmail,
    quotation.customerPhone
  );

  // Add date information
  addDateInformation(doc, quotation.issuedDate, quotation.validityPeriod);

  // Add line items table
  const tableData = quotation.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toFixed(2),
    (item.quantity * item.unitPrice).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
  });

  // Add totals section
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const subtotal = quotation.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * (quotation.taxRate || 0);
  const total = subtotal + tax;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`${subtotal.toFixed(2)}`, 180, finalY + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Tax:', 140, finalY + 15);
  doc.text(`${tax.toFixed(2)}`, 180, finalY + 15);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 20);
  doc.text(`${total.toFixed(2)}`, 180, finalY + 20);

  // Add payment terms
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', 14, finalY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.paymentTerms || 'Net 30', 14, finalY + 45);

  // Add notes
  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, finalY + 55);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(quotation.notes, 170);
    doc.text(notesLines, 14, finalY + 60);
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  return doc;
}

/**
 * Generate invoice PDF
 *
 * @param invoice - Invoice data
 * @returns jsPDF instance
 */
export function generateInvoicePDF(invoice: Invoice): jsPDF {
  const doc = new jsPDF();

  // Set document properties
  setDocumentProperties(doc, `Invoice ${invoice.invoiceNumber}`, 'invoice');

  // Add company header
  addCompanyHeader(doc);

  // Add document title
  addDocumentTitle(doc, 'invoice', invoice.invoiceNumber);

  // Add customer details
  addCustomerDetails(
    doc,
    invoice.customerName,
    invoice.customerAddress,
    invoice.customerEmail,
    invoice.customerPhone
  );

  // Add date information
  addDateInformation(doc, invoice.issuedDate, invoice.dueDate);

  // Add line items table
  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toFixed(2),
    (item.quantity * item.unitPrice).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
  });

  // Add totals section
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = invoice.items.reduce((sum, item) => sum + (item.taxRate * item.quantity * item.unitPrice), 0);
  const discount = invoice.items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal + tax - discount;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`${subtotal.toFixed(2)}`, 180, finalY + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Tax:', 140, finalY + 15);
  doc.text(`${tax.toFixed(2)}`, 180, finalY + 15);

  if (discount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Discount:', 140, finalY + 20);
    doc.text(`-${discount.toFixed(2)}`, 180, finalY + 20);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 25);
  doc.text(`${total.toFixed(2)}`, 180, finalY + 25);

  // Add payment status
  const paymentStatusY = finalY + 45;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', 14, paymentStatusY);

  doc.setFont('helvetica', 'normal');
  const statusText = invoice.amountPaid >= invoice.total ? 'PAID' : invoice.amountPaid > 0 ? 'PARTIAL' : 'PENDING';
  doc.text(statusText, 14, paymentStatusY + 5);

  if (invoice.amountPaid > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Amount Paid: ${invoice.amountPaid.toFixed(2)}`, 14, paymentStatusY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount Remaining: ${invoice.amountRemaining.toFixed(2)}`, 14, paymentStatusY + 15);
  }

  // Add payment terms
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', 14, finalY + 60);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.paymentTerms || 'Net 30', 14, finalY + 65);

  // Add notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, finalY + 75);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(notesLines, 14, finalY + 80);
  }

  // Add quotation reference
  if (invoice.quotationReference) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Quotation Reference: ${invoice.quotationReference}`, 14, finalY + 100);
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  return doc;
}

/**
 * Download PDF to browser
 *
 * @param doc - jsPDF instance
 * @param type - Document type ('quotation' or 'invoice')
 * @param number - Document number
 */
export function downloadPDF(doc: jsPDF, type: 'quotation' | 'invoice', number: string) {
  const filename = generatePDFFilename(type, number);
  doc.save(filename);
}
