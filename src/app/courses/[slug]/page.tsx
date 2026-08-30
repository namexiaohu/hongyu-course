import { notFound, redirect } from 'next/navigation';

import { CertificateCoursePicker } from '@/components/academy/certificate-course-picker';
import { CourseDetailView } from '@/components/academy/course-detail-view';
import {
  academyCourseDetailPath,
  resolveCertificateCourseId,
} from '@/lib/academy-certificate-course';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCourseBySlug } from '@/lib/storefront-academy-courses-api';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ certificateCourseId?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) return { title: 'Not Found' };
  return { title: course.seo.title, description: course.seo.description };
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { certificateCourseId: rawId } = await searchParams;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) notFound();

  const resolved = resolveCertificateCourseId(rawId, course.certificateLinks ?? []);
  if (resolved.kind === 'empty' || resolved.kind === 'picker') {
    return <CertificateCoursePicker course={course} mode="detail" />;
  }
  if (resolved.kind === 'redirect') {
    redirect(academyCourseDetailPath(slug, resolved.id));
  }

  return <CourseDetailView course={course} certificateCourseId={resolved.id} />;
}
