import { apiFetch } from '@/lib/api-client';

export type AcademyProgressResponse = {
  courseSlug: string;
  courseId: string;
  completedLessonIds: string[];
};

export async function getCourseLessonProgress(courseSlug: string) {
  return apiFetch<AcademyProgressResponse>(
    `/api/front/academy/progress?courseSlug=${encodeURIComponent(courseSlug)}`,
  );
}

export async function markCourseLessonCompleted(lessonId: string) {
  return apiFetch<{ ok: true; lessonId: string }>('/api/front/academy/progress', {
    method: 'POST',
    body: JSON.stringify({ lessonId }),
  });
}
