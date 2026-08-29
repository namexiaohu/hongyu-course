'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import type {
  StorefrontAcademyCourseDetail,
  StorefrontAcademyLessonItem,
  StorefrontAcademyUnitItem,
} from '@/lib/storefront-academy-courses-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  course: StorefrontAcademyCourseDetail;
};

const COMPLETED_STORAGE_PREFIX = 'hongyu-academy-lesson-completed:';

function flattenLessons(units: StorefrontAcademyUnitItem[]) {
  const items: Array<{ unit: StorefrontAcademyUnitItem; lesson: StorefrontAcademyLessonItem }> = [];
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      items.push({ unit, lesson });
    }
  }
  return items;
}

function readCompleted(courseSlug: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(`${COMPLETED_STORAGE_PREFIX}${courseSlug}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeCompleted(courseSlug: string, ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${COMPLETED_STORAGE_PREFIX}${courseSlug}`, JSON.stringify([...ids]));
}

function formatFileSize(bytes: number | null | undefined, fallback = '') {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return fallback;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CourseLearningView({ course }: Props) {
  const { t } = useTranslation();
  const units = course.units ?? [];
  const flat = useMemo(() => flattenLessons(units), [units]);
  const [activeLessonId, setActiveLessonId] = useState(flat[0]?.lesson.id ?? '');
  const [playing, setPlaying] = useState(false);
  const [rightTab, setRightTab] = useState<'notes' | 'files'>('notes');
  const [noteDraft, setNoteDraft] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const unit of units) initial[unit.id] = true;
    return initial;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const active = flat.find((item) => item.lesson.id === activeLessonId) ?? flat[0];

  useEffect(() => {
    setCompletedIds(readCompleted(course.slug));
  }, [course.slug]);

  useEffect(() => {
    setPlaying(false);
    setNoteDraft('');
    setRightTab('notes');
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeLessonId]);

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
      writeCompleted(course.slug, next);
      return next;
    });
  }

  function handlePlayClick() {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
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
    <div className="learning-layout">
      <aside className="sidebar-left">
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
                  <span className={`unit-check${unitDone ? ' is-done' : ''}`} aria-hidden="true" />
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
                          <span className={`lesson-radio${lessonDone ? ' is-done' : ''}`} aria-hidden="true" />
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
      </aside>

      <main className="learning-main">
        <div className={`video-player${playing ? ' is-playing' : ''}`}>
          {active.lesson.videoUrl ? (
            <video
              ref={videoRef}
              className="video-player__media"
              src={active.lesson.videoUrl}
              controls={playing}
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false);
                markCompleted(active.lesson.id);
              }}
            />
          ) : (
            <div className="video-player__empty">No video</div>
          )}
          {!playing && active.lesson.videoUrl ? (
            <button type="button" className="video-player__play" onClick={handlePlayClick} aria-label="Play video">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="lesson-header">
          <h1 className="lesson-header__title" title={active.lesson.title}>{active.lesson.title}</h1>
          <Link href={`/courses/${course.slug}/exam`} className="btn-secondary">{t('academy.exam.submit')}</Link>
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
            Notes
          </button>
          <button
            type="button"
            className={`right-tab${rightTab === 'files' ? ' is-active' : ''}`}
            onClick={() => setRightTab('files')}
          >
            Files
          </button>
        </div>

        {rightTab === 'notes' ? (
          <div className="right-tab-content">
            <textarea
              className="note-input"
              placeholder="Add your study notes here..."
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
            />
            <button
              type="button"
              className="note-save-btn"
              onClick={() => {
                // UI only — API later
              }}
            >
              Save note
            </button>
          </div>
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
