import { ExamPageView } from '@/components/academy/exam-page-view';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ certificateCourseId?: string }>;
};

export default async function ExamPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { certificateCourseId } = await searchParams;
  return <ExamPageView slug={slug} certificateCourseId={certificateCourseId} />;
}
