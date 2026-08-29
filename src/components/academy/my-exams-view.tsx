'use client';

import { useEffect, useMemo, useState } from 'react';

import { PageLoading } from '@/components/ui/page-loading';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useTranslation } from '@/lib/i18n-context';
import type { MyExamRecord } from '@/lib/storefront-academy-records-api';
import { listMyExams } from '@/lib/storefront-academy-records-api';

type Tab = 'all' | 'passed' | 'failed';

function formatSubmittedAt(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 19).replace('T', ' ');
  }
}

export function MyExamsView() {
  const { t, locale } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [items, setItems] = useState<MyExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoadError(false);
    void listMyExams()
      .then((res) => setItems(Array.isArray(res.items) ? res.items : []))
      .catch(() => {
        setItems([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const filtered = useMemo(() => {
    if (tab === 'passed') return items.filter((item) => item.passed);
    if (tab === 'failed') return items.filter((item) => !item.passed);
    return items;
  }, [items, tab]);

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

  return (
    <div className="records-page">
      <div className="records-header">
        <h1>{t('academy.myExams.title')}</h1>
        <p>{t('academy.myExams.subtitle')}</p>
      </div>

      <div className="filter-tabs">
        {([
          ['all', 'academy.myExams.tabAll'],
          ['passed', 'academy.myExams.tabPassed'],
          ['failed', 'academy.myExams.tabFailed'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`filter-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="records-empty">
          {loadError ? t('academy.myExams.loadError') : t('academy.myExams.empty')}
        </div>
      ) : (
        <div className="exam-card-list">
          {filtered.map((item) => (
            <div key={item.attemptId} className="exam-card" data-result={item.passed ? 'pass' : 'fail'}>
              <div className={`exam-status-icon ${item.passed ? 'pass' : 'fail'}`}>
                {item.passed ? '✓' : '✕'}
              </div>
              <div className="exam-info">
                <div className="exam-course">{item.courseTitle}</div>
                <div className="exam-title">{item.examTitle || item.courseTitle}</div>
                <div className="exam-meta">
                  <span>
                    {t('academy.myExams.score')
                      .replace('{score}', String(item.score))
                      .replace('{total}', String(item.totalScore))}
                  </span>
                  <span className="dot">·</span>
                  <span>{formatSubmittedAt(item.submittedAt, locale)}</span>
                </div>
              </div>
              <div className={`exam-score ${item.passed ? 'pass' : 'fail'}`}>{item.scorePercent}</div>
              <span className={`exam-result-tag ${item.passed ? 'pass' : 'fail'}`}>
                {item.passed ? t('academy.myExams.passed') : t('academy.myExams.failed')}
              </span>
              <a
                className="btn-review"
                href={`/courses/${item.courseSlug}/exam/result?attemptId=${encodeURIComponent(item.attemptId)}&source=review`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('academy.myExams.review')}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
