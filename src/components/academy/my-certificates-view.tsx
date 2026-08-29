'use client';

import { useEffect, useState } from 'react';

import { PageLoading } from '@/components/ui/page-loading';
import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import { useTranslation } from '@/lib/i18n-context';
import type { MyCertificateRecord } from '@/lib/storefront-academy-records-api';
import { listMyCertificates } from '@/lib/storefront-academy-records-api';

function formatMonth(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale || 'en', { year: 'numeric', month: 'long' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 7);
  }
}

function CertificateMedalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="5.5" />
      <path d="M9.2 13.2 7 21l5-2.5L17 21l-2.2-7.8" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MyCertificatesView() {
  const { t, locale } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [items, setItems] = useState<MyCertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoadError(false);
    void listMyCertificates()
      .then((res) => setItems(Array.isArray(res.items) ? res.items : []))
      .catch(() => {
        setItems([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

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
        <h1>{t('academy.myCertificates.title')}</h1>
        <p>{t('academy.myCertificates.subtitle')}</p>
      </div>

      {items.length === 0 ? (
        <div className="records-empty">
          {loadError ? t('academy.myCertificates.loadError') : t('academy.myCertificates.empty')}
        </div>
      ) : (
        <div className="cert-grid">
          {items.map((item) => (
            <div key={item.id} className="cert-card">
              <div className="cert-card-preview">
                {item.coverPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cert-card-preview__cover" src={item.coverPreviewUrl} alt="" />
                ) : (
                  <div className="cert-card-preview__fallback" />
                )}
                <div className="cert-icon" aria-hidden>
                  <CertificateMedalIcon />
                </div>
              </div>
              <div className="cert-card-body">
                <div className="cert-card-title">{item.title}</div>
                <div className="cert-card-course">
                  {t('academy.myCertificates.issuer').replace('{issuer}', item.issuerName)}
                </div>
                <div className="cert-card-meta">
                  <span>
                    {t('academy.myCertificates.courseCount').replace('{count}', String(item.courseCount ?? 1))}
                  </span>
                  <span className="dot">·</span>
                  <span>
                    {t('academy.myCertificates.issuedAt').replace('{date}', formatMonth(item.issuedAt, locale))}
                  </span>
                </div>
                <div className="cert-card-actions">
                  <a
                    className="btn-view"
                    href={`/cert/${encodeURIComponent(item.certificateNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EyeIcon />
                    {t('academy.myCertificates.view')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
