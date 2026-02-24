'use client';

import { useRouter } from 'next/navigation';
import { QuotationForm } from '@/components/quotations/QuotationForm';

export default function NewQuotationPage() {
  const router = useRouter();

  const handleSuccess = (quotation: any) => {
    router.push(`/quotations/${quotation.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Quotation</h1>
      <QuotationForm onSubmit={handleSuccess} onCancel={() => router.back()} />
    </div>
  );
}
