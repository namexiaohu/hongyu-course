'use client';

import type { AcademyHeroSlide } from '@/lib/academy-hero-media';

type Props = {
  slides: AcademyHeroSlide[];
  fallback: React.ReactNode;
};

export function AcademyHeroVisual({ slides, fallback }: Props) {
  if (!slides.length) return <>{fallback}</>;

  const primary = slides[0];
  return (
    <div className="hero-media">
      {primary.kind === 'video' ? (
        <video className="hero-media__primary" src={primary.url} controls playsInline preload="metadata" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={primary.url} alt={primary.alt} className="hero-media__primary" />
      )}
      {slides.length > 1 ? (
        <div className="hero-media__thumbs">
          {slides.slice(1, 4).map((slide) => (
            slide.kind === 'video' ? (
              <video key={slide.url} src={slide.url} muted playsInline preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={slide.url} src={slide.url} alt={slide.alt} />
            )
          ))}
        </div>
      ) : null}
    </div>
  );
}
