'use client';

import Link from 'next/link';

import { academyCourseDetailPath, academyLearnPath } from '@/lib/academy-certificate-course';
import type { StorefrontAcademyCourseDetail } from '@/lib/storefront-academy-courses-api';
import { useTranslation } from '@/lib/i18n-context';

type Props = {
  course: StorefrontAcademyCourseDetail;
  mode: 'detail' | 'learn';
};

export function CertificateCoursePicker({ course, mode }: Props) {
  const { t } = useTranslation();
  const links = course.certificateLinks ?? [];

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">{t('academy.home.chooseCertificate')}</h1>
        <p className="cert-card__meta" style={{ marginBottom: 24 }}>
          {links.length
            ? t('academy.home.chooseCertificateLead')
            : t('academy.home.chooseCertificateEmpty')}
        </p>
        <div className="picker-list">
          {links.map((link) => {
            const href = mode === 'learn'
              ? academyLearnPath(course.slug, link.certificateCourseId)
              : academyCourseDetailPath(course.slug, link.certificateCourseId);
            return (
              <Link key={link.certificateCourseId} href={href} className="course-list-card">
                <div className="course-list-info">
                  <div className="course-list-title">{link.certificateTitle}</div>
                  <div className="course-list-meta">{t('academy.home.professionalCertificate')}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
