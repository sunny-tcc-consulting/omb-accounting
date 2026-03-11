"use client";

import { InvoiceList } from "@/components/invoices/InvoiceList";
import { useTranslation } from "@/contexts/I18nContext";

export default function InvoicesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("invoices.title")}{" "}
          <span className="text-indigo-600">{t("nav.invoices")}</span>
        </h1>
        <p className="mt-2 text-gray-600">
          {t("invoices.invoiceList")}{" "}
          <span className="text-indigo-600">{t("invoices.invoiceList")}</span>
        </p>
      </div>
      <InvoiceList />
    </div>
  );
}
