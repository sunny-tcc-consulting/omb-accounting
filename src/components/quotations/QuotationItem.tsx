'use client';

import Link from 'next/link';
import { FileText, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { useQuotations } from '@/contexts/QuotationContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function QuotationItem({ quotation }: { quotation: any }) {
  const { getFilteredCustomers } = useQuotations();
  const customers = getFilteredCustomers();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      draft: { label: '草稿', variant: 'secondary' },
      sent: { label: '已發送', variant: 'default' },
      accepted: { label: '已接受', variant: 'outline' },
      rejected: { label: '已拒絕', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-500" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{quotation.quotationNumber}</div>
            <div className="text-xs text-gray-500">{quotation.customerName}</div>
          </div>
        </div>
        {getStatusBadge(quotation.status)}
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>日期:</span>
          <span className="text-gray-900">{formatDate(quotation.issuedDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>有效期至:</span>
          <span className="text-gray-900">{formatDate(quotation.validityPeriod)}</span>
        </div>
        <div className="flex justify-between">
          <span>總計:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(quotation.total)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/quotations/${quotation.id}`}
          className="flex-1 text-center py-2 px-3 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
        >
          查看
        </Link>
        <Link
          href={`/quotations/${quotation.id}/edit`}
          className="flex-1 text-center py-2 px-3 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors text-sm"
        >
          編輯
        </Link>
        <Link
          href={`/quotations/${quotation.id}/convert`}
          className="flex-1 text-center py-2 px-3 border border-green-500 text-green-600 rounded hover:bg-green-50 transition-colors text-sm"
        >
          <Copy className="w-4 h-4 inline mr-1" />
          轉為發票
        </Link>
        <button className="flex-1 text-center py-2 px-3 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm">
          刪除
        </button>
      </div>
    </div>
  );
}
