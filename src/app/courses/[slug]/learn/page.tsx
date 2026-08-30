import { notFound, redirect } from 'next/navigation';

import { CertificateCoursePicker } from '@/components/academy/certificate-course-picker';
import { CourseLearningView } from '@/components/academy/course-learning-view';
import {
  academyLearnPath,
  resolveCertificateCourseId,
} from '@/lib/academy-certificate-course';
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
  if (resolved.kind === 'empty' || resolved.kind === 'picker') {
    return <CertificateCoursePicker course={course} mode="learn" />;
  }
  if (resolved.kind === 'redirect') {
    redirect(academyLearnPath(slug, resolved.id));
  }

  return <CourseLearningView course={course} certificateCourseId={resolved.id} />;
}
