'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { AcademyHeroVisual } from '@/components/academy/academy-hero-visual';
import { CoursesIcon, LearnersIcon } from '@/components/academy/academy-stat-icons';
import { CourseHeroDecoration } from '@/components/academy/hero-decorations';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useSiteBranding } from '@/components/providers/site-branding-provider';
import { academyLearnPath } from '@/lib/academy-certificate-course';
import {
  getCourseWatchProgress,
  recordCourseView,
  type AcademyWatchProgress,
} from '@/lib/academy-home-api';
import { getCourseLessonProgress } from '@/lib/academy-progress-api';
import { buildAcademyHeroSlides } from '@/lib/academy-hero-media';
import type {
  StorefrontAcademyCourseDetail,
  StorefrontAcademyUnitItem,
} from '@/lib/storefront-academy-courses-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  course: StorefrontAcademyCourseDetail;
  certificateCourseId: string;
};

function resolveWatch(
  watch: AcademyWatchProgress | null,
  units: StorefrontAcademyUnitItem[],
) {
  if (!watch) return null;
  const unit = units.find((item) => item.id === watch.unitId);
  const lesson = unit?.lessons.find((item) => item.id === watch.lessonId);
  if (!unit || !lesson) return null;
  return {
    unitTitle: unit.title,
    lessonTitle: lesson.title,
    positionSeconds: watch.positionSeconds,
    durationSeconds: lesson.durationSeconds,
  };
}

