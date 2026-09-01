'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { PageLoading } from '@/components/ui/page-loading';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { academyCertificateExamPath, academyCertificateExamResultPath } from '@/lib/academy-certificate-course';
import type { ExamResultResponse } from '@/lib/storefront-academy-exams-api';
import { getCertificateExamResult } from '@/lib/storefront-academy-exams-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  certificateSlug: string;
  attemptId: string;
  source: 'submit' | 'review';
};

type Filter = 'all' | 'correct' | 'wrong';

function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function formatAnswer(
  content: Record<string, unknown>,
  type: string,
  answer: unknown,
  t: (key: string) => string,
): string {
  if (answer === null || answer === undefined) return t('common.emptyDash');
  if (type === 'single_choice') {
    const options = (content as { options?: string[] }).options ?? [];
    return typeof answer === 'number' ? (options[answer] ?? String(answer)) : String(answer);
  }
  if (type === 'multiple_choice') {
    const options = (content as { options?: string[] }).options ?? [];
    if (!Array.isArray(answer)) return String(answer);
    return answer.map((index) => options[Number(index)] ?? index).join(', ');
  }
  if (type === 'true_false') {
    return answer === true
      ? t('academy.exam.trueLabel')
      : answer === false
        ? t('academy.exam.falseLabel')
        : String(answer);
  }
  return String(answer);
}

function formatCorrectAnswer(
  content: Record<string, unknown>,
  type: string,
  t: (key: string) => string,
): string {
  if (type === 'single_choice') {
    const c = content as { options: string[]; correctAnswerIndex: number };
    const index = c.correctAnswerIndex;
    const text = c.options[index] ?? '';
    return `${optionLetter(index)}. ${text}`;
  }
  if (type === 'multiple_choice') {
    const c = content as { options: string[]; correctAnswerIndexes: number[] };
    return (c.correctAnswerIndexes ?? [])
      .map((index) => {
        const text = c.options[index] ?? '';
        return `${optionLetter(index)}. ${text}`;
      })
      .join('、');
  }
  if (type === 'true_false') {
    const c = content as { correctAnswer: boolean };
    return c.correctAnswer ? t('academy.exam.trueLabel') : t('academy.exam.falseLabel');
  }
  const c = content as { correctAnswer: string };
  return c.correctAnswer;
}

function ChoiceReviewOptions({
  content,
  questionType,
  userAnswer,
}: {
  content: Record<string, unknown>;
  questionType: 'single_choice' | 'multiple_choice';
  userAnswer: unknown;
}) {
  const options = (content as { options?: string[] }).options ?? [];
  const correctIndexes = new Set(
    questionType === 'single_choice'
      ? [Number((content as { correctAnswerIndex?: number }).correctAnswerIndex)]
      : ((content as { correctAnswerIndexes?: number[] }).correctAnswerIndexes ?? []).map(Number),
  );
  const selected = new Set<number>(
    questionType === 'single_choice'
      ? (typeof userAnswer === 'number' && Number.isFinite(userAnswer)
          ? [userAnswer]
          : typeof userAnswer === 'string' && userAnswer.trim() !== '' && Number.isFinite(Number(userAnswer))
            ? [Number(userAnswer)]
            : [])
      : Array.isArray(userAnswer)
        ? userAnswer.map(Number).filter((index) => Number.isFinite(index))
        : [],
  );

  return (
    <div className="review-options-list">
      {options.map((text, index) => {
        const isSelected = selected.has(index);
        const isCorrectOpt = correctIndexes.has(index);
        let className = 'review-option-row';
        if (isSelected && isCorrectOpt) className += ' user-correct';
        else if (isSelected && !isCorrectOpt) className += ' user-wrong';
        else className += ' opt-dimmed';

        return (
          <div key={index} className={className}>
            <span className="opt-label">{optionLetter(index)}</span>
            <span className="opt-text">{text}</span>
          </div>
        );
      })}
    </div>
  );
}

function questionPrompt(content: Record<string, unknown>, type: string) {
  if (type === 'fill_blank') {
    const c = content as { promptBefore: string; promptAfter: string };
    return `${c.promptBefore} ___ ${c.promptAfter}`;
  }
  return (content as { prompt?: string }).prompt ?? '';
}

