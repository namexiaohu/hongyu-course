'use client';

import Link from 'next/link';
import { useState } from 'react';

import { MOCK_EXAM } from '@/lib/mock/academy-mock';
import { useTranslation } from '@/lib/i18n-context';

type Props = { slug: string };

export function ExamPageView({ slug }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const question = MOCK_EXAM.questions[0];

  return (
    <div className="exam-layout">
      <h1>{MOCK_EXAM.title}</h1>
      <p className="cert-card__meta">{t('academy.exam.passLine')}: {MOCK_EXAM.passScore}% · {MOCK_EXAM.timeLimitMinutes} min</p>
      <div className="exam-question">
        <p><strong>1.</strong> {question.prompt}</p>
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`exam-option${selected === index ? ' is-selected' : ''}`}
            onClick={() => setSelected(index)}
          >
            {option}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" className="btn-secondary">{t('academy.exam.prev')}</button>
        <button type="button" className="btn-secondary">{t('academy.exam.next')}</button>
        <Link href={`/courses/${slug}/exam/result`} className="btn-primary">{t('academy.exam.submit')}</Link>
      </div>
    </div>
  );
}
