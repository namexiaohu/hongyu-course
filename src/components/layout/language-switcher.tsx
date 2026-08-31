'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/lib/i18n-context';
import { LOCALE_COOKIE_NAME, localeStorageKey } from '@/lib/i18n';
import {
  getStorefrontLanguage,
  languageHtmlLang,
  languageSwitchLabel,
  pickStorefrontLocale,
  type StorefrontLanguage,
} from '@/lib/storefront-languages';

type LanguageSwitcherProps = {
  languages: StorefrontLanguage[];
  initialLocale: string;
};

function readStoredLocale(languages: StorefrontLanguage[], fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(localeStorageKey);
  return pickStorefrontLocale(stored, languages);
}

function persistLocaleChoice(language: StorefrontLanguage) {
  window.localStorage.setItem(localeStorageKey, language.code);
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(language.code)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitcher({
  languages,
  initialLocale,
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const [locale, setLocale] = useState(initialLocale);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getStorefrontLanguage(locale, languages);

  useEffect(() => {
    const nextLocale = readStoredLocale(languages, initialLocale);
    const language = getStorefrontLanguage(nextLocale, languages);
    setLocale(nextLocale);
    document.documentElement.lang = languageHtmlLang(language);
    document.documentElement.dir = language.direction;
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; SameSite=Lax`;
  }, [initialLocale, languages]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectLocale = (code: string) => {
    const language = getStorefrontLanguage(code, languages);
    setLocale(language.code);
    setOpen(false);
    persistLocaleChoice(language);
    document.documentElement.lang = languageHtmlLang(language);
    document.documentElement.dir = language.direction;
    window.dispatchEvent(new CustomEvent('hongyu:locale-change', { detail: { locale: language.code } }));
    window.location.reload();
  };

  return (
    <div
      ref={rootRef}
      className={`lang-switcher${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="lang-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.switchAriaLabel', { language: current.nativeName })}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          className="lang-switcher-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="lang-switcher-current">{languageSwitchLabel(current)}</span>
        <svg
          className="lang-switcher-chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <ul className="lang-switcher-menu" role="listbox" aria-label={t('language.selectLanguage')}>
          {languages.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === locale}>
              <button
                type="button"
                className={`lang-switcher-option${item.code === locale ? ' is-active' : ''}`}
                onClick={() => selectLocale(item.code)}
              >
                <span className="lang-switcher-option-code">{languageSwitchLabel(item)}</span>
                <span className="lang-switcher-option-name">{item.nativeName}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
