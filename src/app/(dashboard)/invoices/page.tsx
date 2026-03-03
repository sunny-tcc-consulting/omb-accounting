"use client";

import { InvoiceList } from "@/components/invoices/InvoiceList";
import { useTranslation } from "@/contexts/I18nContext";

export default function InvoicesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("invoices.title")}
        </h1>
        <p className="mt-2 text-gray-600">{t("invoices.invoiceList")}</p>
      </div>
      <InvoiceList />
    </div>
  );
}
