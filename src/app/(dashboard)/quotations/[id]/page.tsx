'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuotations } from '@/contexts/QuotationContext';
import { QuotationPreview } from '@/components/quotations/QuotationPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, ArrowRightCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getQuotationById } = useQuotations();
  const quotation = getQuotationById(params.id as string);

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quotation not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/quotations')}>
          Back to List
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this quotation?`)) {
      // Delete logic would go here
      toast.success('Quotation deleted successfully');
      router.push('/quotations');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotation Details</h1>
            <p className="text-gray-600">{quotation.quotationNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/quotations/${quotation.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/quotations/${quotation.id}/convert`}>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <ArrowRightCircle className="h-4 w-4 mr-2" />
              Convert to Invoice
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Preview */}
      <QuotationPreview quotation={quotation} />
    </div>
  );
}
