'use client';

import { useQuotations } from '@/contexts/QuotationContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { generateQuotationPDF, downloadPDF } from '@/lib/pdf-generator';

interface QuotationPreviewProps {
  quotation: any;
}

export function QuotationPreview({ quotation }: QuotationPreviewProps) {
  const { updateQuotation } = useQuotations();

  const handlePrint = () => {
    window.print();
    toast.success('正在打印報價單...');
  };

  const handleDownload = () => {
    try {
      const doc = generateQuotationPDF(quotation);
      downloadPDF(doc, 'quotation', quotation.quotationNumber);
      toast.success('報價單 PDF 下載成功！');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF 生成失敗，請重試');
    }
  };

  const calculateItemTotal = (item: any) => {
    return (item.quantity * item.unitPrice) * (1 - item.discount / 100);
  };

  const calculateTotal = () => {
    const subtotal = quotation.items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0);
    return subtotal + subtotal * 0.1;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">報價單</h1>
            <p className="text-gray-600">{quotation.quotationNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">日期: {formatDate(quotation.issuedDate)}</p>
            <p className="text-sm text-gray-600">有效期至: {formatDate(quotation.validityPeriod)}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">客戶信息</h3>
          <p className="text-gray-600">{quotation.customerName}</p>
          <p className="text-sm text-gray-500">{quotation.customerEmail}</p>
          {quotation.customerPhone && <p className="text-sm text-gray-500">{quotation.customerPhone}</p>}
        </div>

        <div className="text-right">
          <h3 className="font-semibold text-gray-900 mb-2">公司信息</h3>
          <p className="text-gray-600">OMB Accounting</p>
          <p className="text-sm text-gray-500">123 Business Street, City, Country</p>
          <p className="text-sm text-gray-500">contact@omb-accounting.com</p>
        </div>
      </div>

      {/* Items */}
      <div className="border rounded-lg mb-8">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">數量</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">單價</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">折扣</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">小計</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotation.items.map((item: any, index: number) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.discount}%</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                  {formatCurrency(calculateItemTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">小計:</span>
            <span className="text-gray-900">{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">稅費 (10%):</span>
            <span className="text-gray-900">{formatCurrency(quotation.tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span className="text-gray-900">總計:</span>
            <span className="text-green-600">{formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      {quotation.termsAndConditions && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">付款條件</h3>
          <p className="text-sm text-gray-600">{quotation.termsAndConditions}</p>
        </div>
      )}

      {/* Notes */}
      {quotation.notes && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">備註</h3>
          <p className="text-sm text-gray-600">{quotation.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          打印
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          下載 PDF
        </Button>
      </div>
    </div>
  );
}
