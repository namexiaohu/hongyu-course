import { notFound } from 'next/navigation';

import { CourseLearningView } from '@/components/academy/course-learning-view';
import { MissingCertificateContext } from '@/components/academy/missing-certificate-context';
import { resolveCertificateCourseId } from '@/lib/academy-certificate-course';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCourseBySlug } from '@/lib/storefront-academy-courses-api';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ certificateCourseId?: string }>;
};

export default async function CourseLearningPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { certificateCourseId: rawId } = await searchParams;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) notFound();

  const resolved = resolveCertificateCourseId(rawId, course.certificateLinks ?? []);
  if (resolved.kind !== 'ok') {
    return <MissingCertificateContext />;
  }

  return <CourseLearningView course={course} certificateCourseId={resolved.id} />;
}