export function CourseDetailView({ course, certificateCourseId }: Props) {
  const { t } = useTranslation();
  const { companyName, positioning } = useSiteBranding();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [tab, setTab] = useState<'about' | 'units'>('about');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [watch, setWatch] = useState<AcademyWatchProgress | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [progressReady, setProgressReady] = useState(false);
  const learnHref = academyLearnPath(course.slug, certificateCourseId);
  const currentCertificate = (course.certificateLinks ?? []).find(
    (link) => link.certificateCourseId === certificateCourseId,
  );
  const slides = buildAcademyHeroSlides({
    title: course.title,
    coverImage: course.coverImage,
    videoUrl: course.videoUrl,
    gallery: course.gallery,
    showCoverOnBackground: course.showCoverOnBackground,
    coverDisplay: course.coverDisplay,
  });
  const units = useMemo(() => course.units ?? [], [course.units]);
  const resume = useMemo(() => resolveWatch(watch, units), [watch, units]);
  const progressLoading = isAuthenticated && !progressReady;

  useEffect(() => {
    if (!isAuthenticated) return;
    void recordCourseView(course.slug).catch(() => undefined);
  }, [course.slug, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setWatch(null);
      setCompletedIds(new Set());
      setProgressReady(true);
      return;
    }
    setProgressReady(false);
    let cancelled = false;
    void Promise.all([
      getCourseWatchProgress(certificateCourseId),
      getCourseLessonProgress(course.slug),
    ])
      .then(([watchPayload, lessonProgress]) => {
        if (cancelled) return;
        setWatch(watchPayload.watch ?? null);
        setCompletedIds(new Set(lessonProgress.completedLessonIds ?? []));
      })
      .catch(() => {
        if (!cancelled) {
          setWatch(null);
          setCompletedIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setProgressReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, certificateCourseId, course.slug, isAuthenticated]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    function refreshWatchProgress() {
      void getCourseWatchProgress(certificateCourseId)
        .then((payload) => setWatch(payload.watch ?? null))
        .catch(() => undefined);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refreshWatchProgress();
    }

    window.addEventListener('focus', refreshWatchProgress);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshWatchProgress);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [authLoading, certificateCourseId, isAuthenticated]);

  function toggleUnit(id: string) {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }

  function isUnitComplete(unit: StorefrontAcademyUnitItem) {
    if (!unit.lessons.length) return false;
    return unit.lessons.every((lesson) => completedIds.has(lesson.id));
  }

  function renderProgressLoading() {
    return (
      <div className="detail-inline-loading" role="status" aria-live="polite" aria-busy="true">
        <span className="detail-inline-loading__spinner" aria-hidden="true" />
        <span>{t('academy.home.loading')}</span>
      </div>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            {currentCertificate ? (
              <p className="course-part-of">
                {t('academy.course.partOfSentence').split('{name}')[0]}
                <Link href={currentCertificate.href}>{currentCertificate.certificateTitle}</Link>
                {t('academy.course.partOfSentence').split('{name}')[1]}
              </p>
            ) : null}
            <h1>{course.title}</h1>
            <p className="hero__lead">{course.summary}</p>
            {isAuthenticated && !progressReady ? (
              renderProgressLoading()
            ) : !isAuthenticated ? (
              <div className="hero__actions">
                <button type="button" className="btn-primary" onClick={() => openAuthModal('register')}>
                  {t('academy.auth.enroll')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => openAuthModal('login')}>
                  {t('academy.nav.login')}
                </button>
              </div>
            ) : (
              <div className="hero__actions">
                <a
                  href={learnHref}
                  className="btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {watch ? t('academy.course.continueCourse') : t('academy.course.startCourse')}
                </a>
                {resume ? (
                  <div className="hero__resume">
                    <p className="hero__resume-lesson">{resume.unitTitle} / {resume.lessonTitle}</p>
                    <p className="hero__resume-meta">
                      {t('academy.home.videoMeta', {
                        watched: resume.positionSeconds,
                        duration: resume.durationSeconds,
                      })}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
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
                {progressLoading ? (
                  renderProgressLoading()
                ) : (
                <div className="course-accordion">
                  {units.map((unit, index) => {
                    const isOpen = Boolean(expanded[unit.id]);
                    const showProgress = isAuthenticated && progressReady;
                    const unitComplete = showProgress && isUnitComplete(unit);
                    return (
                      <div
                        key={unit.id}
                        className={`course-item${isOpen ? ' is-expanded' : ''}${unitComplete ? ' is-complete' : ''}`}
                      >
                        <div className="course-item__header">
                          <div className="course-item__info">
                            <span className="course-item__title course-item__title--static">{unit.title}</span>
                            <div className="course-item__meta">
                              {t('academy.course.unitRowMeta', {
                                index: index + 1,
                                count: unit.lessons.length,
                              })}
                              {unitComplete ? (
                                <span className="course-item__badge">{t('academy.certificate.courseCompleted')}</span>
                              ) : null}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="course-item__toggle"
                            onClick={() => toggleUnit(unit.id)}
                            aria-expanded={isOpen}
                          >
                            <svg className="course-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>
                        {isOpen ? (
                          <div className="course-item__body">
                            {showProgress ? (
                              <div className="lesson-complete-list lesson-complete-list--course">
                                {unit.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className={`lesson-complete-row${completedIds.has(lesson.id) ? ' is-complete' : ''}`}
                                  >
                                    <span className="lesson-complete-row__icon" aria-hidden="true">
                                      {completedIds.has(lesson.id) ? '✓' : '·'}
                                    </span>
                                    <span className="lesson-complete-row__title">{lesson.title}</span>
                                    <span className="lesson-complete-row__meta">{lesson.durationLabel}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
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
                            </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                )}
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
                {companyName ? <div className="instructor-name">{companyName}</div> : null}
                {positioning ? <div className="instructor-org">{positioning}</div> : null}
              </div>
            </div>
            <p className="instructor-stats instructor-stats--icons">
              <span className="cert-card__meta-item">
                <CoursesIcon />
                {t('academy.course.instructorUnits', { count: units.length })}
              </span>
              <span className="cert-card__meta-dot" aria-hidden>·</span>
              <span className="cert-card__meta-item">
                <LearnersIcon />
                {t('academy.certificate.instructorStudents', { count: course.studentCount.toLocaleString() })}
              </span>
            </p>
            <hr className="sidebar-divider" />
            <h3 className="sidebar-card__title">{t('academy.certificate.provider')}</h3>
            {companyName ? (
              <div className="provider-row">
                <div className="provider-logo" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>
                </div>
                <div className="provider-name">{companyName}</div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
