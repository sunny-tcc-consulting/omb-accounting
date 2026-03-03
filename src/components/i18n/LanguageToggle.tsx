"use client";

import { useTranslation } from "@/contexts/I18nContext";
import { Locale, locales } from "@/lib/i18n/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale, dictionary } = useTranslation();

  const localeNames: Record<Locale, string> = {
    en: "English",
    "zh-HK": "繁體中文",
    "zh-CN": "简体中文",
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        aria-label={dictionary.settings?.languageSelect || "Select Language"}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </button>

      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md ${locale === loc ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageToggle;
