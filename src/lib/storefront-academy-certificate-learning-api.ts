import { apiFetch } from '@/lib/api-client';

export type CertificateLearningStatus = 'not_started' | 'learning' | 'courses_complete' | 'exam_passed';

export type CertificateLearningState = {
  status: CertificateLearningStatus;
  progress: {
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
  } | null;
  exam: {
    hasExam: boolean;
    questionCount: number;
    passScorePercent: number;
    examTitle: string;
  };
  examResult: {
    passed: boolean;
    score: number | null;
    totalScore: number | null;
    certificateNumber: string;
    certificateHref: string;
  } | null;
  continueLearnHref: string | null;
  courses: Array<{
    certificateCourseId: string;
    slug: string;
    title: string;
    sortOrder: number;
    courseIndex: number;
    isComplete: boolean;
    href: string;
    learnHref: string;
    units: Array<{
      id: string;
      title: string;
      sortOrder: number;
      lessons: Array<{
        id: string;
        title: string;
        sortOrder: number;
        isComplete: boolean;
        durationSeconds: number;
      }>;
    }>;
  }>;
};

export async function getCertificateLearningState(certificateSlug: string) {
  return apiFetch<CertificateLearningState>(
    `/api/front/academy/certificates/${encodeURIComponent(certificateSlug)}/learning`,
  );
}
