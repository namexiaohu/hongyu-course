import type { AcademyWatchProgress } from '@/lib/academy-home-api';
import type { StorefrontAcademyUnitItem } from '@/lib/storefront-academy-courses-api';

export type ResolvedWatchProgress = {
  unitTitle: string;
  lessonTitle: string;
  positionSeconds: number;
  durationSeconds: number;
};

export function resolveWatchProgress(
  watch: AcademyWatchProgress | null,
  units: StorefrontAcademyUnitItem[],
): ResolvedWatchProgress | null {
  if (!watch) return null;
  const unit = units.find((item) => item.id === watch.unitId);
  const lesson = unit?.lessons.find((item) => item.id === watch.lessonId);
  if (!unit || !lesson) return null;
  return {
    unitTitle: unit.title,
    lessonTitle: lesson.title,
    positionSeconds: watch.positionSeconds,
    durationSeconds: lesson.durationSeconds,
  };
}
