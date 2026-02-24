'use client';

import { useQuotations } from '@/contexts/QuotationContext';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuotationById } = useQuotations();
  const quotation = getQuotationById(params.id as string);

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quotation not found</p>
      </div>
    );
  }

  const handleSuccess = (updatedQuotation: any) => {
    toast.success('Quotation updated successfully');
    router.push(`/quotations/${quotation.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Quotation</h1>
      <QuotationForm onSubmit={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
