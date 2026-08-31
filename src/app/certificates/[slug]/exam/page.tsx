import { notFound } from 'next/navigation';

import { ExamPageView } from '@/components/academy/exam-page-view';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateBySlug } from '@/lib/storefront-academy-certificates-api';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CertificateExamPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const certificate = await getStorefrontAcademyCertificateBySlug(slug, locale);
  if (!certificate) notFound();

  return <ExamPageView certificateSlug={slug} />;
}
