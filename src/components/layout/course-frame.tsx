'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useTranslation } from '@/lib/i18n-context';
import { SITE_BRAND } from '@/lib/site-config';
import type { StorefrontLanguage } from '@/lib/storefront-languages';

type Props = {
  children: React.ReactNode;
  languages: StorefrontLanguage[];
  locale: string;
};

export function CourseFrame({ children, languages, locale }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isLearning = pathname.includes('/learn') || pathname.includes('/exam');

  return (
    <div className={`course-app${isLearning ? ' is-learning' : ''}`}>
      <header className={`course-nav${isLearning ? ' course-nav--learn' : ''}`}>
        <div className={`course-nav__inner${isLearning ? ' course-nav__inner--learn' : ''}`}>
          <div className="course-nav__left">
            <Link href="/" className="course-nav__brand">{SITE_BRAND}</Link>
            {!isLearning ? (
              <nav className="course-nav__links">
                <Link href="/">{t('academy.nav.explore')}</Link>
                <Link href="/courses/small-animal-internal-medicine/learn">{t('academy.nav.myLearning')}</Link>
              </nav>
            ) : null}
            <div className="course-nav__search">
              <input type="search" placeholder={t('academy.nav.searchPlaceholder')} aria-label={t('academy.nav.searchPlaceholder')} />
            </div>
          </div>
          <div className="course-nav__actions">
            <LanguageSwitcher languages={languages} initialLocale={locale} />
            <Link href="/auth" className="course-nav__auth">{t('academy.nav.login')}</Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      {!isLearning ? (
        <footer className="course-footer">
          <div className="course-footer__inner">
            <p>© {new Date().getFullYear()} {SITE_BRAND}</p>
            <div className="course-footer__links">
              <Link href="/">{t('academy.footer.certificates')}</Link>
              <Link href="/auth">{t('academy.footer.help')}</Link>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
