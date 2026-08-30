import Link from 'next/link';

import { HomePersonalizedSections } from '@/components/academy/home-personalized-sections';
import { CoursesIcon, LearnersIcon } from '@/components/academy/academy-stat-icons';
import { getStorefrontLocaleContext, getPageTranslations } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateList } from '@/lib/storefront-academy-certificates-api';

export default async function HomePage() {
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['academy']);
  const list = await getStorefrontAcademyCertificateList({ locale, pageSize: 4 });

  return (
    <>
      <HomePersonalizedSections />

      {list.items.length ? (
        <section id="popular-certificates" className="section">
          <div className="container">
            <h2 className="section-title">{t('academy.home.popularCertificates')}</h2>
            <div className="cert-grid cert-grid--popular">
              {list.items.map((item) => (
                <Link key={item.slug} href={`/certificates/${item.slug}`} className="cert-card">
                  <div className="cert-card__cover-wrap">
                    {item.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverImage} alt="" className="cert-card__cover" />
                    ) : (
                      <div className="cert-card__cover" />
                    )}
                    {item.badgeLabel ? <span className="cert-card-badge">{item.badgeLabel}</span> : null}
                  </div>
                  <div className="cert-card__body">
                    <h3 className="cert-card__title">{item.title}</h3>
                    {item.subtitle ? <p className="cert-card__subtitle">{item.subtitle}</p> : null}
                    {item.summary ? <p className="cert-card__summary">{item.summary}</p> : null}
                    {item.skills?.length ? (
                      <>
                        <p className="cert-card-skills-label">{t('academy.certificate.skills')}</p>
                        <div className="cert-card-tags">
                          {item.skills.map((tag) => (
                            <span key={tag} className="tag tag-accent">{tag}</span>
                          ))}
                        </div>
                      </>
                    ) : null}
                    <p className="cert-card__meta cert-card__meta--icons">
                      <span className="cert-card__meta-item">
                        <CoursesIcon />
                        {item.courseCount} courses
                      </span>
                      <span className="cert-card__meta-dot" aria-hidden>·</span>
                      <span className="cert-card__meta-item">
                        <LearnersIcon />
                        {item.studentCount.toLocaleString()} {t('academy.home.enrolled')}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
