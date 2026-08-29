'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useTranslation } from '@/lib/i18n-context';
import { SITE_BRAND } from '@/lib/site-config';
import type { StorefrontLanguage } from '@/lib/storefront-languages';
import { getUserInitial } from '@/lib/user-initial';

type Props = {
  children: React.ReactNode;
  languages: StorefrontLanguage[];
  locale: string;
};

export function CourseFrame({ children, languages, locale }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const isExam = pathname.includes('/exam');
  const isLearning = pathname.includes('/learn') || isExam;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  const initial = user ? getUserInitial(user.firstName, user.lastName) : '';

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
            {!isExam ? (
              <div className="course-nav__search">
                <input type="search" placeholder={t('academy.nav.searchPlaceholder')} aria-label={t('academy.nav.searchPlaceholder')} />
              </div>
            ) : null}
          </div>
          <div className="course-nav__actions">
            <LanguageSwitcher languages={languages} initialLocale={locale} />
            {isAuthenticated && user ? (
              <div className="course-nav__account" ref={menuRef}>
                <button
                  type="button"
                  className="course-nav__avatar"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  onClick={() => setMenuOpen((current) => !current)}
                >
                  {initial}
                </button>
                {menuOpen ? (
                  <div className="account-menu" role="menu">
                    <Link href="/my-exams" className="account-menu__item" role="menuitem" onClick={() => setMenuOpen(false)}>
                      {t('academy.auth.myExams')}
                    </Link>
                    <Link href="/my-certificates" className="account-menu__item" role="menuitem" onClick={() => setMenuOpen(false)}>
                      {t('academy.auth.myCertificates')}
                    </Link>
                    <button
                      type="button"
                      className="account-menu__item account-menu__item--danger"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    >
                      {t('academy.auth.logout')}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button type="button" className="course-nav__auth" onClick={() => openAuthModal('login')}>
                {t('academy.nav.login')}
              </button>
            )}
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
              <button type="button" className="course-nav__auth" onClick={() => openAuthModal('login')}>
                {t('academy.footer.help')}
              </button>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
