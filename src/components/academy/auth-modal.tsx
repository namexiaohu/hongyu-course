'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { useAuthModal } from '@/components/providers/auth-modal-provider';
import {
  login,
  register,
  splitDisplayName,
  uploadRegistrationDocument,
  type RegistrationDocumentInput,
} from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n-context';

const REMEMBERED_EMAIL_KEY = 'hongyu-login-remembered-email';

export function AuthModal() {
  const { t } = useTranslation();
  const { open, mode, closeAuthModal, setAuthModalMode } = useAuthModal();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setPassword('');
    setConfirmPassword('');
    setDocumentFile(null);
    if (mode === 'login' && typeof window !== 'undefined') {
      const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  if (!open) return null;

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      if (remember) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim().toLowerCase());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      await refreshProfile({ silent: true });
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('academy.auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!agree) {
      setError(t('academy.auth.agreeRequired'));
      return;
    }
    if (password.length < 8) {
      setError(t('academy.auth.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('academy.auth.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      let documents: RegistrationDocumentInput[] = [];
      if (documentFile) {
        const uploaded = await uploadRegistrationDocument(documentFile);
        documents = [uploaded];
      }

      const { firstName, lastName } = splitDisplayName(name);
      await register({
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
        companyName: org.trim() || null,
        documents,
        termsAccepted: true,
        privacyAccepted: true,
        _quick: true,
      });
      await refreshProfile({ silent: true });
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('academy.auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-modal-overlay" role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal__close" onClick={closeAuthModal} aria-label={t('academy.auth.close')}>
          ×
        </button>

        <h2 id="auth-modal-title" className="auth-modal__title">
          {mode === 'login' ? t('academy.auth.loginTitle') : t('academy.auth.registerTitle')}
        </h2>
        <p className="auth-modal__subtitle">{t('academy.auth.subtitle')}</p>

        <div className="auth-modal__tabs">
          <button
            type="button"
            className={`auth-modal__tab${mode === 'login' ? ' is-active' : ''}`}
            onClick={() => setAuthModalMode('login')}
          >
            {t('academy.auth.login')}
          </button>
          <button
            type="button"
            className={`auth-modal__tab${mode === 'register' ? ' is-active' : ''}`}
            onClick={() => setAuthModalMode('register')}
          >
            {t('academy.auth.register')}
          </button>
        </div>

        {error ? <p className="auth-modal__error">{error}</p> : null}

        {mode === 'login' ? (
          <form className="auth-modal__form" onSubmit={handleLogin}>
            <label className="auth-modal__label" htmlFor="auth-login-email">{t('academy.auth.email')}</label>
            <input
              id="auth-login-email"
              className="auth-modal__input"
              type="email"
              autoComplete="email"
              placeholder={t('academy.auth.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="auth-modal__label" htmlFor="auth-login-password">{t('academy.auth.password')}</label>
            <input
              id="auth-login-password"
              className="auth-modal__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
            <label className="auth-modal__check">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>{t('academy.auth.remember')}</span>
            </label>
            <button type="submit" className="btn-primary auth-modal__submit" disabled={submitting}>
              {submitting ? t('academy.auth.submitting') : t('academy.auth.login')}
            </button>
            <p className="auth-modal__switch">
              {t('academy.auth.noAccount')}{' '}
              <button type="button" className="auth-modal__link" onClick={() => setAuthModalMode('register')}>
                {t('academy.auth.register')}
              </button>
            </p>
          </form>
        ) : (
          <form className="auth-modal__form" onSubmit={handleRegister}>
            <label className="auth-modal__label" htmlFor="auth-reg-name">{t('academy.auth.name')}</label>
            <input
              id="auth-reg-name"
              className="auth-modal__input"
              type="text"
              autoComplete="name"
              placeholder={t('academy.auth.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <label className="auth-modal__label" htmlFor="auth-reg-email">{t('academy.auth.email')}</label>
            <input
              id="auth-reg-email"
              className="auth-modal__input"
              type="email"
              autoComplete="email"
              placeholder={t('academy.auth.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="auth-modal__label" htmlFor="auth-reg-org">
              {t('academy.auth.organization')} <span className="auth-modal__optional">{t('academy.auth.optional')}</span>
            </label>
            <input
              id="auth-reg-org"
              className="auth-modal__input"
              type="text"
              autoComplete="organization"
              placeholder={t('academy.auth.organizationPlaceholder')}
              value={org}
              onChange={(event) => setOrg(event.target.value)}
            />
            <label className="auth-modal__label" htmlFor="auth-reg-password">{t('academy.auth.password')}</label>
            <input
              id="auth-reg-password"
              className="auth-modal__input"
              type="password"
              autoComplete="new-password"
              placeholder={t('academy.auth.passwordHint')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            <label className="auth-modal__label" htmlFor="auth-reg-confirm">{t('academy.auth.confirmPassword')}</label>
            <input
              id="auth-reg-confirm"
              className="auth-modal__input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
            <label className="auth-modal__label">
              {t('academy.auth.vetCert')} <span className="auth-modal__optional">{t('academy.auth.optional')}</span>
            </label>
            <label className="auth-modal__file">
              <span>{documentFile ? documentFile.name : t('academy.auth.vetCertHint')}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <p className="auth-modal__help">{t('academy.auth.vetCertHelp')}</p>
            <label className="auth-modal__check">
              <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} required />
              <span>{t('academy.auth.agree')}</span>
            </label>
            <button type="submit" className="btn-primary auth-modal__submit" disabled={submitting}>
              {submitting ? t('academy.auth.submitting') : t('academy.auth.register')}
            </button>
            <p className="auth-modal__switch">
              {t('academy.auth.hasAccount')}{' '}
              <button type="button" className="auth-modal__link" onClick={() => setAuthModalMode('login')}>
                {t('academy.auth.login')}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
