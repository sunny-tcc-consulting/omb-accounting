'use client';

import React from 'react';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { getInvoiceById } = useInvoices();
  const router = useRouter();

  const invoice = getInvoiceById(invoiceId);

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-red-50 text-red-600">
          Invoice not found
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push('/invoices');
  };

  // Convert invoice data to form data
  const initialData = {
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    customerPhone: invoice.customerPhone,
    items: invoice.items,
    currency: invoice.currency,
    // Calculate average tax rate from items
    taxRate: invoice.items.length > 0
      ? invoice.items.reduce((sum, item) => sum + (item.taxRate || 0), 0) / invoice.items.length
      : 0,
    paymentTerms: invoice.paymentTerms,
    dueDate: invoice.dueDate,
    issuedDate: invoice.issuedDate,
    notes: invoice.notes,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Invoice #{invoice.invoiceNumber}</h1>
        <p className="text-gray-600 mt-1">Update invoice details</p>
      </div>
      <InvoiceForm initialData={initialData} onSuccess={handleSuccess} />
    </div>
  );
}
