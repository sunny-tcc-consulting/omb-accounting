"use client";

import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useTranslation } from "@/contexts/I18nContext";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-gray-600">{t("dashboard.overview")}</p>
      </div>
      <DashboardContent />
    </div>
  );
}
