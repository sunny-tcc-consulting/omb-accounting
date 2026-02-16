'use client';

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuotations } from '@/contexts/QuotationContext';
import { useInvoices } from '@/contexts/InvoiceContext';
import { convertQuotationToInvoice } from '@/lib/quotation-utils';
import { QuotationPreview } from '@/components/quotations/QuotationPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ConvertQuotationPage() {
  const params = useParams();
  const quotationId = params.id as string;
  const router = useRouter();
  const { getQuotationById } = useQuotations();
  const { addInvoice } = useInvoices();

  const quotation = getQuotationById(quotationId);

  if (!quotation) {
    return (
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-red-50 text-red-600">
          報價單不存在
        </div>
      </div>
    );
  }

  // Convert quotation to invoice
  const invoice = convertQuotationToInvoice(quotation);

  // Handle save
  const handleSave = async () => {
    try {
      // Add invoice to InvoiceContext
      addInvoice(invoice as any);

      toast.success('成功轉換為發票！');
      router.push('/invoices');
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      toast.error('轉換失敗，請重試');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
    toast.success('正在列印發票！');
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push(`/quotations/${quotation.id}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回報價單
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">轉換報價單為發票</h1>
        <p className="text-gray-600 mt-1">報價單 {quotation.quotationNumber} 將轉換為發票</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">報價單日期: {new Date(quotation.issuedDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">客戶: {quotation.customerName}</p>
          <p className="text-sm text-gray-600">報價單總額: {quotation.total}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            列印
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存發票
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">發票預覽</h2>
        <QuotationPreview quotation={quotation} />
      </div>
    </div>
  );
}
