import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';

import { CourseFrame } from '@/components/layout/course-frame';
import { AuthModalProvider } from '@/components/providers/auth-modal-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SiteBrandingProvider } from '@/components/providers/site-branding-provider';
import { I18nProvider } from '@/lib/i18n-context';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE } from '@/lib/site-config';
import { getStorefrontCompanyProfile } from '@/lib/storefront-company-api';
import { toStorefrontCompanyBranding } from '@/lib/storefront-company';
import { fetchUiStringGroups } from '@/lib/ui-strings-client';
import { UI_STRING_PREFETCH_GROUPS } from '@/ui-strings/registry';

import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '900'],
  variable: '--font-montserrat',
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getStorefrontLocaleContext();
  const company = await getStorefrontCompanyProfile(locale);
  const companyName = company.companyName.trim();

  return {
    title: {
      default: companyName || DEFAULT_SEO_TITLE,
      template: companyName ? `%s · ${companyName}` : `%s · ${DEFAULT_SEO_TITLE}`,
    },
    description: company.positioning.trim() || DEFAULT_SEO_DESCRIPTION,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, languages, htmlLang, direction } = await getStorefrontLocaleContext();
  const [company, uiStrings] = await Promise.all([
    getStorefrontCompanyProfile(locale),
    fetchUiStringGroups(locale, [...UI_STRING_PREFETCH_GROUPS]).catch(() => ({})),
  ]);
  const branding = toStorefrontCompanyBranding(company);

  return (
    <html lang={htmlLang} dir={direction} className={montserrat.variable}>
      <body className={inter.className}>
        <I18nProvider locale={locale} initialUiStrings={uiStrings}>
          <SiteBrandingProvider branding={branding}>
            <AuthProvider>
              <AuthModalProvider>
                <CourseFrame languages={languages} locale={locale} branding={branding}>
                  {children}
                </CourseFrame>
              </AuthModalProvider>
            </AuthProvider>
          </SiteBrandingProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
