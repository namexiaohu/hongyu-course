import { CertificateVerifyView } from '@/components/academy/certificate-verify-view';

type PageProps = { params: Promise<{ certificateNumber: string }> };

export default async function CertificatePage({ params }: PageProps) {
  const { certificateNumber } = await params;
  return <CertificateVerifyView certificateNumber={decodeURIComponent(certificateNumber)} />;
}
