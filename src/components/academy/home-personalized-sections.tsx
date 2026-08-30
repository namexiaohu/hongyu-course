'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { CertificateCard } from '@/components/academy/certificate-card';
import { CourseListCard } from '@/components/academy/course-list-card';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getAcademyHomeDashboard,
  type AcademyHomeDashboardPayload,
} from '@/lib/academy-home-api';
import { useTranslation } from '@/lib/i18n-context';

function WelcomeDecoration() {
  return (
    <svg className="welcome-decoration" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="welcome-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#764ba2" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="welcome-g2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f093fb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f5576c" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <circle cx="620" cy="80" r="160" fill="url(#welcome-g1)" className="w-float" />
      <circle cx="720" cy="200" r="120" fill="url(#welcome-g2)" className="w-float2" />
      <circle cx="560" cy="180" r="80" fill="#667eea" opacity="0.07" className="w-float3" />
      <ellipse cx="680" cy="150" rx="200" ry="130" fill="none" stroke="#667eea" strokeWidth="1.2" opacity="0.12" />
      <ellipse cx="680" cy="150" rx="160" ry="100" fill="none" stroke="#764ba2" strokeWidth="0.8" opacity="0.1" />
      <ellipse cx="680" cy="150" rx="120" ry="75" fill="none" stroke="#f093fb" strokeWidth="0.6" opacity="0.08" />
      <path d="M500 300Q580 180 700 200T800 100" stroke="#667eea" strokeWidth="1.5" opacity="0.1" fill="none" />
      <path d="M450 300Q550 200 680 180T800 60" stroke="#764ba2" strokeWidth="1" opacity="0.08" fill="none" />
      <circle cx="500" cy="250" r="3" fill="#667eea" opacity="0.2" />
      <circle cx="640" cy="50" r="2.5" fill="#764ba2" opacity="0.2" />
      <circle cx="750" cy="260" r="2" fill="#f093fb" opacity="0.2" />
      <circle cx="580" cy="120" r="1.5" fill="#667eea" opacity="0.15" />
      <circle cx="700" cy="90" r="4" fill="#764ba2" opacity="0.08" />
    </svg>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="home-inline-loading" role="status" aria-live="polite" aria-busy="true">
      <span className="home-inline-loading__spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

function displayNameFromUser(firstName?: string, lastName?: string) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export function HomePersonalizedSections() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AcademyHomeDashboardPayload | null>(null);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'ready'>('idle');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setData(null);
      setFetchState('idle');
      return;
    }
    let cancelled = false;
    setFetchState('loading');
    void getAcademyHomeDashboard()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setFetchState('ready');
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const recordsPending = isAuthenticated && fetchState !== 'ready';
  const loadingLabel = t('academy.home.loading');
  const name = data?.displayName || displayNameFromUser(user?.firstName, user?.lastName);
  const dashboard = data?.dashboard ?? null;
  const progressItems = data?.progressItems ?? [];
  const recentCertificates = data?.recentCertificates ?? [];
  const recentCourses = data?.recentCourses ?? [];

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-inner">
          {recordsPending ? (
            <InlineLoading label={loadingLabel} />
          ) : dashboard ? (
            <>
              <p className="welcome-greeting">
                {name ? `${name}, ` : null}
                {t('academy.home.welcomeBackTo')}{' '}
                <Link href={dashboard.certificateHref}>{dashboard.certificateTitle}</Link>
              </p>
              <h1 className="welcome-title">
                {t('academy.home.courseProgress', {
                  index: dashboard.courseIndex,
                  total: dashboard.courseTotal,
                  title: dashboard.courseTitle,
                })}
              </h1>
              <div>
                <span className="welcome-progress-bar">
                  <span className="welcome-progress-fill" style={{ width: `${dashboard.progressPercent}%` }} />
                </span>
                <span className="welcome-progress-text">
                  {t('academy.home.completedCount', { percent: dashboard.progressPercent })}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="welcome-greeting">
                {name ? `${name}, ` : null}
                {t('academy.home.welcomeEmpty')}
              </p>
              <h1 className="welcome-title">{t('academy.home.welcomeGuest')}</h1>
              <div style={{ marginTop: 16 }}>
                <Link href="/certificates" className="btn-primary">
                  {t('academy.home.browseCertificates')}
                </Link>
              </div>
            </>
          )}
        </div>
        <WelcomeDecoration />
      </section>

      {!recordsPending && progressItems.length ? (
        <section className="section">
          <div className="container">
            <h2 className="section-title">{t('academy.home.continueLearning')}</h2>
            <div className="continue-grid">
              {progressItems.map((item) => (
                <div key={item.certificateCourseId} className="continue-card">
                  <div className="continue-card-left">
                    <div>
                      <p className="continue-card-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                        </svg>
                        {item.certificateTitle}
                      </p>
                      <h2 className="continue-card-title">{item.courseTitle}</h2>
                      <p className="continue-card-subtitle">{item.unitTitle} / {item.lessonTitle}</p>
                      <p className="continue-card-meta">
                        {t('academy.home.videoMeta', {
                          watched: item.positionSeconds,
                          duration: item.durationSeconds,
                        })}
                      </p>
                    </div>
                    <div className="continue-card-actions">
                      <Link href={item.href} className="btn-primary">{t('academy.home.startNow')}</Link>
                    </div>
                  </div>
                  <div className="continue-card-right">
                    {item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(event) => {
                          const el = event.currentTarget;
                          if (el.currentTime === 0) el.currentTime = 0.001;
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!recordsPending && recentCourses.length ? (
        <section className="section" style={{ paddingTop: progressItems.length ? 0 : undefined }}>
          <div className="container">
            <h2 className="section-title">{t('academy.home.recentCourses')}</h2>
            <div className="recent-course-list">
              {recentCourses.map((item) => (
                <CourseListCard
                  key={item.slug}
                  href={item.href}
                  title={item.title}
                  coverImage={item.coverImage}
                  certificateTitle={item.certificateTitle}
                  subtitle={item.subtitle}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!recordsPending && recentCertificates.length ? (
        <section className="section" style={{ paddingTop: recentCourses.length || progressItems.length ? 0 : undefined }}>
          <div className="container">
            <h2 className="section-title">{t('academy.home.recentCertificates')}</h2>
            <div className="cert-grid cert-grid--home">
              {recentCertificates.map((item) => (
                <CertificateCard
                  key={item.slug}
                  href={item.href}
                  title={item.title}
                  subtitle={item.subtitle}
                  coverImage={item.coverImage}
                  badgeLabel={item.badgeLabel}
                  skills={item.skills}
                  skillsPrefix={t('academy.certificate.skills')}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
