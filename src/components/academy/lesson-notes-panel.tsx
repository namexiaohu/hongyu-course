'use client';

import { useEffect, useState, type RefObject } from 'react';

import {
  createLessonNote,
  deleteLessonNote,
  listLessonNotes,
  type LessonNote,
} from '@/lib/academy-lesson-notes-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  lessonId: string;
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

function formatVideoPosition(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatNoteCreatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${day} ${h}:${mi}`;
}

export function LessonNotesPanel({ lessonId, enabled, videoRef }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDraft('');
    setPendingDeleteId(null);
    if (!enabled || !lessonId) {
      setNotes([]);
      return;
    }

    let cancelled = false;
    void listLessonNotes(lessonId)
      .then((res) => {
        if (!cancelled) setNotes(Array.isArray(res.items) ? res.items : []);
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, lessonId]);

  async function handleSave() {
    const content = draft.trim();
    if (!content || saving || !enabled) return;
    const videoPositionSeconds = Math.max(0, Math.floor(videoRef.current?.currentTime ?? 0));
    setSaving(true);
    try {
      const created = await createLessonNote(lessonId, { content, videoPositionSeconds });
      setNotes((current) => [created, ...current]);
      setDraft('');
    } catch {
      // Keep draft so the user can retry.
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteLessonNote(pendingDeleteId);
      setNotes((current) => current.filter((note) => note.id !== pendingDeleteId));
      setPendingDeleteId(null);
    } catch {
      // Keep the note visible on failure.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="right-tab-content">
      <textarea
        className="note-input"
        placeholder={t('academy.learn.notePlaceholder')}
        value={draft}
        disabled={!enabled}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button
        type="button"
        className="note-save-btn"
        disabled={!enabled || saving || !draft.trim()}
        onClick={() => void handleSave()}
      >
        {t('academy.learn.saveNote')}
      </button>

      <div className="note-section-title">{t('academy.learn.savedNotes', { count: notes.length })}</div>

      {notes.length === 0 ? (
        <div className="note-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>{t('academy.learn.noteEmpty')}</p>
        </div>
      ) : (
        <div className="note-list">
          {notes.map((note) => (
            <div key={note.id} className="note-record">
              <div className="note-record-header">
                <span className="note-record-time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatVideoPosition(note.videoPositionSeconds)} · {formatNoteCreatedAt(note.createdAt)}
                </span>
                <div className="note-record-actions">
                  <button
                    type="button"
                    className="note-record-btn delete"
                    title={t('academy.learn.noteDelete')}
                    onClick={() => setPendingDeleteId(note.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="note-record-text">{note.content}</div>
              {pendingDeleteId === note.id ? (
                <div className="note-confirm">
                  <p>{t('academy.learn.noteDeleteConfirm')}</p>
                  <div className="note-confirm-actions">
                    <button
                      type="button"
                      className="note-confirm-cancel"
                      disabled={deleting}
                      onClick={() => setPendingDeleteId(null)}
                    >
                      {t('academy.learn.noteDeleteCancel')}
                    </button>
                    <button
                      type="button"
                      className="note-confirm-ok"
                      disabled={deleting}
                      onClick={() => void handleConfirmDelete()}
                    >
                      {t('academy.learn.noteDeleteOk')}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
