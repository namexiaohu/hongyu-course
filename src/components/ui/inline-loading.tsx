type Props = {
  label: string;
  className?: string;
};

export function InlineLoading({ label, className }: Props) {
  return (
    <div
      className={className ? `inline-loading ${className}` : 'inline-loading'}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-loading__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
