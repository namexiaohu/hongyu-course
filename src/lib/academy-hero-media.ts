type HeroCoverDisplay = {
  video: boolean;
  cover: boolean;
  gallery: boolean;
};

export type AcademyHeroMediaInput = {
  title: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  gallery?: Array<{ url: string; alt?: string }> | null;
  showCoverOnBackground?: boolean;
  coverDisplay: HeroCoverDisplay;
};

export type AcademyHeroSlide = {
  kind: 'video' | 'image';
  url: string;
  alt: string;
};

/** video → cover → gallery, filtered by coverDisplay; only when showCoverOnBackground. */
export function buildAcademyHeroSlides(input: AcademyHeroMediaInput): AcademyHeroSlide[] {
  if (!input.showCoverOnBackground) return [];

  const { coverDisplay: display } = input;
  const slides: AcademyHeroSlide[] = [];
  const seen = new Set<string>();

  const videoUrl = input.videoUrl?.trim();
  if (display.video && videoUrl) {
    slides.push({ kind: 'video', url: videoUrl, alt: `${input.title} video` });
    seen.add(videoUrl);
  }

  const coverUrl = input.coverImage?.trim();
  if (display.cover && coverUrl && !seen.has(coverUrl)) {
    slides.push({ kind: 'image', url: coverUrl, alt: input.title });
    seen.add(coverUrl);
  }

  if (display.gallery) {
    for (const item of input.gallery ?? []) {
      const url = item.url?.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      slides.push({ kind: 'image', url, alt: item.alt?.trim() || input.title });
    }
  }

  return slides;
}
