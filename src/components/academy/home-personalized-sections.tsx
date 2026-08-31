'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { CertificateCard } from '@/components/academy/certificate-card';
import { CourseListCard } from '@/components/academy/course-list-card';
import { InlineLoading } from '@/components/ui/inline-loading';
import { useAuth } from '@/components/providers/auth-provider';
import { useSiteBranding } from '@/components/providers/site-branding-provider';
import {
  getAcademyHomeDashboard,
  type AcademyHomeDashboardPayload,
  type AcademyHomeProgressItem,
} from '@/lib/academy-home-api';
import { academyCourseDetailPath } from '@/lib/academy-certificate-course';
import { displayNameFromUser } from '@/lib/display-name';
import { useTranslation } from '@/lib/i18n-context';

function WelcomeDecoration({ tall }: { tall?: boolean }) {
  return (
    <svg
      className={`welcome-decoration${tall ? ' welcome-decoration--tall' : ''}`}
      viewBox={tall ? '0 0 800 520' : '0 0 800 300'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
      <path d={tall ? 'M500 520Q580 280 700 320T800 180' : 'M500 300Q580 180 700 200T800 100'} stroke="#667eea" strokeWidth="1.5" opacity="0.1" fill="none" />
      <path d={tall ? 'M450 520Q550 320 680 280T800 120' : 'M450 300Q550 200 680 180T800 60'} stroke="#764ba2" strokeWidth="1" opacity="0.08" fill="none" />
    </svg>
  );
}

function ContinueCard({ item, embedded }: { item: AcademyHomeProgressItem; embedded?: boolean }) {
  const { t } = useTranslation();
  const showExamActions = item.status === 'courses_complete' && item.exam?.hasExam && item.exam.examHref;
  const courseDetailHref = academyCourseDetailPath(item.courseSlug, item.certificateCourseId);

  return (
    <div className={`continue-card${embedded ? ' continue-card--embedded' : ''}`}>
      <div className="continue-card-left">
        <div>
          <p className="continue-card-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <a
              href={item.certificateHref}
              className="continue-card-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.certificateTitle}
            </a>
          </p>
          <h2 className="continue-card-title">
            <a
              href={courseDetailHref}
              className="continue-card-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.courseTitle}
            </a>
          </h2>
          <p className="continue-card-subtitle">{item.unitTitle} / {item.lessonTitle}</p>
          <p className="continue-card-meta">
            {t('academy.home.videoMeta', {
              watched: item.positionSeconds,
              duration: item.durationSeconds,
            })}
          </p>
        </div>
        <div className="continue-card-actions">
          {showExamActions ? (
            <>
              <a
                href={item.exam!.examHref!}
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('academy.certificate.enterExam')}
              </a>
              <a
                href={item.continueLearnHref}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('academy.certificate.continueLearning')}
              </a>
            </>
          ) : (
            <a
              href={item.href}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('academy.home.startNow')}
            </a>
          )}
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
  );
}

export function HomePersonalizedSections() {
  const { t } = useTranslation();
  const { companyName } = useSiteBranding();
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
  const featuredItem = progressItems[0] ?? null;
  const restProgressItems = progressItems.slice(1);
  const recentCertificates = data?.recentCertificates ?? [];
  const recentCourses = data?.recentCourses ?? [];
  const mergedBanner = Boolean(dashboard && featuredItem);

  return (
    <>
      <section className={`welcome-banner${mergedBanner ? ' welcome-banner--merged' : ''}`}>
        <div className="container welcome-banner__content">
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
                <div className="welcome-progress-row">
                  <span className="welcome-progress-bar" aria-hidden="true">
                    <span className="welcome-progress-fill" style={{ width: `${dashboard.progressPercent}%` }} />
                  </span>
                  <span className="welcome-progress-text">
                    {t('academy.home.certificateProgressStat', {
                      percent: dashboard.progressPercent,
                    })}
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="welcome-greeting">
                  {name ? `${name}, ` : null}
                  {t('academy.home.welcomeEmpty')}
                </p>
                <h1 className="welcome-title">
                  {companyName ? t('academy.home.welcomeGuest', { name: companyName }) : t('academy.home.welcomeGuestFallback')}
                </h1>
                <div style={{ marginTop: 16 }}>
                  <Link href="/certificates" className="btn-primary">
                    {t('academy.home.browseCertificates')}
                  </Link>
                </div>
              </>
            )}
          </div>
          {!recordsPending && featuredItem ? (
            <div className="welcome-featured-card">
              <ContinueCard item={featuredItem} embedded />
            </div>
          ) : null}
        </div>
        <WelcomeDecoration tall={mergedBanner} />
      </section>

      {!recordsPending && restProgressItems.length ? (
        <section className="section">
          <div className="container">
            <h2 className="section-title">{t('academy.home.continueLearning')}</h2>
            <div className="continue-grid">
              {restProgressItems.map((item) => (
                <ContinueCard key={item.certificateSlug} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!recordsPending && recentCourses.length ? (
        <section className="section" style={{ paddingTop: restProgressItems.length ? 0 : undefined }}>
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
        <section className="section" style={{ paddingTop: recentCourses.length || restProgressItems.length ? 0 : undefined }}>
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
