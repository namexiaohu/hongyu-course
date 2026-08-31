import { apiFetch } from '@/lib/api-client';

export type AcademyHomeProgressItem = {
  certificateCourseId: string;
  certificateSlug: string;
  certificateTitle: string;
  courseSlug: string;
  courseTitle: string;
  unitTitle: string;
  lessonTitle: string;
  videoUrl: string;
  durationSeconds: number;
  positionSeconds: number;
  href: string;
  certificateHref: string;
  status: 'learning' | 'courses_complete';
  progressPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  courseIndex: number;
  courseTotal: number;
  continueLearnHref: string;
  exam: { hasExam: boolean; examHref: string | null } | null;
};

export type AcademyHomeDashboard = {
  displayName: string;
  certificateSlug: string;
  certificateTitle: string;
  certificateHref: string;
  courseSlug: string;
  courseTitle: string;
  courseIndex: number;
  courseTotal: number;
  progressPercent: number;
  completedLessonCount: number;
  totalLessonCount: number;
  learnHref: string;
};

export type AcademyHomeCertificateItem = {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  summary: string;
  coverImage: string;
  skills: string[];
  badgeLabel: string;
};

export type AcademyHomeCourseItem = {
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  href: string;
  certificateTitle: string;
  certificateHref: string;
};

export type AcademyHomeDashboardPayload = {
  displayName: string;
  dashboard: AcademyHomeDashboard | null;
  progressItems: AcademyHomeProgressItem[];
  recentCertificates: AcademyHomeCertificateItem[];
  recentCourses: AcademyHomeCourseItem[];
};

export async function getAcademyHomeDashboard() {
  return apiFetch<AcademyHomeDashboardPayload>('/api/front/academy/home');
}

export async function recordCertificateView(slug: string) {
  return apiFetch<{ ok: true }>(`/api/front/academy/views/certificates/${encodeURIComponent(slug)}`, {
    method: 'POST',
  });
}

export async function recordCourseView(slug: string) {
  return apiFetch<{ ok: true }>(`/api/front/academy/views/courses/${encodeURIComponent(slug)}`, {
    method: 'POST',
  });
}

export async function touchCourseProgress(
  certificateCourseId: string,
  watch?: { unitId: string; lessonId: string; positionSeconds: number },
) {
  return apiFetch<{ ok: true }>('/api/front/academy/progress/touch', {
    method: 'POST',
    body: JSON.stringify({
      certificateCourseId,
      ...(watch ?? {}),
    }),
  });
}

export type AcademyWatchProgress = {
  unitId: string;
  lessonId: string;
  positionSeconds: number;
};

export async function getCourseWatchProgress(certificateCourseId: string) {
  return apiFetch<{ watch: AcademyWatchProgress | null }>(
    `/api/front/academy/progress/watch?certificateCourseId=${encodeURIComponent(certificateCourseId)}`,
  );
}
