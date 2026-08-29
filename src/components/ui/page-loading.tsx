type Props = {
  label?: string;
};

export function PageLoading({ label }: Props) {
  return (
    <div className="page-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="page-loading__spinner" aria-hidden />
      {label ? <p className="page-loading__label">{label}</p> : null}
    </div>
  );
}
