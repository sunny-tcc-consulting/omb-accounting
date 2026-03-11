"use client";

import { CustomerList } from "@/components/customers/CustomerList";
import { useTranslation } from "@/contexts/I18nContext";

export default function CustomersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("customers.title")}{" "}
          <span className="text-indigo-600">{t("nav.customers")}</span>
        </h1>
        <p className="mt-2 text-gray-600">
          {t("customers.customerList")}{" "}
          <span className="text-indigo-600">{t("customers.customerList")}</span>
        </p>
      </div>
      <CustomerList />
    </div>
  );
}
