'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { PageLoading } from '@/components/ui/page-loading';
import { academyExamResultPath, academyLearnPath } from '@/lib/academy-certificate-course';
import type { ExamQuestionPublic, ExamStartResponse, ExamUserAnswer } from '@/lib/storefront-academy-exams-api';
import { startExam, submitExam } from '@/lib/storefront-academy-exams-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = { slug: string; certificateCourseId: string };

function isAnswered(type: ExamQuestionPublic['questionType'], value: ExamUserAnswer | undefined) {
  if (value === undefined || value === null) return false;
  if (type === 'multiple_choice') return Array.isArray(value) && value.length > 0;
  if (type === 'fill_blank') return typeof value === 'string' && value.trim().length > 0;
  return true;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExamPageView({ slug, certificateCourseId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const learnHref = academyLearnPath(slug, certificateCourseId);

  const [session, setSession] = useState<ExamStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamUserAnswer>>({});
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [pendingLeaveHref, setPendingLeaveHref] = useState<string | null>(null);
  const [leaveAllowed, setLeaveAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [answerRequiredHint, setAnswerRequiredHint] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const allowLeaveRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const questions = session?.questions ?? [];
  const current = questions[currentIndex];
  const shouldGuardLeave = Boolean(session) && !leaveAllowed;
  const showAnswerHint = Boolean(
    answerRequiredHint
    && current
    && !isAnswered(current.questionType, answers[current.id]),
  );

  const stats = useMemo(() => {
    let answered = 0;
    for (const q of questions) {
      if (isAnswered(q.questionType, answers[q.id])) answered += 1;
    }
    return { answered, marked: marked.size, unanswered: questions.length - answered };
  }, [answers, marked.size, questions]);

  const loadExam = useCallback(async () => {
    setLoading(true);
    setErrorCode(null);
    allowLeaveRef.current = false;
    setLeaveAllowed(false);
    setTimedOut(false);
    setAnswerRequiredHint(false);
    try {
      const data = await startExam(slug, certificateCourseId);
      setSession(data);
      setCurrentIndex(0);
      setAnswers({});
      setMarked(new Set());
      if (data.timeLimitMinutes) {
        setSecondsLeft(data.timeLimitMinutes * 60);
      } else {
        setSecondsLeft(null);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('COURSE_INCOMPLETE')) setErrorCode('COURSE_INCOMPLETE');
      else if (msg.includes('RETAKE_LIMIT')) setErrorCode('RETAKE_LIMIT');
      else if (msg.includes('NO_QUESTIONS')) setErrorCode('NO_QUESTIONS');
      else if (msg.includes('NO_EXAM')) setErrorCode('NO_EXAM');
      else setErrorCode('FORBIDDEN');
    } finally {
      setLoading(false);
    }
  }, [slug, certificateCourseId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadExam();
  }, [authLoading, isAuthenticated, loadExam]);

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0 || !session || timedOut) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value == null || value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, session, timedOut]);

  useEffect(() => {
    if (secondsLeft !== 0 || !session || timedOut) return;
    setTimedOut(true);
    setConfirmOpen(false);
    setLeaveConfirmOpen(false);
    setAnswerRequiredHint(false);
    allowLeaveRef.current = true;
    setLeaveAllowed(true);
  }, [secondsLeft, session, timedOut]);

  /** Close / refresh / hard navigation */
  useEffect(() => {
    if (!shouldGuardLeave) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [shouldGuardLeave]);

  /** Browser Back */
  useEffect(() => {
    if (!shouldGuardLeave) return;

    const guardState = { examLeaveGuard: true };
    window.history.pushState(guardState, '');

    const onPopState = () => {
      if (allowLeaveRef.current) return;
      window.history.pushState(guardState, '');
      setPendingLeaveHref(null);
      setLeaveConfirmOpen(true);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [shouldGuardLeave]);

  /** In-app link clicks while exam is active */
  useEffect(() => {
    if (!shouldGuardLeave) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (allowLeaveRef.current) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingLeaveHref(`${url.pathname}${url.search}${url.hash}`);
      setLeaveConfirmOpen(true);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [shouldGuardLeave]);

  function requestLeave(href: string) {
    if (allowLeaveRef.current || !shouldGuardLeave) {
      router.push(href);
      return;
    }
    setPendingLeaveHref(href);
    setLeaveConfirmOpen(true);
  }

  function confirmLeave() {
    const href = pendingLeaveHref ?? learnHref;
    setLeaveConfirmOpen(false);
    setPendingLeaveHref(null);
    allowLeaveRef.current = true;
    setLeaveAllowed(true);
    router.push(href);
  }

  function cancelLeave() {
    setLeaveConfirmOpen(false);
    setPendingLeaveHref(null);
  }

  function findFirstUnansweredIndex(answerMap: Record<string, ExamUserAnswer> = answers) {
    return questions.findIndex((question) => !isAnswered(question.questionType, answerMap[question.id]));
  }

  function focusFirstUnanswered(answerMap?: Record<string, ExamUserAnswer>) {
    const index = findFirstUnansweredIndex(answerMap);
    if (index < 0) return false;
    setConfirmOpen(false);
    setCurrentIndex(index);
    setAnswerRequiredHint(true);
    window.requestAnimationFrame(() => {
      document.querySelector('.question-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return true;
  }

  function requestSubmit() {
    if (!session || submitting || timedOut) return;
    if (focusFirstUnanswered()) return;
    setAnswerRequiredHint(false);
    setConfirmOpen(true);
  }

  function setAnswer(questionId: string, value: ExamUserAnswer) {
    if (timedOut) return;
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: value }));
    setAnswerRequiredHint(false);
  }

  function toggleMark(questionId: string) {
    if (timedOut) return;
    setMarked((currentMarks) => {
      const next = new Set(currentMarks);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  async function handleSubmit(auto = false) {
    if (!session || submitting || timedOut) return;
    if (!auto) {
      if (focusFirstUnanswered()) return;
      setConfirmOpen(false);
    }
    setAnswerRequiredHint(false);
    setSubmitting(true);
    try {
      const payload = answersRef.current;
      await submitExam(session.attemptId, payload);
      allowLeaveRef.current = true;
      setLeaveAllowed(true);
      router.push(academyExamResultPath(slug, certificateCourseId, session.attemptId, 'submit'));
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('TIME_EXPIRED')) {
        setTimedOut(true);
        setConfirmOpen(false);
        allowLeaveRef.current = true;
        setLeaveAllowed(true);
      }
      setSubmitting(false);
    }
  }

  function renderQuestionBody(question: ExamQuestionPublic) {
    const value = answers[question.id];
    const content = question.content;

    if (question.questionType === 'single_choice') {
      const c = content as { prompt: string; options: string[] };
      return (
        <>
          <p className="q-text">{c.prompt}</p>
          <div className="option-list">
            {c.options.map((option, index) => (
              <button
                key={index}
                type="button"
                className={`option-item${value === index ? ' is-selected' : ''}`}
                onClick={() => setAnswer(question.id, index)}
              >
                <span className="option-radio" aria-hidden="true" />
                <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (question.questionType === 'multiple_choice') {
      const c = content as { prompt: string; options: string[] };
      const selected = Array.isArray(value) ? value : [];
      return (
        <>
          <p className="q-text">{c.prompt}</p>
          <div className="option-list">
            {c.options.map((option, index) => {
              const checked = selected.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  className={`option-item${checked ? ' is-selected' : ''}`}
                  onClick={() => {
                    const next = checked ? selected.filter((item) => item !== index) : [...selected, index].sort((a, b) => a - b);
                    setAnswer(question.id, next);
                  }}
                >
                  <span className="option-check" aria-hidden="true">{checked ? '✓' : ''}</span>
                  <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (question.questionType === 'true_false') {
      const c = content as { prompt: string };
      return (
        <>
          <p className="q-text">{c.prompt}</p>
          <div className="tf-options">
            <button type="button" className={`tf-btn${value === true ? ' is-true' : ''}`} onClick={() => setAnswer(question.id, true)}>
              <svg className="tf-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('academy.exam.trueLabel')}
            </button>
            <button type="button" className={`tf-btn${value === false ? ' is-false' : ''}`} onClick={() => setAnswer(question.id, false)}>
              <svg className="tf-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t('academy.exam.falseLabel')}
            </button>
          </div>
        </>
      );
    }

    const c = content as { promptBefore: string; promptAfter: string };
    return (
      <>
        <p className="fill-prompt">{c.promptBefore} ___ {c.promptAfter}</p>
        <input
          className="fill-input"
          type="text"
          value={typeof value === 'string' ? value : ''}
          placeholder={t('academy.exam.fillPlaceholder')}
          onChange={(event) => setAnswer(question.id, event.target.value)}
        />
      </>
    );
  }

  function typeLabel(type: ExamQuestionPublic['questionType']) {
    switch (type) {
      case 'single_choice': return t('academy.exam.singleChoice');
      case 'multiple_choice': return t('academy.exam.multipleChoice');
      case 'true_false': return t('academy.exam.trueFalse');
      case 'fill_blank': return t('academy.exam.fillBlank');
      default: return type;
    }
  }

  if (authLoading || loading) {
    return <PageLoading label={t('academy.exam.starting')} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="exam-gate">
        <p>{t('academy.exam.gateLogin')}</p>
        <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={() => openAuthModal('login')}>
          {t('academy.auth.login')}
        </button>
      </div>
    );
  }

  if (errorCode || !session) {
    const message = errorCode === 'COURSE_INCOMPLETE' ? t('academy.exam.gateIncomplete')
      : errorCode === 'NO_EXAM' || errorCode === 'NO_QUESTIONS' ? t('academy.exam.gateNoExam')
        : errorCode === 'RETAKE_LIMIT' ? t('academy.exam.gateRetake')
          : t('academy.exam.gateNoExam');
    return (
      <div className="exam-gate">
        <p>{message}</p>
        <Link href={learnHref} className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          {t('academy.result.backToLearn')}
        </Link>
      </div>
    );
  }

  return (
    <div className={`exam-page${timedOut ? ' is-timed-out' : ''}`}>
      <div className="exam-topbar" aria-hidden={timedOut}>
        <div className="exam-topbar-left">
          <Link
            href={learnHref}
            className="exam-topbar-brand"
            onClick={(event) => {
              if (!shouldGuardLeave) return;
              event.preventDefault();
              requestLeave(learnHref);
            }}
          >
            {t('academy.certificate.academyName')}
          </Link>
          <div className="exam-topbar-divider" />
          <span className="exam-topbar-exam">{session.title}</span>
        </div>
        <div className="exam-topbar-center">
          {secondsLeft != null ? (
            <div className={`exam-timer${secondsLeft <= 300 || timedOut ? ' is-urgent' : ''}`}>
              <span>{formatTimer(Math.max(0, secondsLeft))}</span>
            </div>
          ) : null}
          <div className="exam-stats">
            <span><span className="dot dot-done" /> {t('academy.exam.answered')} {stats.answered}</span>
            <span><span className="dot dot-current" /> {t('academy.exam.current')} {currentIndex + 1}</span>
            <span><span className="dot dot-marked" /> {t('academy.exam.marked')} {stats.marked}</span>
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={requestSubmit} disabled={submitting || timedOut}>
          {t('academy.exam.submitPaper')}
        </button>
      </div>

      <div className="exam-layout-grid" aria-hidden={timedOut}>
        <aside className="question-grid-panel">
          <div className="question-grid-card">
            <h4>{t('academy.exam.questionNav')}</h4>
            <div className="question-grid">
              {questions.map((question, index) => {
                const done = isAnswered(question.questionType, answers[question.id]);
                const isCurrent = index === currentIndex;
                const isMarked = marked.has(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`q-num${isCurrent ? ' is-current' : ''}${done ? ' is-done' : ''}${isMarked ? ' is-marked' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            {current ? (
              <button
                type="button"
                className={`btn-mark${marked.has(current.id) ? ' is-active' : ''}`}
                onClick={() => toggleMark(current.id)}
              >
                {marked.has(current.id) ? t('academy.exam.unmarkQuestion') : t('academy.exam.markQuestion')}
              </button>
            ) : null}
          </div>
        </aside>

        <div className="question-area">
          {current ? (
            <div className={`question-card${showAnswerHint ? ' needs-answer' : ''}`}>
              {showAnswerHint ? (
                <div className="answer-required-hint" role="alert">
                  {t('academy.exam.answerRequired')}
                </div>
              ) : null}
              <div className="q-header">
                <span className="q-number">{current.index}</span>
                <span className="q-type">{typeLabel(current.questionType)}</span>
                <span className="q-score">{t('academy.exam.points', { score: String(current.score) })}</span>
              </div>
              {renderQuestionBody(current)}
              <div className="q-nav">
                <button type="button" className="btn-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
                  {t('academy.exam.prev')}
                </button>
                <button type="button" className="btn-secondary" disabled={currentIndex >= questions.length - 1} onClick={() => setCurrentIndex((i) => i + 1)}>
                  {t('academy.exam.next')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {confirmOpen && !timedOut ? (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal">
            <h3>{t('academy.exam.confirmTitle')}</h3>
            <div className="exam-modal-stats">
              <div className="exam-modal-stat"><div className="num">{stats.answered}</div><div className="label">{t('academy.exam.confirmAnswered')}</div></div>
              <div className="exam-modal-stat"><div className="num">{stats.unanswered}</div><div className="label">{t('academy.exam.confirmUnanswered')}</div></div>
              <div className="exam-modal-stat"><div className="num">{stats.marked}</div><div className="label">{t('academy.exam.confirmMarked')}</div></div>
            </div>
            <div className="exam-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>{t('academy.exam.confirmCancel')}</button>
              <button type="button" className="btn-primary" onClick={() => void handleSubmit()} disabled={submitting || timedOut}>{t('academy.exam.confirmSubmit')}</button>
            </div>
          </div>
        </div>
      ) : null}

      {leaveConfirmOpen && !timedOut ? (
        <div className="exam-modal-overlay" role="dialog" aria-modal="true">
          <div className="exam-modal">
            <h3>{t('academy.exam.leaveTitle')}</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--fg-2)', fontSize: 14, lineHeight: 1.5 }}>
              {t('academy.exam.leaveBody')}
            </p>
            <div className="exam-modal-actions">
              <button type="button" className="btn-secondary" onClick={cancelLeave}>{t('academy.exam.leaveStay')}</button>
              <button type="button" className="btn-primary" onClick={confirmLeave}>{t('academy.exam.leaveConfirm')}</button>
            </div>
          </div>
        </div>
      ) : null}

      {timedOut ? (
        <div className="exam-timeout-overlay" role="alertdialog" aria-modal="true" aria-labelledby="exam-timeout-title">
          <div className="exam-timeout-card">
            <div className="exam-timeout-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 id="exam-timeout-title">{t('academy.exam.timeUp')}</h2>
            <p>{t('academy.exam.timeUpBody')}</p>
            <Link href={learnHref} className="btn-primary exam-timeout-card__cta">
              {t('academy.result.backToLearn')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
