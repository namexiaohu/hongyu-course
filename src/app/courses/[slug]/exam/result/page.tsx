import { ExamResultView } from '@/components/academy/exam-result-view';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attemptId?: string; source?: string }>;
};

export default async function ExamResultPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { attemptId = '', source: rawSource } = await searchParams;
  const source = rawSource === 'review' ? 'review' : 'submit';
  return <ExamResultView slug={slug} attemptId={attemptId} source={source} />;
}
