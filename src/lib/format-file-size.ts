export function formatFileSize(bytes: number | null | undefined, fallback = '') {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return fallback;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
