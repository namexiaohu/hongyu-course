'use client';

import Link from 'next/link';

import { MOCK_CREDENTIAL, UNSPLASH } from '@/lib/mock/academy-mock';
import { useTranslation } from '@/lib/i18n-context';

export function CredentialPageView() {
  const { t } = useTranslation();

  return (
    <div className="container section">
      <h1>{t('academy.credential.title')}</h1>
      <div className="credential-card">
        <p>HONGYU Medical Academy</p>
        <h2>{MOCK_CREDENTIAL.certificateTitle}</h2>
        <p>Awarded to</p>
        <h3>{MOCK_CREDENTIAL.learnerName}</h3>
        <p>{MOCK_CREDENTIAL.issuedAt}</p>
        <p className="cert-card__meta">Credential ID: {MOCK_CREDENTIAL.credentialId}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <button type="button" className="btn-primary">{t('academy.credential.download')}</button>
        <button type="button" className="btn-secondary">{t('academy.credential.share')}</button>
        <Link href="/" className="btn-secondary">Explore more</Link>
      </div>
      <img src={UNSPLASH.credential} alt="" style={{ marginTop: 32, borderRadius: 4, maxWidth: 480, marginInline: 'auto' }} />
    </div>
  );
}
