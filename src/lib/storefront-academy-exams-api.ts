import { apiFetch } from '@/lib/api-client';

export type ExamQuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank';

export type ExamQuestionPublic = {
  id: string;
  index: number;
  questionType: ExamQuestionType;
  score: number;
  content: Record<string, unknown>;
};

export type ExamEligibilityResponse = {
  courseSlug: string;
  courseId: string;
  certificateCourseId: string;
  isCourseComplete: boolean;
  hasQuestionBanks: boolean;
  submittedAttempts: number;
  remainingRetakes: number | null;
  canStartExam: boolean;
  examTitle: string;
  certificateNumber: string | null;
};

export type ExamStartResponse = {
  attemptId: string;
  courseSlug: string;
  certificateCourseId: string;
  questionBankId: string;
  title: string;
  passScorePercent: number;
  timeLimitMinutes: number | null;
  totalScore: number;
  questions: ExamQuestionPublic[];
  startedAt: string;
};

export type ExamSubmitResponse = {
  attemptId: string;
  score: number;
  totalScore: number;
  scorePercent: number;
  passed: boolean;
  passScorePercent: number;
  correctCount: number;
  totalQuestions: number;
  certificateNumber: string | null;
};

export type ExamResultReviewItem = {
  id: string;
  index: number;
  questionType: ExamQuestionType;
  score: number;
  content: Record<string, unknown>;
  userAnswer: number | number[] | boolean | string | null;
  isCorrect: boolean;
  earnedScore: number;
};

export type ExamResultResponse = {
  attemptId: string;
  courseSlug: string;
  certificateCourseId: string;
  certificateTitle: string;
  certificateSlug: string;
  title: string;
  score: number;
  totalScore: number;
  scorePercent: number;
  passed: boolean;
  passScorePercent: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
  durationSeconds: number;
  canRetake: boolean;
  remainingRetakes: number | null;
  certificateNumber: string | null;
  review: ExamResultReviewItem[];
};

export type ExamUserAnswer = number | number[] | boolean | string;

export async function getExamEligibility(courseSlug: string, certificateCourseId: string) {
  const params = new URLSearchParams({ certificateCourseId });
  return apiFetch<ExamEligibilityResponse>(
    `/api/front/academy/exams/${encodeURIComponent(courseSlug)}/eligibility?${params}`,
  );
}

export async function startExam(courseSlug: string, certificateCourseId: string) {
  return apiFetch<ExamStartResponse>(`/api/front/academy/exams/${encodeURIComponent(courseSlug)}/start`, {
    method: 'POST',
    body: JSON.stringify({ certificateCourseId }),
  });
}

export async function submitExam(attemptId: string, answers: Record<string, ExamUserAnswer>) {
  return apiFetch<ExamSubmitResponse>(`/api/front/academy/exams/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function getExamResult(attemptId: string, certificateCourseId: string) {
  const params = new URLSearchParams({ certificateCourseId });
  return apiFetch<ExamResultResponse>(
    `/api/front/academy/exams/attempts/${encodeURIComponent(attemptId)}?${params}`,
  );
}
