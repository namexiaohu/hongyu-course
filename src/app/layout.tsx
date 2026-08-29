import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { CourseFrame } from '@/components/layout/course-frame';
import { AuthModalProvider } from '@/components/providers/auth-modal-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { I18nProvider } from '@/lib/i18n-context';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE } from '@/lib/site-config';
import { fetchUiStringGroups } from '@/lib/ui-strings-client';
import { UI_STRING_PREFETCH_GROUPS } from '@/ui-strings/registry';

import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: DEFAULT_SEO_TITLE, template: `%s · HONGYU Medical Academy` },
  description: DEFAULT_SEO_DESCRIPTION,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, languages, htmlLang, direction } = await getStorefrontLocaleContext();
  const uiStrings = await fetchUiStringGroups(locale, [...UI_STRING_PREFETCH_GROUPS]).catch(() => ({}));

  return (
    <html lang={htmlLang} dir={direction}>
      <body className={inter.className}>
        <I18nProvider locale={locale} initialUiStrings={uiStrings}>
          <AuthProvider>
            <AuthModalProvider>
              <CourseFrame languages={languages} locale={locale}>
                {children}
              </CourseFrame>
            </AuthModalProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
