'use client';

import { CustomerList } from '@/components/customers/CustomerList';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="mt-2 text-gray-600">Manage your customer relationships</p>
      </div>
      <CustomerList />
    </div>
  );
}
