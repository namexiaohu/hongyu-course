import { apiFetch } from '@/lib/api-client';

export type ExamQuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank';

export type ExamQuestionPublic = {
  id: string;
  index: number;
  questionType: ExamQuestionType;
  score: number;
  content: Record<string, unknown>;
};

export type CertificateExamEligibilityResponse = {
  certificateSlug: string;
  certificateId: string;
  certificateTitle: string;
  isCertificateComplete: boolean;
  hasQuestionBanks: boolean;
  submittedAttempts: number;
  remainingRetakes: number | null;
  canStartExam: boolean;
  examTitle: string;
  questionCount: number;
  passScorePercent: number;
  certificateNumber: string | null;
};

export type ExamStartResponse = {
  attemptId: string;
  certificateSlug: string;
  certificateId: string;
  certificateTitle: string;
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
  certificateSlug: string;
  certificateId: string;
  certificateTitle: string;
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

export async function getCertificateExamEligibility(certificateSlug: string) {
  return apiFetch<CertificateExamEligibilityResponse>(
    `/api/front/academy/exams/certificates/${encodeURIComponent(certificateSlug)}/eligibility`,
  );
}

export async function startCertificateExam(certificateSlug: string) {
  return apiFetch<ExamStartResponse>(
    `/api/front/academy/exams/certificates/${encodeURIComponent(certificateSlug)}/start`,
    { method: 'POST', body: JSON.stringify({}) },
  );
}

export async function submitExam(attemptId: string, answers: Record<string, ExamUserAnswer>) {
  return apiFetch<ExamSubmitResponse>(`/api/front/academy/exams/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function getCertificateExamResult(attemptId: string, certificateSlug: string) {
  const params = new URLSearchParams({ certificateSlug });
  return apiFetch<ExamResultResponse>(
    `/api/front/academy/exams/attempts/${encodeURIComponent(attemptId)}?${params}`,
  );
}
