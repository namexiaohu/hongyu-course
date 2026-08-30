'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useTranslation } from '@/lib/i18n-context';
import { SITE_BRAND, HOME_SITE_URL } from '@/lib/site-config';
import type { StorefrontLanguage } from '@/lib/storefront-languages';
import { getUserInitial } from '@/lib/user-initial';

type Props = {
  children: React.ReactNode;
  languages: StorefrontLanguage[];
  locale: string;
};

function HeaderSearch() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const fromUrl = pathname === '/search' ? (params.get('q') ?? '') : '';
  const [q, setQ] = useState(fromUrl);

  useEffect(() => {
    setQ(pathname === '/search' ? (params.get('q') ?? '') : '');
  }, [pathname, params]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/certificates');
  }

  return (
    <form className="course-nav__search" onSubmit={onSubmit} role="search">
      <input
        type="search"
        name="q"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder={t('academy.nav.searchPlaceholder')}
        aria-label={t('academy.nav.searchPlaceholder')}
      />
    </form>
  );
}

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
                <Link href="/certificates">{t('academy.nav.explore')}</Link>
              </nav>
            ) : null}
            {!isLearning ? (
              <Suspense fallback={null}>
                <HeaderSearch />
              </Suspense>
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
              <a href={HOME_SITE_URL} className="course-nav__auth">{t('academy.footer.help')}</a>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
