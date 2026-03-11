import { useTranslation as useI18nTranslation } from "@/contexts/I18nContext";
import { Locale } from "@/lib/i18n/i18n";

export function useTranslation() {
  return useI18nTranslation();
}

// Helper for getting translation key type safety
export type TranslationKey = string;

export type { Locale };
