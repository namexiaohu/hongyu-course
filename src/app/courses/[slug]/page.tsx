import { notFound } from 'next/navigation';

import { CourseDetailView } from '@/components/academy/course-detail-view';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCourseBySlug } from '@/lib/storefront-academy-courses-api';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) return { title: 'Not Found' };
  return { title: course.seo.title, description: course.seo.description };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) notFound();
  return <CourseDetailView course={course} />;
}
