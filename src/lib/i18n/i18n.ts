// i18n configuration and utilities
export type Locale = "en" | "zh-HK" | "zh-CN";

// Dictionary type definition (to avoid circular dependency)
export interface Dictionary {
  [key: string]:
    | {
        [key: string]: string | { [key: string]: string };
      }
    | undefined;
  common: {
    [key: string]: string;
  };
  nav: {
    [key: string]: string;
  };
  dashboard: {
    [key: string]: string;
  };
  customers: {
    [key: string]: string;
  };
  quotations: {
    [key: string]: string | { [key: string]: string };
  };
  invoices: {
    [key: string]: string | { [key: string]: string };
  };
  reports: {
    [key: string]: string;
  };
  bank: {
    [key: string]: string | { [key: string]: string };
  };
  users: {
    [key: string]: string | { [key: string]: string };
  };
  settings?: {
    [key: string]: string;
  };
}

export const locales: Locale[] = ["en", "zh-HK", "zh-CN"];
export const defaultLocale: Locale = "en";

// Browser language detection
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const browserLang = navigator.language || navigator.languages?.[0];

  if (browserLang) {
    // Check for Chinese variants
    if (
      browserLang.startsWith("zh-HK") ||
      browserLang.startsWith("zh-TW") ||
      browserLang.startsWith("zh-Hant")
    ) {
      return "zh-HK";
    }
    if (browserLang.startsWith("zh-CN") || browserLang.startsWith("zh-Hans")) {
      return "zh-CN";
    }
    // Check if supported
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }
  }

  return defaultLocale;
}

// Get dictionary for locale
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  switch (locale) {
    case "zh-HK":
      return import("./dictionaries/zh-HK").then((module) => module.default);
    case "zh-CN":
      return import("./dictionaries/zh-CN").then((module) => module.default);
    default:
      return import("./dictionaries/en").then((module) => module.default);
  }
}

// Dictionary import map for dynamic loading
const dictionaryImports = {
  en: () => import("./dictionaries/en").then((module) => module.default),
  "zh-HK": () =>
    import("./dictionaries/zh-HK").then((module) => module.default),
  "zh-CN": () =>
    import("./dictionaries/zh-CN").then((module) => module.default),
} as const;

// Client-side dictionary loading
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  if (dictionaryImports[locale]) {
    return dictionaryImports[locale]();
  }
  return dictionaryImports.en();
}
