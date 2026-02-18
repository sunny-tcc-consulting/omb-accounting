'use client';

import React from 'react';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useParams, useRouter } from 'next/navigation';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const { getInvoiceById, updatePaymentStatus } = useInvoices();

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

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    try {
      await updatePaymentStatus(invoice.id, 'paid');
      toast.success('Invoice marked as paid!');
    } catch (error) {
      toast.error('Failed to mark invoice as paid');
      console.error('Error marking invoice as paid:', error);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
    toast.success('Invoice is being printed!');
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push('/invoices')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</p>
          <p className="text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleMarkAsPaid}>
            Mark as Paid
          </Button>
        </div>
      </div>

      <InvoicePreview invoice={invoice} />
    </div>
  );
}
