import { ExamPageView } from '@/components/academy/exam-page-view';

type PageProps = { params: Promise<{ slug: string }> };

export default async function ExamPage({ params }: PageProps) {
  const { slug } = await params;
  return <ExamPageView slug={slug} />;
}
