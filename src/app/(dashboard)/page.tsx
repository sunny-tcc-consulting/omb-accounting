"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard{" "}
          <span className="text-indigo-600">{t("nav.dashboard")}</span>
        </h1>
        <p className="mt-2 text-gray-600">
          Overview{" "}
          <span className="text-indigo-600">{t("dashboard.overview")}</span>
        </p>
      </div>
      <div className="rounded-xl border p-5 bg-gray-50 h-64 flex items-center justify-center">
        <p className="text-gray-500">Dashboard coming soon...</p>
      </div>
    </div>
  );
}
