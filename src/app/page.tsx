import Link from 'next/link';

import { getStorefrontLocaleContext, getPageTranslations } from '@/lib/i18n-server';
import { MOCK_USER, UNSPLASH } from '@/lib/mock/academy-mock';
import { getStorefrontAcademyCertificateList } from '@/lib/storefront-academy-certificates-api';

export default async function HomePage() {
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['academy']);
  const list = await getStorefrontAcademyCertificateList({ locale, pageSize: 24 });

  return (
    <>
      <section className="welcome-banner">
        <div className="container welcome-banner__grid">
          <div>
            <p className="cert-card__meta">{t('academy.home.welcome')}, {MOCK_USER.name}</p>
            <h1 className="welcome-banner__title">{MOCK_USER.certificateTitle}</h1>
            <div className="progress-bar" aria-hidden="true"><div className="progress-bar__fill" style={{ width: `${MOCK_USER.progress}%` }} /></div>
            <p className="cert-card__meta">{MOCK_USER.progress}% complete</p>
            <div style={{ marginTop: 20 }}>
              <Link href="/courses/small-animal-internal-medicine/learn" className="btn-primary">{t('academy.home.startNow')}</Link>
            </div>
          </div>
          <div>
            <img src={UNSPLASH.welcome} alt="" className="cert-card__cover" style={{ borderRadius: 4 }} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{t('academy.home.popularCertificates')}</h2>
          <div className="cert-grid">
            {list.items.map((item) => (
              <Link key={item.slug} href={`/certificates/${item.slug}`} className="cert-card">
                {item.coverImage ? <img src={item.coverImage} alt="" className="cert-card__cover" /> : <div className="cert-card__cover" />}
                <div className="cert-card__body">
                  <h3 className="cert-card__title">{item.title}</h3>
                  <p className="cert-card__summary">{item.summary}</p>
                  <p className="cert-card__meta">{item.courseCount} courses · {item.studentCount.toLocaleString()} {t('academy.home.enrolled')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
