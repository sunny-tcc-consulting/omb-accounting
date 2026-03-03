"use client";

import { UserManagement } from "@/components/users/UserManagement";
import { useTranslation } from "@/contexts/I18nContext";

export default function UsersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("users.title")}</h1>
        <p className="mt-2 text-gray-600">{t("users.userManagement")}</p>
      </div>
      <UserManagement />
    </div>
  );
}
