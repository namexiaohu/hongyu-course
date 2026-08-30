import enTranslations from '@/locales/en.json';

export type UiStringRegistryEntry = {
  default: string;
  group: string;
  context?: string;
};

type NestedRecord = Record<string, unknown>;

function flattenTranslations(obj: NestedRecord, prefix = ''): Record<string, UiStringRegistryEntry> {
  const result: Record<string, UiStringRegistryEntry> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value as NestedRecord, fullKey));
    } else if (typeof value === 'string') {
      result[fullKey] = {
        default: value,
        group: fullKey.split('.')[0] ?? 'common',
        context: '',
      };
    }
  }

  return result;
}

const fromEnJson = flattenTranslations(enTranslations as NestedRecord);

export const UI_STRING_REGISTRY: Record<string, UiStringRegistryEntry> = {
  ...fromEnJson,
};

export const UI_STRING_PREFETCH_GROUPS = [
  'language',
  'academy',
] as const;

export function getRegistryDefault(key: string): string | undefined {
  return UI_STRING_REGISTRY[key]?.default;
}
