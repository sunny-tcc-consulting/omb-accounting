"use client";

import { QuotationList } from "@/components/quotations/QuotationList";
import { useTranslation } from "@/contexts/I18nContext";

export default function QuotationsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("quotations.title")}{" "}
          <span className="text-indigo-600">報價單</span>
        </h1>
        <p className="mt-2 text-gray-600">
          {t("quotations.quotationList")}{" "}
          <span className="text-indigo-600">報價單列表</span>
        </p>
      </div>
      <QuotationList />
    </div>
  );
}
