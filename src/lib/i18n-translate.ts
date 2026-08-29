import { getRegistryDefault } from '@/ui-strings/registry';

import enTranslations from '@/locales/en.json';

export type TranslationParams = Record<string, string | number | boolean>;
type TranslationObject = Record<string, unknown>;

const enDefaults = enTranslations as TranslationObject;

function getNestedValue(obj: TranslationObject, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in (current as TranslationObject)) {
      return (current as TranslationObject)[key];
    }
    return undefined;
  }, obj);
}

export function interpolateString(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
}

export function resolveEnglishTemplate(key: string): string | undefined {
  const fromEn = getNestedValue(enDefaults, key);
  if (typeof fromEn === 'string') {
    return fromEn;
  }
  return getRegistryDefault(key);
}

export function createTranslateFn(
  locale: string,
  uiStrings: Record<string, string> = {},
): (key: string, params?: TranslationParams) => string {
  return (key: string, params?: TranslationParams) => {
    const fromRuntime = uiStrings[key];
    if (typeof fromRuntime === 'string' && fromRuntime.length > 0) {
      return interpolateString(fromRuntime, params);
    }

    const template = resolveEnglishTemplate(key);
    if (template) {
      return interpolateString(template, params);
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`Translation key not found: "${key}" for locale "${locale}"`);
    }

    return key;
  };
}