function questionTypeLabel(type: string, t: (key: string) => string) {
  switch (type) {
    case 'single_choice':
      return t('academy.exam.singleChoice');
    case 'multiple_choice':
      return t('academy.exam.multipleChoice');
    case 'true_false':
      return t('academy.exam.trueFalse');
    case 'fill_blank':
      return t('academy.exam.fillBlank');
    default:
      return type;
  }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ExamResultView({ certificateSlug, attemptId, source }: Props) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const certificateHref = `/certificates/${certificateSlug}`;
  const examHref = academyCertificateExamPath(certificateSlug);
  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!attemptId || !certificateSlug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    void getCertificateExamResult(attemptId, certificateSlug)
      .then(setResult)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [attemptId, certificateSlug, authLoading, isAuthenticated]);

  const filteredReview = useMemo(() => {
    if (!result) return [];
    if (filter === 'correct') return result.review.filter((item) => item.isCorrect);
    if (filter === 'wrong') return result.review.filter((item) => !item.isCorrect);
    return result.review;
  }, [filter, result]);

  if (authLoading || loading) {
    return <PageLoading label={t('academy.result.loading')} />;
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

  if (notFound || !result) {
    return (
      <div className="exam-gate">
        <p>{t('academy.result.notFound')}</p>
        <Link href={certificateHref} className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          {t('academy.result.backToCertificate')}
        </Link>
      </div>
    );
  }

  const passed = result.passed;
  const showGetCertificate = source === 'submit' && passed && !!result.certificateNumber;

  return (
    <div className="result-page">
      <div className={`result-banner ${passed ? 'is-pass' : 'is-fail'}`}>
        <div className={`result-icon ${passed ? 'pass' : 'fail'}`} aria-hidden>
          {passed ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          )}
        </div>
        <h1 className={passed ? 'pass' : 'fail'}>{passed ? t('academy.result.passed') : t('academy.result.failed')}</h1>
        <p className="result-subtitle">{passed ? t('academy.result.passedSubtitle') : t('academy.result.failedSubtitle')}</p>
        <div className={`result-score ${passed ? 'pass' : 'fail'}`}>{result.scorePercent}%</div>
        <p className="result-pass-info">
          {t('academy.result.passLine')}: <strong>{result.passScorePercent}%</strong>
        </p>
      </div>

      <div className="score-details">
        <div className="score-card">
          <div className="value">{result.score}</div>
          <div className="label">{t('academy.result.score')}</div>
        </div>
        <div className="score-card">
          <div className="value">{result.correctCount}/{result.totalQuestions}</div>
          <div className="label">{t('academy.result.correct')}</div>
        </div>
        <div className="score-card">
          <div className="value">{result.totalQuestions}</div>
          <div className="label">{t('academy.result.questions')}</div>
        </div>
        <div className="score-card">
          <div className="value">{formatDuration(result.durationSeconds)}</div>
          <div className="label">{t('academy.result.duration')}</div>
        </div>
      </div>

      <section className="review-section">
        <div className="review-title">
          <span>{t('academy.result.review')}</span>
          <div className="review-filter">
            {(['all', 'correct', 'wrong'] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`filter-btn${filter === key ? ' active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {key === 'all'
                  ? t('academy.result.filterAll')
                  : key === 'correct'
                    ? t('academy.result.filterCorrect')
                    : t('academy.result.filterWrong')}
              </button>
            ))}
          </div>
        </div>

        <div className="result-review">
          {filteredReview.map((item) => {
            const open = !!expanded[item.id];
            return (
              <div key={item.id} className={`review-item${open ? ' expanded' : ''}`}>
                <button
                  type="button"
                  className="review-item-header"
                  onClick={() => setExpanded((current) => ({ ...current, [item.id]: !current[item.id] }))}
                >
                  <span className={`review-status ${item.isCorrect ? 'correct' : 'wrong'}`}>
                    {item.isCorrect ? '✓' : '✕'}
                  </span>
                  <span className="review-q-num">{item.index}.</span>
                  <span className="review-q-type">{questionTypeLabel(item.questionType, t)}</span>
                  <span className="review-q-text">{questionPrompt(item.content, item.questionType)}</span>
                  <svg
                    className="review-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open ? (
                  <div className="review-item-body">
                    <p className="question-full">{questionPrompt(item.content, item.questionType)}</p>
                    {item.questionType === 'single_choice' || item.questionType === 'multiple_choice' ? (
                      <>
                        <ChoiceReviewOptions
                          content={item.content}
                          questionType={item.questionType}
                          userAnswer={item.userAnswer}
                        />
                        {!item.isCorrect ? (
                          <div className="review-answer">
                            <div className="review-answer-row correct-answer">
                              <span className="review-answer-label correct">
                                {t('academy.result.correctAnswer')}
                              </span>
                              <span className="review-answer-text">
                                {formatCorrectAnswer(item.content, item.questionType, t)}
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="review-answer">
                        <div className={`review-answer-row ${item.isCorrect ? 'user-correct' : 'user-wrong'}`}>
                          <span className={`review-answer-label ${item.isCorrect ? 'correct' : 'user'}`}>
                            {t('academy.result.yourAnswer')}
                          </span>
                          <span className="review-answer-text">
                            {formatAnswer(item.content, item.questionType, item.userAnswer, t)}
                          </span>
                        </div>
                        {!item.isCorrect ? (
                          <div className="review-answer-row correct-answer">
                            <span className="review-answer-label correct">{t('academy.result.correctAnswer')}</span>
                            <span className="review-answer-text">
                              {formatCorrectAnswer(item.content, item.questionType, t)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="result-actions">
        {showGetCertificate ? (
          <a
            href={`/cert/${encodeURIComponent(result.certificateNumber!)}`}
            className="btn-primary success"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('academy.result.getCertificate')}
          </a>
        ) : null}
        {!passed && result.canRetake ? (
          <Link href={examHref} className="btn-primary" target="_blank" rel="noopener noreferrer">
            {t('academy.result.retry')}
          </Link>
        ) : null}
        <Link href={certificateHref} className="btn-secondary">{t('academy.result.backToCertificate')}</Link>
      </div>
    </div>
  );
}
