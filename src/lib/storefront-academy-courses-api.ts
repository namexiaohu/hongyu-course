import { ApiRequestError, serverFetch } from '@/lib/api-client';

export type StorefrontAcademyLessonMaterial = {
  name: string;
  url: string;
  mimeType: string;
  size: number | null;
  sizeLabel: string;
};

export type StorefrontAcademyLessonItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
  durationLabel: string;
  sortOrder: number;
  materials: StorefrontAcademyLessonMaterial[];
};

export type StorefrontAcademyUnitItem = {
  id: string;
  title: string;
  coverImage: string;
  sortOrder: number;
  lessons: StorefrontAcademyLessonItem[];
};

export type StorefrontAcademyCourseDetail = {
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
  units: StorefrontAcademyUnitItem[];
  certificates: Array<{ slug: string; href: string; title: string }>;
  certificateLinks: Array<{
    certificateCourseId: string;
    certificateSlug: string;
    certificateTitle: string;
    href: string;
    sortOrder: number;
  }>;
  seo: { title: string; description: string };
};

export async function getStorefrontAcademyCourseBySlug(slug: string, locale?: string) {
  try {
    return await serverFetch<StorefrontAcademyCourseDetail>(
      `/api/front/academy/courses/${encodeURIComponent(slug)}`,
      { locale },
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}
