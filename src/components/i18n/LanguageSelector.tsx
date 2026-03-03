"use client";

import { useTranslation } from "@/contexts/I18nContext";
import { Locale, locales } from "@/lib/i18n/i18n";

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  const localeNames: Record<Locale, string> = {
    en: "English",
    "zh-HK": "繁體中文",
    "zh-CN": "简体中文",
  };

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={locale}
        onChange={handleLocaleChange}
        className="px-3 py-1.5 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={t("settings.languageSelect")}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
