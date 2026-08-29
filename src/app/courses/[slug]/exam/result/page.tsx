import { ExamResultView } from '@/components/academy/exam-result-view';

type PageProps = { params: Promise<{ slug: string }> };

export default async function ExamResultPage({ params }: PageProps) {
  const { slug } = await params;
  return <ExamResultView slug={slug} />;
}
