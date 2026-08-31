export function academyCourseDetailPath(courseSlug: string, certificateCourseId: string) {
  return `/courses/${courseSlug}?certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export function academyLearnPath(courseSlug: string, certificateCourseId: string) {
  return `/courses/${courseSlug}/learn?certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export function academyCertificateExamPath(certificateSlug: string) {
  return `/certificates/${certificateSlug}/exam`;
}

export function academyCertificateExamResultPath(
  certificateSlug: string,
  attemptId: string,
  source: 'submit' | 'review',
) {
  const params = new URLSearchParams({ attemptId, source });
  return `/certificates/${certificateSlug}/exam/result?${params.toString()}`;
}

export type ResolveCertificateCourseResult =
  | { kind: 'ok'; id: string }
  | { kind: 'invalid' };

export function resolveCertificateCourseId(
  raw: string | undefined,
  links: Array<{ certificateCourseId: string }>,
): ResolveCertificateCourseResult {
  const id = raw?.trim() ?? '';
  if (id && links.some((link) => link.certificateCourseId === id)) {
    return { kind: 'ok', id };
  }
  return { kind: 'invalid' };
}
