'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { AcademyHeroVisual } from '@/components/academy/academy-hero-visual';
import { CoursesIcon, LearnersIcon } from '@/components/academy/academy-stat-icons';
import { CertificateHeroDecoration } from '@/components/academy/hero-decorations';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useSiteBranding } from '@/components/providers/site-branding-provider';
import { academyCertificateExamPath, academyLearnPath } from '@/lib/academy-certificate-course';
import { recordCertificateView } from '@/lib/academy-home-api';
import { buildAcademyHeroSlides } from '@/lib/academy-hero-media';
import type { StorefrontAcademyCertificateDetail } from '@/lib/storefront-academy-certificates-api';
import {
  getCertificateLearningState,
  type CertificateLearningState,
} from '@/lib/storefront-academy-certificate-learning-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = { certificate: StorefrontAcademyCertificateDetail };

function ProgressBar({
  percent,
  complete,
}: {
  percent: number;
  complete: boolean;
}) {
  return (
    <div className="cert-progress">
      <div className="cert-progress__track">
        <div
          className={`cert-progress__fill${complete ? ' cert-progress__fill--complete' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

function NoticeBox({
  variant,
  title,
  body,
}: {
  variant: 'warn' | 'success' | 'info';
  title: string;
  body: string;
}) {
  return (
    <div className={`cert-notice cert-notice--${variant}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {variant === 'success' ? (
          <>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ) : (
          <>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </>
        )}
      </svg>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function CertificateDetailView({ certificate }: Props) {
  const { t } = useTranslation();
  const { companyName, positioning } = useSiteBranding();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [tab, setTab] = useState<'about' | 'courses'>('courses');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [learning, setLearning] = useState<CertificateLearningState | null>(null);
  const [learningReady, setLearningReady] = useState(false);

  const firstCourse = certificate.courses[0];
  const slides = buildAcademyHeroSlides({
    title: certificate.title,
    coverImage: certificate.coverImage,
    videoUrl: certificate.videoUrl,
    gallery: certificate.gallery,
    showCoverOnBackground: certificate.showCoverOnBackground,
    coverDisplay: certificate.coverDisplay,
  });

  const status = learning?.status ?? (isAuthenticated ? 'not_started' : 'not_started');
  const progress = learning?.progress;
  const exam = learning?.exam ?? (certificate.examHint.hasExam
    ? {
        hasExam: true,
        questionCount: certificate.examHint.questionCount ?? 0,
        passScorePercent: certificate.examHint.passScorePercent ?? 0,
        examTitle: '',
      }
    : { hasExam: false, questionCount: 0, passScorePercent: 0, examTitle: '' });

  const courseRows = useMemo(() => {
    if (learning?.courses.length) return learning.courses;
    return certificate.courses.map((course, index) => ({
      certificateCourseId: course.certificateCourseId,
      slug: course.slug,
      title: course.title,
      sortOrder: course.sortOrder,
      courseIndex: index + 1,
      isComplete: false,
      href: course.href,
      learnHref: academyLearnPath(course.slug, course.certificateCourseId),
      units: course.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        sortOrder: unit.sortOrder,
        lessons: [],
      })),
    }));
  }, [certificate.courses, learning?.courses]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLearning(null);
      setLearningReady(true);
      return;
    }
    setLearningReady(false);
    void getCertificateLearningState(certificate.slug)
      .then((state) => setLearning(state))
      .catch(() => setLearning(null))
      .finally(() => setLearningReady(true));
  }, [certificate.slug, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void recordCertificateView(certificate.slug).catch(() => undefined);
  }, [certificate.slug, isAuthenticated]);

  function toggleCourse(slug: string) {
    setExpanded((current) => ({ ...current, [slug]: !current[slug] }));
  }

  const continueHref = learning?.continueLearnHref ?? firstCourse?.href ?? null;
  const examHref = academyCertificateExamPath(certificate.slug);
  const progressPercent = progress?.progressPercent ?? 0;

  function renderHeroActions() {
    if (!isAuthenticated) {
      return (
        <div className="hero__actions">
          {firstCourse ? (
            <a href={firstCourse.href} className="btn-primary" target="_blank" rel="noopener noreferrer">
              {t('academy.auth.startCourse')}
            </a>
          ) : null}
          <button type="button" className="btn-secondary" onClick={() => openAuthModal('login')}>
            {t('academy.nav.login')}
          </button>
        </div>
      );
    }

    if (status === 'exam_passed' && learning?.examResult) {
      return (
        <div className="hero__actions">
          <Link href={learning.examResult.certificateHref} className="btn-primary btn-primary--success">
            {t('academy.certificate.viewMyCertificate')}
          </Link>
          {continueHref ? (
            <a href={continueHref} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t('academy.certificate.continueLearning')}
            </a>
          ) : null}
        </div>
      );
    }

    if (status === 'courses_complete' && exam.hasExam) {
      return (
        <div className="hero__actions">
          <Link href={examHref} className="btn-primary" target="_blank" rel="noopener noreferrer">
            {t('academy.certificate.enterExam')}
          </Link>
          {continueHref ? (
            <a href={continueHref} className="btn-secondary" target="_blank" rel="noopener noreferrer">
              {t('academy.certificate.continueLearning')}
            </a>
          ) : null}
        </div>
      );
    }

    if (status === 'learning' || status === 'courses_complete') {
      return (
        <div className="hero__actions">
          {continueHref ? (
            <a href={continueHref} className="btn-primary" target="_blank" rel="noopener noreferrer">
              {t('academy.certificate.continueLearning')}
            </a>
          ) : null}
        </div>
      );
    }

    return (
      <div className="hero__actions">
        {firstCourse ? (
          <a href={firstCourse.href} className="btn-primary" target="_blank" rel="noopener noreferrer">
            {t('academy.auth.startCourse')}
          </a>
        ) : null}
      </div>
    );
  }

  function renderProgressBlock() {
    if (!isAuthenticated || !learningReady) return null;
    if (status === 'not_started' && !progress) return null;

    const complete = status === 'courses_complete' || status === 'exam_passed';
    return (
      <div className="cert-progress-block">
        <div className="cert-progress-block__head">
          <span>{t('academy.certificate.learningProgress')}</span>
          <span className={complete ? 'cert-progress-block__stat cert-progress-block__stat--complete' : 'cert-progress-block__stat'}>
            {t('academy.certificate.progressPercentComplete', { percent: progressPercent })}
            {complete ? ' ✓' : ''}
          </span>
        </div>
        <ProgressBar percent={progressPercent} complete={complete} />
      </div>
    );
  }

  function renderNotice() {
    if (status === 'exam_passed' && learning?.examResult) {
      return (
        <NoticeBox
          variant="success"
          title={t('academy.certificate.examPassedTitle')}
          body={t('academy.certificate.examPassedBody', {
            score: learning.examResult.score ?? 0,
            total: learning.examResult.totalScore ?? 0,
            title: certificate.title,
          })}
        />
      );
    }

    if (status === 'courses_complete' && exam.hasExam) {
      return (
        <NoticeBox
          variant="success"
          title={t('academy.certificate.examReadyTitle')}
          body={t('academy.certificate.examReadyBody', {
            count: exam.questionCount,
            pass: exam.passScorePercent,
            title: certificate.title,
          })}
        />
      );
    }

    if (status === 'learning' && exam.hasExam && progressPercent < 100) {
      return (
        <NoticeBox
          variant="warn"
          title={t('academy.certificate.learningInProgressTitle')}
          body={t('academy.certificate.learningInProgressBody')}
        />
      );
    }

    if (status === 'not_started' && exam.hasExam) {
      return (
        <NoticeBox
          variant="warn"
          title={t('academy.certificate.examRequiredTitle')}
          body={t('academy.certificate.examRequiredBody', {
            count: exam.questionCount,
            pass: exam.passScorePercent,
            title: certificate.title,
          })}
        />
      );
    }

    return null;
  }

  return (
    <>
      <section className="hero cert-detail-hero">
        <div className="container hero__grid">
          <div>
            {companyName ? <p className="cert-hero-provider">{companyName}</p> : null}
            <h1>{certificate.title}</h1>
            <p className="hero__lead">{certificate.summary}</p>
            {renderHeroActions()}
            {renderProgressBlock()}
            {renderNotice()}
            <p className="cert-card__meta cert-card__meta--icons">
              <span className="cert-card__meta-item">
                <LearnersIcon />
                {certificate.studentCount.toLocaleString()} {t('academy.home.enrolled')}
              </span>
            </p>
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
                  {courseRows.map((course) => {
                    const isOpen = Boolean(expanded[course.slug]);
                    const staticCourse = certificate.courses.find((item) => item.slug === course.slug);
                    return (
                      <div
                        key={course.certificateCourseId}
                        className={`course-item${isOpen ? ' is-expanded' : ''}${course.isComplete ? ' is-complete' : ''}`}
                      >
                        <div className="course-item__header">
                          {staticCourse?.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={staticCourse.coverImage} alt="" className="course-item__thumb" />
                          ) : (
                            <div className="course-item__thumb" />
                          )}
                          <div className="course-item__info">
                            <Link href={course.href} className="course-item__title" target="_blank" rel="noopener noreferrer">
                              {course.title}
                            </Link>
                            <div className="course-item__meta">
                              {t('academy.certificate.courseRowMeta', {
                                index: course.courseIndex,
                                count: course.units.length,
                              })}
                              {course.isComplete ? (
                                <span className="course-item__badge">{t('academy.certificate.courseCompleted')}</span>
                              ) : null}
                            </div>
                          </div>
                          <button type="button" className="course-item__toggle" onClick={() => toggleCourse(course.slug)} aria-expanded={isOpen}>
                            <svg className="course-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>
                        {isOpen ? (
                          <div className="course-item__body">
                            {staticCourse?.summary ? <p>{staticCourse.summary}</p> : null}
                            <div className="module-list">
                              {course.units.map((unit, unitIndex) => (
                                <div key={unit.id}>
                                  <div className="module-row">
                                    <CoursesIcon />
                                    <span>{unitIndex + 1}. {unit.title}</span>
                                  </div>
                                  {unit.lessons.length ? (
                                    <div className="lesson-complete-list">
                                      {unit.lessons.map((lesson) => (
                                        <div
                                          key={lesson.id}
                                          className={`lesson-complete-row${lesson.isComplete ? ' is-complete' : ''}`}
                                        >
                                          <span className="lesson-complete-row__icon" aria-hidden="true">
                                            {lesson.isComplete ? '✓' : '·'}
                                          </span>
                                          <span>{lesson.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
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
                {companyName ? <div className="instructor-name">{companyName}</div> : null}
                {positioning ? <div className="instructor-org">{positioning}</div> : null}
              </div>
            </div>
            <p className="instructor-stats instructor-stats--icons">
              <span className="cert-card__meta-item">
                <CoursesIcon />
                {t('academy.certificate.instructorCourses', { count: certificate.courses.length })}
              </span>
              <span className="cert-card__meta-dot" aria-hidden>·</span>
              <span className="cert-card__meta-item">
                <LearnersIcon />
                {t('academy.certificate.instructorStudents', { count: certificate.studentCount.toLocaleString() })}
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
