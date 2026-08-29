import { cookies, headers } from 'next/headers';

import {
  LOCALE_COOKIE_NAME,
  LOCALE_REQUEST_HEADER,
  getMarketDefaults,
  type Locale,
  type SitePreferences,
} from '@/lib/i18n';
import { createTranslateFn, type TranslationParams } from '@/lib/i18n-translate';
import { fetchUiStringGroups } from '@/lib/ui-strings-client';
import { getStorefrontLanguages } from '@/lib/storefront-languages';
import {
  getDefaultStorefrontLanguage,
  languageHtmlLang,
  pickStorefrontLocale,
  type StorefrontLanguage,
} from '@/lib/storefront-languages';

export type TranslateFn = (key: string, params?: TranslationParams) => string;

export type StorefrontLocaleContext = SitePreferences & {
  languages: StorefrontLanguage[];
  htmlLang: string;
  direction: 'ltr' | 'rtl';
};

export async function getStorefrontLocaleContext(): Promise<StorefrontLocaleContext> {
  const [cookieStore, headerStore, languages] = await Promise.all([
    cookies(),
    headers(),
    getStorefrontLanguages(),
  ]);
  const locale = pickStorefrontLocale(
    headerStore.get(LOCALE_REQUEST_HEADER) ?? cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    languages,
  );
  const language = languages.find((item) => item.code === locale) ?? getDefaultStorefrontLanguage(languages);
  const defaults = getMarketDefaults(locale);

  return {
    locale,
    currency: defaults.currency,
    unitSystem: defaults.unitSystem,
    languages,
    htmlLang: languageHtmlLang(language),
    direction: language.direction,
  };
}

export async function getServerSitePreferences(): Promise<SitePreferences> {
  const { locale, currency, unitSystem } = await getStorefrontLocaleContext();
  return { locale, currency, unitSystem };
}

export function getServerTranslations(locale: Locale = 'en', uiStrings: Record<string, string> = {}) {
  const t = createTranslateFn(locale, uiStrings);
  return { t, locale };
}

export async function getPageTranslations(locale: string, groups: string[]) {
  const uiStrings = await fetchUiStringGroups(locale, groups).catch(() => ({}));
  return getServerTranslations(locale, uiStrings);
}
