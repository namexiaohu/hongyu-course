import { notFound } from 'next/navigation';

import { CourseDetailView } from '@/components/academy/course-detail-view';
import { MissingCertificateContext } from '@/components/academy/missing-certificate-context';
import { resolveCertificateCourseId } from '@/lib/academy-certificate-course';
import { getPageTranslations, getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCourseBySlug } from '@/lib/storefront-academy-courses-api';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ certificateCourseId?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['common']);
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) return { title: t('common.notFound') };
  return { title: course.seo.title, description: course.seo.description };
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { certificateCourseId: rawId } = await searchParams;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) notFound();

  const resolved = resolveCertificateCourseId(rawId, course.certificateLinks ?? []);
  if (resolved.kind !== 'ok') {
    return <MissingCertificateContext />;
  }

  return <CourseDetailView course={course} certificateCourseId={resolved.id} />;
}
