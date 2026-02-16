'use client';

import React from 'react';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { useInvoices } from '@/contexts/InvoiceContext';

export default function InvoicesPage() {
  const { invoices, loading, error } = useInvoices();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">Manage and track your invoices</p>
      </div>
      <InvoiceList />
    </div>
  );
}
