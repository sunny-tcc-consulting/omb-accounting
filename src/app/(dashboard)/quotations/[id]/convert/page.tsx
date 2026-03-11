"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuotations } from "@/contexts/QuotationContext";
import { useInvoices } from "@/contexts/InvoiceContext";
import { convertQuotationToInvoice } from "@/lib/quotation-utils";
import { QuotationPreview } from "@/components/quotations/QuotationPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export default function ConvertQuotationPage() {
  const { t } = useTranslation();
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
          {t("quotations.quotationNotFound")}
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
      addInvoice(invoice);

      toast.success(t("quotations.convertedSuccessfully"));
      router.push("/invoices");
    } catch (error) {
      console.error("Error converting quotation to invoice:", error);
      toast.error(t("quotations.conversionFailed"));
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
    toast.success(t("quotations.printingInvoice"));
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/quotations/${quotation.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("quotations.backToQuotation")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("quotations.convertToInvoice")}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("quotations.willBeConverted", {
            number: quotation.quotationNumber,
          })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {t("quotations.quotationDate")}:{" "}
            {new Date(quotation.issuedDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            {t("customers.customer")}: {quotation.customerName}
          </p>
          <p className="text-sm text-gray-600">
            {t("quotations.quotationTotal")}: {quotation.total}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            {t("common.print")}
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {t("quotations.saveInvoice")}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("invoices.invoicePreview")}
        </h2>
        <QuotationPreview quotation={quotation} />
      </div>
    </div>
  );
}
