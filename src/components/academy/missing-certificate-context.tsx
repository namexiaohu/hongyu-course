import Link from 'next/link';

import { getPageTranslations, getStorefrontLocaleContext } from '@/lib/i18n-server';

export async function MissingCertificateContext() {
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['academy']);

  return (
    <div className="learn-auth-gate">
      <div className="learn-auth-gate__card">
        <h2 className="learn-auth-gate__title">{t('academy.course.missingContextTitle')}</h2>
        <p className="learn-auth-gate__body">{t('academy.course.missingContextBody')}</p>
        <div className="learn-auth-gate__actions">
          <Link href="/certificates" className="btn-primary">
            {t('academy.home.browseCertificates')}
          </Link>
        </div>
      </div>
    </div>
  );
}
