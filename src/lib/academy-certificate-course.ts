export function academyCourseDetailPath(courseSlug: string, certificateCourseId: string) {
  return `/courses/${courseSlug}?certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export function academyLearnPath(courseSlug: string, certificateCourseId: string) {
  return `/courses/${courseSlug}/learn?certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export function academyExamPath(courseSlug: string, certificateCourseId: string) {
  return `/courses/${courseSlug}/exam?certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export function withCertificateCourseId(href: string, certificateCourseId?: string) {
  if (!certificateCourseId) return href;
  const join = href.includes('?') ? '&' : '?';
  return `${href}${join}certificateCourseId=${encodeURIComponent(certificateCourseId)}`;
}

export type ResolveCertificateCourseResult =
  | { kind: 'ok'; id: string }
  | { kind: 'redirect'; id: string }
  | { kind: 'picker' }
  | { kind: 'empty' };

export function resolveCertificateCourseId(
  raw: string | undefined,
  links: Array<{ certificateCourseId: string }>,
): ResolveCertificateCourseResult {
  if (!links.length) return { kind: 'empty' };
  const id = raw?.trim() ?? '';
  if (id && links.some((link) => link.certificateCourseId === id)) {
    return { kind: 'ok', id };
  }
  if (links.length === 1) {
    return { kind: 'redirect', id: links[0].certificateCourseId };
  }
  return { kind: 'picker' };
}
