'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { AcademyHeroVisual } from '@/components/academy/academy-hero-visual';
import { CertificateHeroDecoration } from '@/components/academy/hero-decorations';
import { buildAcademyHeroSlides } from '@/lib/academy-hero-media';
import type { StorefrontAcademyCertificateDetail } from '@/lib/storefront-academy-certificates-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = { certificate: StorefrontAcademyCertificateDetail };

export function CertificateDetailView({ certificate }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'about' | 'courses'>('about');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const firstCourse = certificate.courses[0];
  const slides = buildAcademyHeroSlides({
    title: certificate.title,
    coverImage: certificate.coverImage,
    videoUrl: certificate.videoUrl,
    gallery: certificate.gallery,
    showCoverOnBackground: certificate.showCoverOnBackground,
    coverDisplay: certificate.coverDisplay,
  });

  const courses = useMemo(() => certificate.courses ?? [], [certificate.courses]);

  function toggleCourse(slug: string) {
    setExpanded((current) => ({ ...current, [slug]: !current[slug] }));
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <h1>{certificate.title}</h1>
            <p className="hero__lead">{certificate.summary}</p>
            <p className="cert-card__meta">{certificate.studentCount.toLocaleString()} {t('academy.home.enrolled')}</p>
            <div className="hero__actions">
              {firstCourse ? (
                <Link href={`/courses/${firstCourse.slug}`} className="btn-primary">{t('academy.certificate.enroll')}</Link>
              ) : null}
              <Link href="/auth" className="btn-secondary">{t('academy.nav.login')}</Link>
            </div>
          </div>
          <AcademyHeroVisual slides={slides} fallback={<CertificateHeroDecoration />} />
        </div>
      </section>

      <div className="container">
        <div className="metrics-bar">
          {certificate.stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="metric">
              <div className="metric__value">{stat.value}</div>
              <div className="metric__label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          <button type="button" className={`tab${tab === 'about' ? ' is-active' : ''}`} onClick={() => setTab('about')}>{t('academy.certificate.about')}</button>
          <button type="button" className={`tab${tab === 'courses' ? ' is-active' : ''}`} onClick={() => setTab('courses')}>{t('academy.certificate.courses')}</button>
        </div>

        <div className="detail-grid">
          <div>
            {tab === 'about' ? (
              <>
                <h2>{t('academy.certificate.outcomes')}</h2>
                <ul className="outcome-list">
                  {certificate.learnings.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <h3>{t('academy.certificate.skills')}</h3>
                <div className="tag-list">{certificate.skills.map((item) => <span key={item} className="tag">{item}</span>)}</div>
                <h3>{t('academy.certificate.tools')}</h3>
                <div className="tag-list">{certificate.tools.map((item) => <span key={item} className="tag">{item}</span>)}</div>
                <div dangerouslySetInnerHTML={{ __html: certificate.description }} style={{ marginTop: 24 }} />
              </>
            ) : (
              <>
                <h2>{t('academy.certificate.courseList')}</h2>
                <div className="course-accordion">
                  {courses.map((course, index) => {
                    const isOpen = Boolean(expanded[course.slug]);
                    return (
                      <div key={course.slug} className={`course-item${isOpen ? ' is-expanded' : ''}`}>
                        <button type="button" className="course-item__header" onClick={() => toggleCourse(course.slug)}>
                          {course.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={course.coverImage} alt="" className="course-item__thumb" />
                          ) : (
                            <div className="course-item__thumb" />
                          )}
                          <div className="course-item__info">
                            <div className="course-item__title">{index + 1}. {course.title}</div>
                            <div className="course-item__meta">{course.units.length} units</div>
                          </div>
                          <svg className="course-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {isOpen ? (
                          <div className="course-item__body">
                            <p>{course.summary}</p>
                            <div className="module-list">
                              {course.units.map((unit, unitIndex) => (
                                <div key={unit.id} className="module-row">
                                  <span>{unitIndex + 1}. {unit.title}</span>
                                </div>
                              ))}
                              {!course.units.length ? <p className="cert-card__meta">No units yet</p> : null}
                            </div>
                            <Link href={`/courses/${course.slug}`} className="btn-secondary" style={{ marginTop: 12, display: 'inline-flex' }}>
                              View course
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <aside className="sidebar-card">
            <h3 className="sidebar-card__title">
              {t('academy.certificate.teachers', { count: certificate.teacherCount })}
            </h3>
            <div className="instructor-row">
              <div className="instructor-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>
              </div>
              <div>
                <div className="instructor-name">{t('academy.certificate.instructorTeam')}</div>
                <div className="instructor-org">{t('academy.certificate.academyName')}</div>
              </div>
            </div>
            <p className="instructor-stats">
              {t('academy.certificate.instructorStats', {
                courses: certificate.courses.length,
                students: certificate.studentCount.toLocaleString(),
              })}
            </p>
            <hr className="sidebar-divider" />
            <h3 className="sidebar-card__title">{t('academy.certificate.provider')}</h3>
            <div className="provider-row">
              <div className="provider-logo" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>
              </div>
              <div className="provider-name">{t('academy.certificate.academyName')}</div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
