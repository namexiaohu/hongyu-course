import { serverFetch } from '@/lib/api-client';

export type StorefrontLanguage = {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  direction: 'ltr' | 'rtl';
  countryCodes: string[];
  currencyCode: string;
  isDefault: boolean;
  sortOrder: number;
};

export function sortStorefrontLanguages(languages: StorefrontLanguage[]) {
  return [...languages].sort((left, right) => {
    if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name);
  });
}

function requireStorefrontLanguages(languages: StorefrontLanguage[]) {
  if (!languages.length) {
    throw new Error('Storefront languages are not configured');
  }
  return languages;
}

export function getDefaultStorefrontLanguage(languages: StorefrontLanguage[]) {
  const available = requireStorefrontLanguages(languages);
  return available.find((item) => item.isDefault) ?? available[0];
}

export function pickStorefrontLocale(
  preferred: string | null | undefined,
  languages: StorefrontLanguage[],
) {
  const available = requireStorefrontLanguages(languages);
  const fallback = getDefaultStorefrontLanguage(available).code;
  const normalized = preferred?.trim().toLowerCase();
  if (!normalized) return fallback;
  const exact = available.find((item) => item.code.toLowerCase() === normalized);
  if (exact) return exact.code;
  const prefix = normalized.split('-')[0];
  const prefixMatch = available.find((item) => {
    const code = item.code.toLowerCase();
    return code === prefix || code.startsWith(`${prefix}-`);
  });
  return prefixMatch?.code ?? fallback;
}

export function getStorefrontLanguage(code: string, languages: StorefrontLanguage[]) {
  const available = requireStorefrontLanguages(languages);
  const picked = pickStorefrontLocale(code, available);
  return available.find((item) => item.code === picked) ?? getDefaultStorefrontLanguage(available);
}

export function languageSwitchLabel(language: StorefrontLanguage) {
  const code = language.code.toLowerCase();
  if (code === 'zh' || code.startsWith('zh-')) {
    if (code.includes('tw') || code.includes('hk') || code.includes('hant')) return '繁中';
    return '中文';
  }
  const base = code.split('-')[0];
  return base.length <= 3 ? base.toUpperCase() : language.nativeName;
}

export function languageHtmlLang(language: StorefrontLanguage) {
  if (language.code === 'zh') return 'zh-CN';
  return language.code;
}

export async function getStorefrontLanguages(): Promise<StorefrontLanguage[]> {
  const payload = await serverFetch<{ languages: StorefrontLanguage[] }>('/api/front/languages');
  const languages = sortStorefrontLanguages(payload.languages ?? []);
  return requireStorefrontLanguages(languages);
}
