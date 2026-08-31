type Props = {
  variant: 'warn' | 'success' | 'info';
  title: string;
  body: string;
};

export function CertNoticeBox({ variant, title, body }: Props) {
  return (
    <div className={`cert-notice cert-notice--${variant}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {variant === 'success' ? (
          <>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ) : (
          <>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </>
        )}
      </svg>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
