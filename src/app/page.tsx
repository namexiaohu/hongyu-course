import Link from 'next/link';

import { HomePersonalizedSections } from '@/components/academy/home-personalized-sections';
import { getStorefrontLocaleContext, getPageTranslations } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateList } from '@/lib/storefront-academy-certificates-api';

function CoursesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function LearnersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

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
