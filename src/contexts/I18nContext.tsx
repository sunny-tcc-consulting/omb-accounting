"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Locale,
  getBrowserLocale,
  loadDictionary,
  Dictionary,
} from "@/lib/i18n/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const defaultDictionary = {} as Dictionary;

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  dictionary: defaultDictionary,
  t: (key) => key,
  isLoading: true,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [dictionary, setDictionary] = useState<Dictionary>(defaultDictionary);
  const [isLoading, setIsLoading] = useState(true);

  // Load dictionary for locale
  const loadDict = useCallback(async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      const dict = await loadDictionary(newLocale);
      setDictionary(dict);
    } catch (error) {
      console.error("Failed to load dictionary:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize locale from browser
  useEffect(() => {
    const browserLocale = getBrowserLocale();
    setLocaleState(browserLocale);
    loadDict(browserLocale);
  }, [loadDict]);

  // Persist locale to localStorage
  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem("locale", newLocale);
      loadDict(newLocale);
    },
    [loadDict],
  );

  // Translation function with safe fallback
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Return key immediately if dictionary is empty
      if (!dictionary || Object.keys(dictionary).length === 0) {
        return params
          ? Object.entries(params).reduce(
              (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
              key,
            )
          : key;
      }

      const keys = key.split(".");
      let value: any = dictionary; // eslint-disable-line @typescript-eslint/no-explicit-any

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return params
            ? Object.entries(params).reduce(
                (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
                key,
              )
            : key;
        }
      }

      if (typeof value !== "string") {
        return params
          ? Object.entries(params).reduce(
              (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
              key,
            )
          : key;
      }

      return params
        ? Object.entries(params).reduce(
            (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
            value,
          )
        : value;
    },
    [dictionary],
  );

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, dictionary, t, isLoading }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}

export default I18nContext;
