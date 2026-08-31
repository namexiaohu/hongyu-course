import { notFound } from 'next/navigation';

import { ExamResultView } from '@/components/academy/exam-result-view';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateBySlug } from '@/lib/storefront-academy-certificates-api';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attemptId?: string; source?: string }>;
};

export default async function CertificateExamResultPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { attemptId, source } = await searchParams;
  const { locale } = await getStorefrontLocaleContext();
  const certificate = await getStorefrontAcademyCertificateBySlug(slug, locale);
  if (!certificate) notFound();

  const resolvedAttemptId = attemptId?.trim() ?? '';
  const resolvedSource = source === 'submit' ? 'submit' : 'review';
  if (!resolvedAttemptId) notFound();

  return (
    <ExamResultView
      certificateSlug={slug}
      attemptId={resolvedAttemptId}
      source={resolvedSource}
    />
  );
}
