'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { LessonNotesPanel } from '@/components/academy/lesson-notes-panel';
import { InlineLoading } from '@/components/ui/inline-loading';
import { LearnContentSkeleton, LearnSidebarSkeleton } from '@/components/ui/learn-skeleton';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { academyCourseDetailPath } from '@/lib/academy-certificate-course';
import { getCourseWatchProgress, touchCourseProgress } from '@/lib/academy-home-api';
import { getCourseLessonProgress, markCourseLessonCompleted } from '@/lib/academy-progress-api';
import { formatFileSize } from '@/lib/format-file-size';
import { formatLessonDuration } from '@/lib/format-lesson-duration';
import type {
  StorefrontAcademyCourseDetail,
  StorefrontAcademyLessonItem,
  StorefrontAcademyUnitItem,
} from '@/lib/storefront-academy-courses-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  course: StorefrontAcademyCourseDetail;
  certificateCourseId: string;
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

export function CourseLearningView({ course, certificateCourseId }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const courseHref = academyCourseDetailPath(course.slug, certificateCourseId);
  const certificateLink = useMemo(
    () => course.certificateLinks?.find((item) => item.certificateCourseId === certificateCourseId) ?? null,
    [course.certificateLinks, certificateCourseId],
  );
  const units = course.units ?? [];
  const flat = useMemo(() => flattenLessons(units), [units]);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [playing, setPlaying] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [rightTab, setRightTab] = useState<'notes' | 'files'>('notes');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [progressReady, setProgressReady] = useState(false);
  const [lessonContentReady, setLessonContentReady] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const unit of units) initial[unit.id] = true;
    return initial;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const seekToRef = useRef<number | null>(null);
  const activeRef = useRef<(typeof flat)[number] | null>(null);
  const authenticatedRef = useRef(isAuthenticated);
  const videoStartedRef = useRef(false);
  const isRestoringProgressRef = useRef(false);
  const activeLessonIdRef = useRef(activeLessonId);

  const active = activeLessonId
    ? flat.find((item) => item.lesson.id === activeLessonId) ?? null
    : null;
  activeRef.current = active;
  authenticatedRef.current = isAuthenticated;
  activeLessonIdRef.current = activeLessonId;
  const accessBlocked = authLoading || !isAuthenticated;
  const showLessonSkeleton = !active || (isAuthenticated && (!progressReady || !lessonContentReady));

  function persistWatchProgress() {
    if (!authenticatedRef.current || isRestoringProgressRef.current) return;
    const current = activeRef.current;
    if (!current) return;
    const seconds = Math.max(0, Math.floor(videoRef.current?.currentTime ?? 0));
    void touchCourseProgress(certificateCourseId, {
      unitId: current.unit.id,
      lessonId: current.lesson.id,
      positionSeconds: seconds,
    }).catch(() => undefined);
  }

  function applySeek() {
    const video = videoRef.current;
    const seek = seekToRef.current;
    if (!video || seek == null) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    seekToRef.current = null;
    video.currentTime = Math.min(Math.max(0, seek), Math.max(0, duration - 0.05));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCompletedIds(new Set());
      if (flat[0]) setActiveLessonId(flat[0].lesson.id);
      setProgressReady(true);
      setLessonContentReady(true);
      return;
    }

    setProgressReady(false);
    setLessonContentReady(false);
    setActiveLessonId('');
    let cancelled = false;

    void Promise.all([
      getCourseLessonProgress(course.slug),
      getCourseWatchProgress(certificateCourseId),
    ])
      .then(async ([progress, payload]) => {
        if (cancelled) return;
        setCompletedIds(new Set(progress.completedLessonIds ?? []));
        const watch = payload.watch;

        if (!watch?.lessonId || !watch?.unitId) {
          const first = flat[0];
          if (first) {
            await touchCourseProgress(certificateCourseId, {
              unitId: first.unit.id,
              lessonId: first.lesson.id,
              positionSeconds: 0,
            }).catch(() => undefined);
            seekToRef.current = null;
            setActiveLessonId(first.lesson.id);
          }
          return;
        }

        const exists = flat.some((item) => item.lesson.id === watch.lessonId && item.unit.id === watch.unitId);
        if (!exists) {
          const first = flat[0];
          if (first) {
            seekToRef.current = null;
            setActiveLessonId(first.lesson.id);
          }
          return;
        }

        isRestoringProgressRef.current = true;
        seekToRef.current = watch.positionSeconds;
        setActiveLessonId(watch.lessonId);
      })
      .catch(() => {
        if (!cancelled) {
          setCompletedIds(new Set());
          const first = flat[0];
          if (first) {
            seekToRef.current = null;
            setActiveLessonId(first.lesson.id);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setProgressReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, certificateCourseId, course.slug, flat, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !progressReady || accessBlocked) return;
    const timer = window.setInterval(() => {
      persistWatchProgress();
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, progressReady, accessBlocked, certificateCourseId, activeLessonId]);

  useEffect(() => {
    if (!progressReady || !activeLessonId || lessonContentReady) return;
    const item = flat.find((entry) => entry.lesson.id === activeLessonId);
    if (!item || item.lesson.videoUrl) return;
    isRestoringProgressRef.current = false;
    setLessonContentReady(true);
  }, [progressReady, activeLessonId, flat, lessonContentReady]);

  useEffect(() => {
    if (!progressReady || !activeLessonId || lessonContentReady) return;
    const video = videoRef.current;
    if (!video || video.readyState < 1) return;
    handleLoadedMetadata();
  }, [progressReady, activeLessonId, lessonContentReady, active?.lesson.id]);

  useEffect(() => {
    setPlaying(false);
    setVideoStarted(false);
    videoStartedRef.current = false;
    setRightTab('notes');
    if (seekToRef.current != null) {
      isRestoringProgressRef.current = true;
      return;
    }
    isRestoringProgressRef.current = false;
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
    if (lessonId === activeLessonIdRef.current) return;
    seekToRef.current = null;
    const target = flat.find((item) => item.lesson.id === lessonId);
    if (target && authenticatedRef.current) {
      void touchCourseProgress(certificateCourseId, {
        unitId: target.unit.id,
        lessonId: target.lesson.id,
        positionSeconds: 0,
      }).catch(() => undefined);
    }
    setActiveLessonId(lessonId);
  }

  function handleLoadedMetadata() {
    applySeek();
    isRestoringProgressRef.current = false;
    setLessonContentReady(true);
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
      videoStartedRef.current = true;
      setVideoStarted(true);
      setPlaying(true);
    }).catch(() => setPlaying(false));
  }

  function isUnitCompleted(unit: StorefrontAcademyUnitItem) {
    if (!unit.lessons.length) return false;
    return unit.lessons.every((lesson) => completedIds.has(lesson.id));
  }

  if (!flat.length) {
    return (
      <div className="container" style={{ padding: '48px 24px' }}>
        <h1>{course.title}</h1>
        <p>{t('academy.learn.noLessons')}</p>
        <Link href={courseHref} className="btn-secondary">{t('academy.learn.backToCourse')}</Link>
      </div>
    );
  }

  const materials = active?.lesson.materials ?? [];

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
            {certificateLink?.certificateTitle ? (
              <Link href={certificateLink.href} title={certificateLink.certificateTitle}>
                {certificateLink.certificateTitle}
              </Link>
            ) : null}
          </div>
          <Link href={courseHref} className="sidebar-left-title" title={course.title}>
            {course.title}
          </Link>
        </div>

        <nav className="units-nav">
          {isAuthenticated && !progressReady ? (
            <InlineLoading label={t('academy.home.loading')} className="inline-loading--nav" />
          ) : (
          units.map((unit, unitIndex) => {
            const unitActive = active?.unit.id === unit.id;
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
                    <span className="unit-header__index">{t('academy.learn.unitLabel', { index: unitIndex + 1 })}</span>
                    <span className="unit-header__title">{unit.title}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {unitOpen ? (
                  <div className="unit-lessons">
                    {unit.lessons.map((lesson) => {
                      const lessonActive = lesson.id === active?.lesson.id;
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
                          <span className="lesson-nav-type">{formatLessonDuration(lesson.durationSeconds, t)}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
          )}
        </nav>
      </aside>

      <main className="learning-main">
        {showLessonSkeleton ? <LearnContentSkeleton /> : null}
        {active ? (
          <div className={`learn-content-panel${showLessonSkeleton ? ' learn-content-panel--preload' : ''}`}>
            <div className={`video-player${playing ? ' is-playing' : ''}`}>
              {active.lesson.videoUrl ? (
                <video
                  key={active.lesson.id}
                  ref={videoRef}
                  className="video-player__media"
                  src={active.lesson.videoUrl}
                  controls={videoStarted && !showLessonSkeleton}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={() => {
                    isRestoringProgressRef.current = false;
                    setLessonContentReady(true);
                  }}
                  onPlay={() => {
                    videoStartedRef.current = true;
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
                <div className="video-player__empty">{t('academy.learn.noVideo')}</div>
              )}
              {!videoStarted && active.lesson.videoUrl && !showLessonSkeleton ? (
                <button type="button" className="video-player__play" onClick={handlePlayClick} aria-label={t('academy.learn.playVideo')}>
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
          </div>
        ) : null}
      </main>

      <aside className="sidebar-right">
        <div className="right-tabs">
          <button
            type="button"
            className={`right-tab${rightTab === 'notes' ? ' is-active' : ''}`}
            onClick={() => setRightTab('notes')}
            disabled={showLessonSkeleton}
          >
            {t('academy.learn.notesTab')}
          </button>
          <button
            type="button"
            className={`right-tab${rightTab === 'files' ? ' is-active' : ''}`}
            onClick={() => setRightTab('files')}
            disabled={showLessonSkeleton}
          >
            {t('academy.learn.filesTabCount', { count: materials.length })}
          </button>
        </div>

        <div className="sidebar-right__body">
        {showLessonSkeleton ? (
          <LearnSidebarSkeleton />
        ) : rightTab === 'notes' && active ? (
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
              <p className="files-empty">{t('academy.learn.noFiles')}</p>
            )}
          </div>
        )}
        </div>
      </aside>
    </div>
  );
}
