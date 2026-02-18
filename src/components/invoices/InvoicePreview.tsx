'use client';

import React from 'react';
import { Invoice as InvoiceType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF, downloadPDF } from '@/lib/pdf-generator';

interface InvoicePreviewProps {
  invoice: InvoiceType;
  onPrint?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onPrint }) => {
  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const totalTax = invoice.items.reduce((sum, item) => sum + (item.taxRate || 0) * (item.quantity * item.unitPrice), 0);
  const totalDiscount = invoice.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal + totalTax - totalDiscount;

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', color: 'text-green-600 bg-green-50' };
      case 'partial':
        return { label: 'Partial', color: 'text-yellow-600 bg-yellow-50' };
      case 'pending':
        return { label: 'Pending', color: 'text-blue-600 bg-blue-50' };
      case 'overdue':
        return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
      default:
        return { label: 'Draft', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const statusInfo = getStatusInfo(invoice.status);

  // Handle print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
      toast.success('Invoice is being printed!');
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    try {
      const doc = generateInvoicePDF(invoice);
      downloadPDF(doc, 'invoice', invoice.invoiceNumber);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-sm text-gray-500 mt-1">Invoice #{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Bill To</h3>
          <p className="font-medium text-gray-900">{invoice.customerName}</p>
          <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
          {invoice.customerPhone && <p className="text-sm text-gray-600">{invoice.customerPhone}</p>}
        </div>

        <div className="text-right">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issued Date:</span>
              <span className="font-medium">{formatDate(invoice.issuedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Terms:</span>
              <span className="font-medium">{invoice.paymentTerms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Line Items</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Description</th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Quantity</th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Unit Price</th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Tax</th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Discount</th>
              <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const itemSubtotal = item.quantity * item.unitPrice;
              const itemTax = itemSubtotal * (item.taxRate || 0);
              const itemDiscount = item.discount || 0;
              const itemTotal = itemSubtotal + itemTax - itemDiscount;

              return (
                <tr key={item.id} className="border-b">
                  <td className="py-3 px-2 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 text-right">{item.taxRate ? `${(item.taxRate * 100).toFixed(1)}%` : '-'}</td>
                  <td className="py-3 px-2 text-sm text-gray-600 text-right">
                    {item.discount ? `-${formatCurrency(item.discount, invoice.currency)}` : '-'}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(itemTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8">
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-2 text-sm text-gray-600">Subtotal</td>
              <td className="py-3 px-2 text-sm text-gray-600 text-right">{formatCurrency(subtotal, invoice.currency)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-2 text-sm text-gray-600">Tax</td>
              <td className="py-3 px-2 text-sm text-gray-600 text-right">{formatCurrency(totalTax, invoice.currency)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-2 text-sm text-gray-600">Discount</td>
              <td className="py-3 px-2 text-sm text-gray-600 text-right text-red-600">
                -{formatCurrency(totalDiscount, invoice.currency)}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-2 text-lg font-semibold text-gray-900">Total</td>
              <td className="py-3 px-2 text-lg font-bold text-blue-600 text-right">{formatCurrency(total, invoice.currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Payment Information */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Amount Due:</span>
            <span className="font-medium text-gray-900 ml-2">
              {formatCurrency(invoice.amountRemaining || invoice.total, invoice.currency)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium text-gray-900 ml-2">
              {formatCurrency(invoice.amountPaid || 0, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-8 border-t">
        <div className="text-sm text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">Please make payment by the due date.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};
