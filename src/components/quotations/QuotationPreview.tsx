"use client";

import { useQuotations } from "@/contexts/QuotationContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { Quotation, QuotationItem } from "@/types";

interface QuotationPreviewProps {
  quotation: Quotation;
}

export function QuotationPreview({ quotation }: QuotationPreviewProps) {
  const { updateQuotation: _updateQuotation } = useQuotations();

  const handlePrint = () => {
    window.print();
    toast.success("Printing quotation...");
  };

  const handleDownload = () => {
    try {
      // Using export function for PDF generation
      exportQuotationPDF(quotation);
      toast.success("Quotation PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("PDF generation failed, please try again");
    }
  };

  // Handle Quotation PDF export using jsPDF
  const exportQuotationPDF = (quotationData: Quotation) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("QUOTATION", 20, 20);
    doc.setFontSize(10);
    doc.text(`Quotation #: ${quotationData.quotationNumber}`, 20, 30);
    doc.text(`Date: ${formatDate(quotationData.issuedDate)}`, 20, 38);
    doc.text(`Valid Until: ${formatDate(quotationData.validityPeriod)}`, 20, 46);
    doc.text(`Customer: ${quotationData.customerName}`, 20, 54);
    doc.text(`Email: ${quotationData.customerEmail}`, 20, 62);
    if (quotationData.customerPhone) {
      doc.text(`Phone: ${quotationData.customerPhone}`, 20, 70);
    }
    doc.text(`Notes: ${quotationData.notes || "None"}`, 20, 78);

    doc.setFontSize(14);
    doc.text("Line Items:", 20, 95);

    let y = 105;
    quotationData.items.forEach((item: QuotationItem, _index: number) => {
      doc.setFontSize(10);
      doc.text(
        `${item.description} (${item.quantity} x ${formatCurrency(item.unitPrice)})`,
        20,
        y,
      );
      doc.text(
        `   Subtotal: ${formatCurrency(calculateItemTotal(item))}`,
        20,
        y + 8,
      );
      doc.text(`   Discount: ${item.discount || 0}%`, 20, y + 16);
      doc.text(
        `   Tax: ${formatCurrency(calculateItemTotal(item) * (item.taxRate || 0.1))}`,
        20,
        y + 24,
      );
      y += 36;
    });

    const total = calculateTotal(quotationData);
    doc.setFontSize(14);
    doc.text("Total:", 20, y + 10);
    doc.text(`Quotation Total: ${formatCurrency(total)}`, 20, y + 20);
    doc.text(`Tax: ${formatCurrency(total * 0.1)}`, 20, y + 28);
    doc.text(`Grand Total: ${formatCurrency(total * 1.1)}`, 20, y + 36);

    doc.save(`quotation-${quotationData.quotationNumber}.pdf`);
  };

  const calculateItemTotal = (item: QuotationItem) => {
    return item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
  };

  const calculateTotal = (quotationData: Quotation) => {
    const subtotal = quotationData.items.reduce(
      (sum: number, item: QuotationItem) => sum + calculateItemTotal(item),
      0,
    );
    return subtotal + subtotal * 0.1;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
            <p className="text-gray-600">{quotation.quotationNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Date: {formatDate(quotation.issuedDate)}
            </p>
            <p className="text-sm text-gray-600">
              Valid Until: {formatDate(quotation.validityPeriod)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Customer Info</h3>
          <p className="text-gray-600">{quotation.customerName}</p>
          <p className="text-sm text-gray-500">{quotation.customerEmail}</p>
          {quotation.customerPhone && (
            <p className="text-sm text-gray-500">{quotation.customerPhone}</p>
          )}
        </div>

        <div className="text-right">
          <h3 className="font-semibold text-gray-900 mb-2">Company Info</h3>
          <p className="text-gray-600">OMB Accounting</p>
          <p className="text-sm text-gray-500">
            123 Business Street, City, Country
          </p>
          <p className="text-sm text-gray-500">contact@omb-accounting.com</p>
        </div>
      </div>

      {/* Items */}
      <div className="border rounded-lg mb-8">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Discount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quotation.items.map((item: QuotationItem, _index: number) => (
              <tr key={_index}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {item.discount}%
                </td>
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
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">
              {formatCurrency(quotation.subtotal || 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span className="text-gray-900">
              {formatCurrency((quotation.subtotal || 0) * 0.1)}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-green-600">
              {formatCurrency(quotation.total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms */}
      {quotation.termsAndConditions && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Terms</h3>
          <p className="text-sm text-gray-600">
            {quotation.termsAndConditions}
          </p>
        </div>
      )}

      {/* Notes */}
      {quotation.notes && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{quotation.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
