import { notFound } from 'next/navigation';

import { CourseLearningView } from '@/components/academy/course-learning-view';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCourseBySlug } from '@/lib/storefront-academy-courses-api';

type PageProps = { params: Promise<{ slug: string }> };

export default async function CourseLearningPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const course = await getStorefrontAcademyCourseBySlug(slug, locale);
  if (!course) notFound();
  return <CourseLearningView course={course} />;
}
