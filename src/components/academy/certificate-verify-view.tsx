'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { PageLoading } from '@/components/ui/page-loading';
import { downloadElementAsPdf } from '@/lib/download-element-pdf';
import { useTranslation } from '@/lib/i18n-context';
import type { PublicCertificate } from '@/lib/storefront-academy-records-api';
import { getPublicCertificate } from '@/lib/storefront-academy-records-api';

type Props = { certificateNumber: string };

function formatIssuedDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function CertificateVerifyView({ certificateNumber }: Props) {
  const { t, locale } = useTranslation();
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certificateNumber) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    void getPublicCertificate(certificateNumber)
      .then(setCert)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [certificateNumber]);

  async function handleDownload() {
    if (!frameRef.current || !cert || downloading) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadElementAsPdf(frameRef.current, `${cert.certificateNumber}.pdf`);
    } catch {
      setDownloadError(t('academy.verify.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <PageLoading label={t('academy.verify.loading')} />;
  }

  if (notFound || !cert) {
    return (
      <div className="exam-gate">
        <p>{t('academy.verify.notFound')}</p>
        <Link href="/" className="btn-secondary" style={{ marginTop: 16, display: 'inline-flex' }}>
          {t('academy.verify.backHome')}
        </Link>
      </div>
    );
  }

  const verifyPath = typeof window !== 'undefined'
    ? `${window.location.origin}/cert/${encodeURIComponent(cert.certificateNumber)}`
    : `/cert/${encodeURIComponent(cert.certificateNumber)}`;

  return (
    <div className="verify-page">
      <section className="verify-celebration">
        <h1>{t('academy.verify.congrats')}</h1>
        <p>{t('academy.verify.congratsBody')}</p>
      </section>

      <div className="certificate-wrapper">
        <div className="certificate-frame" ref={frameRef}>
          <div className="certificate-inner">
            <span className="corner-bl" aria-hidden />
            <span className="corner-br" aria-hidden />

            <div className="cert-logo" aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                <rect width="48" height="48" rx="4" fill="#146ef5" />
                <path d="M24 10L10 17v14l14 7 14-7V17L24 10z" fill="#fff" opacity="0.95" />
                <path d="M24 18l-6 3v6l6 3 6-3v-6l-6-3z" fill="#146ef5" />
              </svg>
            </div>

            <div className="cert-badge">{t('academy.verify.badge')}</div>
            <h2 className="cert-title">{cert.title}</h2>
            <p className="cert-awarded">{t('academy.verify.awarded')}</p>
            <div className="cert-name">{cert.recipientName}</div>
            <p className="cert-course">
              {t('academy.verify.completed')} <strong>{cert.title}</strong>
            </p>
            <div className="cert-footer">
              <div className="cert-footer-item">
                <div className="cert-footer-line" />
                <div className="cert-footer-label">{t('academy.verify.issuedAt')}</div>
                <div className="cert-footer-value">{formatIssuedDate(cert.issuedAt, locale)}</div>
              </div>
              <div className="cert-footer-item">
                <div className="cert-footer-line" />
                <div className="cert-footer-label">{t('academy.verify.number')}</div>
                <div className="cert-footer-value">{cert.certificateNumber}</div>
              </div>
              <div className="cert-footer-item">
                <div className="cert-footer-line" />
                <div className="cert-footer-label">{t('academy.verify.issuer')}</div>
                <div className="cert-footer-value">{cert.issuerName}</div>
              </div>
            </div>
            <div className="cert-id">
              {t('academy.verify.verifyUrl')}：{verifyPath}
            </div>
          </div>
        </div>
      </div>

      <div className="certificate-actions">
        <button
          type="button"
          className={`btn-primary${downloading ? ' is-loading' : ''}`}
          disabled={downloading}
          aria-busy={downloading}
          onClick={() => void handleDownload()}
        >
          {downloading ? (
            <>
              <span className="certificate-download-spinner" aria-hidden="true" />
              {t('academy.verify.downloading')}
            </>
          ) : (
            t('academy.verify.download')
          )}
        </button>
        <Link href="/" className="btn-secondary">{t('academy.verify.backHome')}</Link>
        {downloadError ? (
          <p className="certificate-download-error" role="alert">{downloadError}</p>
        ) : null}
      </div>

      {downloading ? (
        <div className="certificate-download-overlay" role="status" aria-live="polite">
          <div className="certificate-download-overlay__card">
            <span className="certificate-download-spinner certificate-download-spinner--lg" aria-hidden="true" />
            <p>{t('academy.verify.downloading')}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
