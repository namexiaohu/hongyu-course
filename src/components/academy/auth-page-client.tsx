'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useTranslation } from '@/lib/i18n-context';

export function AuthPageClient() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="auth-layout">
      <div className="auth-visual" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80')" }} />
      <div className="auth-panel">
        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          <div className="tabs" style={{ marginBottom: 24 }}>
            <button type="button" className={`tab${mode === 'login' ? ' is-active' : ''}`} onClick={() => setMode('login')}>{t('academy.auth.login')}</button>
            <button type="button" className={`tab${mode === 'register' ? ' is-active' : ''}`} onClick={() => setMode('register')}>{t('academy.auth.register')}</button>
          </div>
          {mode === 'register' ? (
            <label>{t('academy.auth.name')}<input type="text" /></label>
          ) : null}
          <label>{t('academy.auth.email')}<input type="email" /></label>
          <label>{t('academy.auth.password')}<input type="password" /></label>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            {mode === 'login' ? t('academy.auth.login') : t('academy.auth.register')}
          </button>
          <p style={{ marginTop: 16 }}><Link href="/">← Back to explore</Link></p>
        </form>
      </div>
    </div>
  );
}
