type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function formatLessonDuration(seconds: number, t: TranslateFn): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';

  const total = Math.round(seconds);
  if (total >= 3600) {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return t('academy.learn.duration.hoursMinutesSeconds', {
      hours,
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    });
  }

  if (total >= 60) {
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return t('academy.learn.duration.minutesSeconds', {
      minutes,
      seconds: String(secs).padStart(2, '0'),
    });
  }

  return t('academy.learn.duration.seconds', { seconds: total });
}
