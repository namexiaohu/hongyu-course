import { apiFetch } from '@/lib/api-client';

export type MyExamRecord = {
  attemptId: string;
  certificateSlug: string;
  certificateTitle: string;
  examTitle: string;
  score: number;
  totalScore: number;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
};

export type MyCertificateRecord = {
  id: string;
  certificateNumber: string;
  title: string;
  issuerName: string;
  recipientName: string;
  issuedAt: string;
  certificateSlug: string;
  coverPreviewUrl: string;
};

export type PublicCertificate = {
  certificateNumber: string;
  title: string;
  badge: string;
  issuerName: string;
  recipientName: string;
  issuedAt: string;
  certificateSlug: string;
};

export async function listMyExams() {
  return apiFetch<{ items: MyExamRecord[] }>('/api/front/academy/my-exams');
}

export async function listMyCertificates() {
  return apiFetch<{ items: MyCertificateRecord[] }>('/api/front/academy/my-certificates');
}

export async function getPublicCertificate(certificateNumber: string) {
  return apiFetch<PublicCertificate>(
    `/api/front/academy/certs/${encodeURIComponent(certificateNumber)}`,
  );
}
