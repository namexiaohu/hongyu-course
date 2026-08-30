import { apiFetch } from '@/lib/api-client';

export type LessonNote = {
  id: string;
  content: string;
  videoPositionSeconds: number;
  createdAt: string;
};

export async function listLessonNotes(lessonId: string) {
  return apiFetch<{ items: LessonNote[] }>(
    `/api/front/academy/lessons/${encodeURIComponent(lessonId)}/notes`,
  );
}

export async function createLessonNote(
  lessonId: string,
  payload: { content: string; videoPositionSeconds: number },
) {
  return apiFetch<LessonNote>(`/api/front/academy/lessons/${encodeURIComponent(lessonId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteLessonNote(noteId: string) {
  return apiFetch<{ ok: true }>(`/api/front/academy/notes/${encodeURIComponent(noteId)}`, {
    method: 'DELETE',
  });
}
