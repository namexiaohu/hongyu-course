export type Locale = string;
export type Currency = 'USD' | 'EUR' | 'GBP';
export type UnitSystem = 'imperial' | 'metric';

export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_COOKIE_NAME = 'hongyu-locale';
export const localeStorageKey = LOCALE_COOKIE_NAME;
export const LOCALE_REQUEST_HEADER = 'x-vex-locale';

export type SitePreferences = {
  locale: Locale;
  currency: Currency;
  unitSystem: UnitSystem;
};

const localeDefaults: Record<string, { currency: Currency; unitSystem: UnitSystem }> = {
  zh: { currency: 'USD', unitSystem: 'metric' },
  'zh-CN': { currency: 'USD', unitSystem: 'metric' },
  en: { currency: 'USD', unitSystem: 'imperial' },
  es: { currency: 'EUR', unitSystem: 'metric' },
};

export function normalizeLocale(value: string | null | undefined, fallback: Locale = DEFAULT_LOCALE): Locale {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export function getMarketDefaults(locale: Locale) {
  return localeDefaults[locale]
    ?? localeDefaults[locale.split('-')[0]]
    ?? localeDefaults[DEFAULT_LOCALE];
}
