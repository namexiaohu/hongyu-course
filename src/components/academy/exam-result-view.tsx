'use client';

import Link from 'next/link';

import { MOCK_EXAM_RESULT } from '@/lib/mock/academy-mock';
import { useTranslation } from '@/lib/i18n-context';

type Props = { slug: string };

export function ExamResultView({ slug }: Props) {
  const { t } = useTranslation();
  const passed = MOCK_EXAM_RESULT.passed;

  return (
    <div className="container section">
      <div className={`result-banner ${passed ? 'is-pass' : 'is-fail'}`}>
        <h1>{passed ? t('academy.result.passed') : t('academy.result.failed')}</h1>
        <p>Score: {MOCK_EXAM_RESULT.score}% ({MOCK_EXAM_RESULT.correctCount}/{MOCK_EXAM_RESULT.totalQuestions})</p>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        {passed ? (
          <Link href={`/credentials/${slug}`} className="btn-primary">{t('academy.result.getCredential')}</Link>
        ) : (
          <Link href={`/courses/${slug}/exam`} className="btn-primary">Retry exam</Link>
        )}
        <Link href={`/courses/${slug}`} className="btn-secondary">Back to course</Link>
      </div>
    </div>
  );
}
