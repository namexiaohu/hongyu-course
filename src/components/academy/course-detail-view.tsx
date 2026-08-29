'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { AcademyHeroVisual } from '@/components/academy/academy-hero-visual';
import { CourseHeroDecoration } from '@/components/academy/hero-decorations';
import { buildAcademyHeroSlides } from '@/lib/academy-hero-media';
import type { StorefrontAcademyCourseDetail } from '@/lib/storefront-academy-courses-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = { course: StorefrontAcademyCourseDetail };

export function CourseDetailView({ course }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'about' | 'units'>('about');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const slides = buildAcademyHeroSlides({
    title: course.title,
    coverImage: course.coverImage,
    videoUrl: course.videoUrl,
    gallery: course.gallery,
    showCoverOnBackground: course.showCoverOnBackground,
    coverDisplay: course.coverDisplay,
  });
  const units = useMemo(() => course.units ?? [], [course.units]);

  function toggleUnit(id: string) {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            {course.certificates[0] ? (
              <p className="cert-card__meta">{t('academy.course.partOf')} <Link href={course.certificates[0].href}>{course.certificates[0].title}</Link></p>
            ) : null}
            <h1>{course.title}</h1>
            <p className="hero__lead">{course.summary}</p>
            <div className="hero__actions">
              <Link href={`/courses/${course.slug}/learn`} className="btn-primary">{t('academy.course.startCourse')}</Link>
            </div>
          </div>
          <AcademyHeroVisual slides={slides} fallback={<CourseHeroDecoration />} />
        </div>
      </section>

      <div className="container">
        <div className="metrics-bar">
          {course.stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="metric">
              <div className="metric__value">{stat.value}</div>
              <div className="metric__label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          <button type="button" className={`tab${tab === 'about' ? ' is-active' : ''}`} onClick={() => setTab('about')}>{t('academy.course.about')}</button>
          <button type="button" className={`tab${tab === 'units' ? ' is-active' : ''}`} onClick={() => setTab('units')}>{t('academy.course.units')}</button>
        </div>

        <div className="detail-grid">
          <div>
            {tab === 'about' ? (
              <>
                <h2>{t('academy.certificate.outcomes')}</h2>
                <ul className="outcome-list">
                  {course.learnings.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <h3>{t('academy.certificate.skills')}</h3>
                <div className="tag-list">{course.skills.map((item) => <span key={item} className="tag">{item}</span>)}</div>
                <h3>{t('academy.certificate.tools')}</h3>
                <div className="tag-list">{course.tools.map((item) => <span key={item} className="tag">{item}</span>)}</div>
                <div dangerouslySetInnerHTML={{ __html: course.description }} style={{ marginTop: 24 }} />
              </>
            ) : (
              <>
                <h2>{t('academy.course.modules')}</h2>
                <div className="module-accordion">
                  {units.map((unit, index) => {
                    const isOpen = Boolean(expanded[unit.id]);
                    return (
                      <div key={unit.id} className={`module-item${isOpen ? ' is-expanded' : ''}`}>
                        <button type="button" className="module-item__header" onClick={() => toggleUnit(unit.id)}>
                          <div>
                            <div className="module-item__title">{index + 1}. {unit.title}</div>
                            <div className="module-item__meta">{unit.lessons.length} lessons</div>
                          </div>
                          <svg className="module-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {isOpen ? (
                          <div className="module-item__body">
                            <div className="lesson-list">
                              {unit.lessons.map((lesson) => (
                                <div key={lesson.id} className="lesson-row">
                                  <svg className="lesson-row__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                  <span className="lesson-row__title">{lesson.title}</span>
                                  <span className="lesson-row__meta">{lesson.durationLabel}</span>
                                </div>
                              ))}
                              {!unit.lessons.length ? <p className="cert-card__meta">No lessons yet</p> : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {!units.length ? <p className="cert-card__meta">No units yet</p> : null}
                </div>
              </>
            )}
          </div>
          <aside className="sidebar-card">
            <h3 className="sidebar-card__title">
              {t('academy.certificate.teachers', { count: course.teacherCount })}
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
              {t('academy.course.instructorStats', {
                units: units.length,
                students: course.studentCount.toLocaleString(),
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
