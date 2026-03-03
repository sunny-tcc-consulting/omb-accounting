import {
  useTranslation as useI18nTranslation,
  Locale,
} from "@/contexts/I18nContext";

export function useTranslation() {
  return useI18nTranslation();
}

// Helper for getting translation key type safety
export type TranslationKey = string;

export { Locale };
