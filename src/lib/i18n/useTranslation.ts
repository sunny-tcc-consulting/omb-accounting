/**
 * Translation helper utilities
 * Provides type-safe translation key access
 */

import { useTranslation as useI18nTranslation } from "@/contexts/I18nContext";
import { Locale, type Dictionary } from "@/lib/i18n/i18n";

// Main translation hook
export function useTranslation() {
  return useI18nTranslation();
}

// Helper to get nested translation with fallback
export function getNestedTranslation(
  obj: Dictionary,
  key: string,
  fallback?: string,
): string {
  const keys = key.split(".");
  let value: any = obj; // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === "string" ? value : fallback || key;
}

// Format number based on locale
export function formatNumber(value: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale.replace("-", "-")).format(value);
}

// Format currency based on locale
export function formatCurrency(
  value: number,
  currency: string = "HKD",
  locale: Locale = "en",
): string {
  return new Intl.NumberFormat(locale.replace("-", "-"), {
    style: "currency",
    currency,
  }).format(value);
}

// Format date based on locale
export function formatDate(date: Date | string, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale.replace("-", "-")).format(d);
}

export type { Locale };
