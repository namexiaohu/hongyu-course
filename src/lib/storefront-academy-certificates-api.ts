import { ApiRequestError, serverFetch } from '@/lib/api-client';

export type StorefrontAcademyCertificateListItem = {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  summary: string;
  coverImage: string;
  teacherCount: number;
  studentCount: number;
  courseCount: number;
  skills?: string[];
};

export type StorefrontAcademyCertificateCourseItem = {
  certificateCourseId: string;
  slug: string;
  href: string;
  title: string;
  summary: string;
  coverImage: string;
  sortOrder: number;
  units: Array<{ id: string; title: string; sortOrder: number }>;
};

export type StorefrontAcademyCertificateDetail = {
  slug: string;
  locale: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: Array<{ url: string; alt: string }>;
  videoUrl: string;
  showCoverOnBackground: boolean;
  coverDisplay: { video: boolean; cover: boolean; gallery: boolean };
  teacherCount: number;
  studentCount: number;
  stats: Array<{ label: string; value: string }>;
  learnings: string[];
  skills: string[];
  tools: string[];
  courses: StorefrontAcademyCertificateCourseItem[];
  examHint: {
    hasExam: boolean;
    questionCount?: number;
    passScorePercent?: number;
    totalCourses?: number;
  };
  seo: { title: string; description: string };
};

export type StorefrontAcademyCertificateListResponse = {
  locale: string;
  page: number;
  pageSize: number;
  total: number;
  items: StorefrontAcademyCertificateListItem[];
};

export async function getStorefrontAcademyCertificateList(input?: {
  locale?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (input?.page) params.set('page', String(input.page));
  if (input?.pageSize) params.set('pageSize', String(input.pageSize));
  if (input?.q?.trim()) params.set('q', input.q.trim());
  const query = params.toString();
  return serverFetch<StorefrontAcademyCertificateListResponse>(
    `/api/front/academy/certificates${query ? `?${query}` : ''}`,
    { locale: input?.locale },
  );
}

export async function getStorefrontAcademyCertificateBySlug(slug: string, locale?: string) {
  try {
    return await serverFetch<StorefrontAcademyCertificateDetail>(
      `/api/front/academy/certificates/${encodeURIComponent(slug)}`,
      { locale },
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}
