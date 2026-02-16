'use client';

import React from 'react';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewInvoicePage() {
  const { addInvoice } = useInvoices();
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/invoices');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new invoice</p>
      </div>
      <InvoiceForm onSuccess={handleSuccess} />
    </div>
  );
}
