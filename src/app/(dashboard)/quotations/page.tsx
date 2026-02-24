'use client';

import { QuotationList } from '@/components/quotations/QuotationList';

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
        <p className="mt-2 text-gray-600">Manage and track all your quotations</p>
      </div>
      <QuotationList />
    </div>
  );
}
