'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { LessonNotesPanel } from '@/components/academy/lesson-notes-panel';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { getCourseLessonProgress, markCourseLessonCompleted } from '@/lib/academy-progress-api';
import type {
  StorefrontAcademyCourseDetail,
  StorefrontAcademyLessonItem,
  StorefrontAcademyUnitItem,
} from '@/lib/storefront-academy-courses-api';
import { getExamEligibility } from '@/lib/storefront-academy-exams-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  course: StorefrontAcademyCourseDetail;
};

function flattenLessons(units: StorefrontAcademyUnitItem[]) {
  const items: Array<{ unit: StorefrontAcademyUnitItem; lesson: StorefrontAcademyLessonItem }> = [];
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      items.push({ unit, lesson });
    }
  }
  return items;
}

function formatFileSize(bytes: number | null | undefined, fallback = '') {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return fallback;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CourseLearningView({ course }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const units = course.units ?? [];
  const flat = useMemo(() => flattenLessons(units), [units]);
  const [activeLessonId, setActiveLessonId] = useState(flat[0]?.lesson.id ?? '');
  const [playing, setPlaying] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [rightTab, setRightTab] = useState<'notes' | 'files'>('notes');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const unit of units) initial[unit.id] = true;
    return initial;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const active = flat.find((item) => item.lesson.id === activeLessonId) ?? flat[0];
  const accessBlocked = authLoading || !isAuthenticated;
  const allLessonIds = useMemo(() => flat.map((item) => item.lesson.id), [flat]);
  const isCourseComplete = useMemo(
    () => allLessonIds.length > 0 && allLessonIds.every((id) => completedIds.has(id)),
    [allLessonIds, completedIds],
  );
  const completedLessonCount = useMemo(
    () => allLessonIds.filter((id) => completedIds.has(id)).length,
    [allLessonIds, completedIds],
  );
  const lessonProgressPercent = allLessonIds.length
    ? Math.round((completedLessonCount / allLessonIds.length) * 100)
    : 0;

  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedIds(new Set());
      setCertificateNumber(null);
      return;
    }

    let cancelled = false;
    void getCourseLessonProgress(course.slug)
      .then((progress) => {
        if (cancelled) return;
        setCompletedIds(new Set(progress.completedLessonIds ?? []));
      })
      .catch(() => {
        if (!cancelled) setCompletedIds(new Set());
      });

    void getExamEligibility(course.slug)
      .then((eligibility) => {
        if (cancelled) return;
        setCertificateNumber(eligibility.certificateNumber ?? null);
      })
      .catch(() => {
        if (!cancelled) setCertificateNumber(null);
      });

    return () => {
      cancelled = true;
    };
  }, [course.slug, isAuthenticated]);

  useEffect(() => {
    setPlaying(false);
    setVideoStarted(false);
    setRightTab('notes');
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeLessonId]);

  useEffect(() => {
    if (!accessBlocked) return;
    setPlaying(false);
    setVideoStarted(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [accessBlocked]);

  useEffect(() => {
    if (!active) return;
    setExpandedUnits((current) => ({ ...current, [active.unit.id]: true }));
  }, [active]);

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
  }

  function markCompleted(lessonId: string) {
    setCompletedIds((current) => {
      if (current.has(lessonId)) return current;
      const next = new Set(current);
      next.add(lessonId);
      return next;
    });
    void markCourseLessonCompleted(lessonId).catch(() => {
      setCompletedIds((current) => {
        const next = new Set(current);
        next.delete(lessonId);
        return next;
      });
    });
  }

  function handlePlayClick() {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => {
      setVideoStarted(true);
      setPlaying(true);
    }).catch(() => setPlaying(false));
  }

  function isUnitCompleted(unit: StorefrontAcademyUnitItem) {
    if (!unit.lessons.length) return false;
    return unit.lessons.every((lesson) => completedIds.has(lesson.id));
  }

  if (!active) {
    return (
      <div className="container" style={{ padding: '48px 24px' }}>
        <h1>{course.title}</h1>
        <p>No lessons available yet.</p>
        <Link href={`/courses/${course.slug}`} className="btn-secondary">Back to course</Link>
      </div>
    );
  }

  const materials = active.lesson.materials ?? [];

  return (
    <div className={`learning-layout${accessBlocked ? ' is-gated' : ''}`}>
      {accessBlocked ? (
        <div className="learn-auth-gate" role="dialog" aria-modal="true" aria-labelledby="learn-auth-gate-title">
          <div className="learn-auth-gate__card">
            {authLoading ? (
              <p className="learn-auth-gate__body">{t('academy.learn.checkingAuth')}</p>
            ) : (
              <>
                <h2 id="learn-auth-gate-title" className="learn-auth-gate__title">
                  {t('academy.learn.loginRequiredTitle')}
                </h2>
                <p className="learn-auth-gate__body">{t('academy.learn.loginRequiredBody')}</p>
                <div className="learn-auth-gate__actions">
                  <button type="button" className="btn-primary" onClick={() => openAuthModal('login')}>
                    {t('academy.auth.login')}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => openAuthModal('register')}>
                    {t('academy.auth.register')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <aside className="sidebar-left" aria-hidden={accessBlocked}>
        <div className="sidebar-left-header">
          <div className="sidebar-left-provider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <span>HONGYU Academy</span>
          </div>
          <Link href={`/courses/${course.slug}`} className="sidebar-left-title" title={course.title}>
            {course.title}
          </Link>
          {!certificateNumber ? (
            <div className="learn-exam-badge" aria-label={t('academy.learn.examBadge')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>{t('academy.learn.examBadge')}</span>
            </div>
          ) : null}
        </div>

        <nav className="units-nav">
          {units.map((unit, unitIndex) => {
            const unitActive = active.unit.id === unit.id;
            const unitOpen = expandedUnits[unit.id] !== false;
            const unitDone = isUnitCompleted(unit);
            return (
              <div key={unit.id} className="unit-group">
                <button
                  type="button"
                  className={`unit-header${unitActive ? ' is-active' : ''}${unitOpen ? ' is-expanded' : ''}${unitDone ? ' is-completed' : ''}`}
                  onClick={() => setExpandedUnits((current) => ({ ...current, [unit.id]: !unitOpen }))}
                  title={unit.title}
                >
                  <span className={`unit-check${unitDone ? ' is-done' : ''}`} aria-hidden="true">
                    {unitDone ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="unit-header__label">
                    <span className="unit-header__index">Unit {unitIndex + 1}</span>
                    <span className="unit-header__title">{unit.title}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {unitOpen ? (
                  <div className="unit-lessons">
                    {unit.lessons.map((lesson) => {
                      const lessonActive = lesson.id === active.lesson.id;
                      const lessonDone = completedIds.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          className={`lesson-nav-item${lessonActive ? ' is-active' : ''}${lessonDone ? ' is-completed' : ''}`}
                          onClick={() => selectLesson(lesson.id)}
                          title={lesson.title}
                        >
                          <span className={`lesson-radio${lessonDone ? ' is-done' : ''}`} aria-hidden="true">
                            {lessonDone ? (
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 13l4 4L19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </span>
                          <span className="lesson-nav-title">{lesson.title}</span>
                          <span className="lesson-nav-type">{lesson.durationLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className={`learn-exam-footer${certificateNumber || isCourseComplete ? ' is-ready' : ''}${certificateNumber ? ' is-certified' : ''}`}>
          {certificateNumber ? (
            <div className="learn-exam-compact learn-exam-compact--certified">
              <div className="learn-exam-compact__hero">
                <div className="learn-exam-compact__icon learn-exam-compact__icon--certified" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="6" />
                    <path d="M8.2 13.4L7 22l5-3 5 3-1.2-8.6" />
                  </svg>
                </div>
                <div className="learn-exam-compact__titles">
                  <p className="learn-exam-compact__eyebrow">{t('academy.learn.certObtainedEyebrow')}</p>
                  <p className="learn-exam-compact__title">{t('academy.learn.certObtainedTitle')}</p>
                </div>
              </div>
              <Link
                href={`/cert/${encodeURIComponent(certificateNumber)}`}
                className="learn-exam-compact__cta learn-exam-compact__cta--certified"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('academy.learn.viewCertificate')}
              </Link>
            </div>
          ) : isCourseComplete ? (
            <div className="learn-exam-compact learn-exam-compact--ready">
              <div className="learn-exam-compact__hero">
                <div className="learn-exam-compact__icon learn-exam-compact__icon--ready" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                </div>
                <div className="learn-exam-compact__titles">
                  <p className="learn-exam-compact__eyebrow">{t('academy.learn.examGoalEyebrow')}</p>
                  <p className="learn-exam-compact__title">{t('academy.learn.examReadyTitle')}</p>
                </div>
              </div>
              <Link href={`/courses/${course.slug}/exam`} className="learn-exam-compact__cta" target="_blank" rel="noopener noreferrer">
                {t('academy.learn.enterExam')}
              </Link>
            </div>
          ) : (
            <div className="learn-exam-compact">
              <div className="learn-exam-compact__hero">
                <div className="learn-exam-compact__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                </div>
                <div className="learn-exam-compact__titles">
                  <p className="learn-exam-compact__eyebrow">{t('academy.learn.examGoalEyebrow')}</p>
                  <p className="learn-exam-compact__title">{t('academy.learn.examGoalTitle')}</p>
                </div>
                <span className="learn-exam-compact__count">{completedLessonCount}/{allLessonIds.length}</span>
              </div>
              <div
                className="learn-exam-compact__bar"
                role="progressbar"
                aria-valuenow={lessonProgressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('academy.learn.examProgress', { completed: String(completedLessonCount), total: String(allLessonIds.length) })}
              >
                <span style={{ width: `${lessonProgressPercent}%` }} />
              </div>
              <p className="learn-exam-compact__hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {t('academy.learn.examLocked')}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="learning-main">
        <div className={`video-player${playing ? ' is-playing' : ''}`}>
          {active.lesson.videoUrl ? (
            <video
              ref={videoRef}
              className="video-player__media"
              src={active.lesson.videoUrl}
              controls={videoStarted}
              playsInline
              preload="metadata"
              onPlay={() => {
                setVideoStarted(true);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false);
                markCompleted(active.lesson.id);
              }}
            />
          ) : (
            <div className="video-player__empty">No video</div>
          )}
          {!videoStarted && active.lesson.videoUrl ? (
            <button type="button" className="video-player__play" onClick={handlePlayClick} aria-label="Play video">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="lesson-header">
          <h1 className="lesson-header__title" title={active.lesson.title}>{active.lesson.title}</h1>
        </div>

        {active.lesson.description ? (
          <div className="lesson-desc">
            <p>{active.lesson.description}</p>
          </div>
        ) : null}
      </main>

      <aside className="sidebar-right">
        <div className="right-tabs">
          <button
            type="button"
            className={`right-tab${rightTab === 'notes' ? ' is-active' : ''}`}
            onClick={() => setRightTab('notes')}
          >
            {t('academy.learn.notesTab')}
          </button>
          <button
            type="button"
            className={`right-tab${rightTab === 'files' ? ' is-active' : ''}`}
            onClick={() => setRightTab('files')}
          >
            {t('academy.learn.filesTab')}
          </button>
        </div>

        {rightTab === 'notes' ? (
          <LessonNotesPanel
            lessonId={active.lesson.id}
            enabled={isAuthenticated}
            videoRef={videoRef}
          />
        ) : (
          <div className="right-tab-content">
            {materials.length ? (
              materials.map((file) => (
                <a
                  key={`${file.url}-${file.name}`}
                  className="file-item"
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  title={file.name}
                >
                  <div className="file-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{file.sizeLabel || formatFileSize(file.size)}</div>
                  </div>
                </a>
              ))
            ) : (
              <p className="files-empty">No files for this lesson.</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
