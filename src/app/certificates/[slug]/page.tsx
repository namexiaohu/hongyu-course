import { notFound } from 'next/navigation';

import { CertificateDetailView } from '@/components/academy/certificate-detail-view';
import { getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateBySlug } from '@/lib/storefront-academy-certificates-api';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const certificate = await getStorefrontAcademyCertificateBySlug(slug, locale);
  if (!certificate) return { title: 'Not Found' };
  return { title: certificate.seo.title, description: certificate.seo.description };
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale } = await getStorefrontLocaleContext();
  const certificate = await getStorefrontAcademyCertificateBySlug(slug, locale);
  if (!certificate) notFound();
  return <CertificateDetailView certificate={certificate} />;
}
