"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function UsersPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">User Management</p>
        </div>
        <div className="animate-pulse rounded-xl border p-5 bg-gray-100 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("nav.users")}{" "}
          <span className="text-indigo-600">{t("nav.users")}</span>
        </h1>
        <p className="mt-2 text-gray-600">
          {t("users.userManagement")}{" "}
          <span className="text-indigo-600">{t("users.userManagement")}</span>
        </p>
      </div>
      <div className="rounded-xl border p-5 bg-gray-50 h-64 flex items-center justify-center">
        <p className="text-gray-500">User management coming soon...</p>
      </div>
    </div>
  );
}
