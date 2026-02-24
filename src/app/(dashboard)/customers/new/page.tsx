'use client';

import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/customers/CustomerForm';

export default function NewCustomerPage() {
  const router = useRouter();

  const handleSuccess = (customer: any) => {
    router.push(`/customers/${customer.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Customer</h1>
      <CustomerForm onSubmit={handleSuccess} onCancel={() => router.back()} />
    </div>
  );
}
