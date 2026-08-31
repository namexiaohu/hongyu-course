type HongyuLogoProps = {
  className?: string;
};

export function HongyuLogo({ className }: HongyuLogoProps) {
  const fill = '#212D5D';

  return (
    <span className={className ?? 'course-nav__logo-mark'} aria-hidden="true">
      <svg viewBox="0 0 94.4 32.5" xmlns="http://www.w3.org/2000/svg" aria-label="HONGYU MEDICAL">
        <text
          transform="matrix(1 0 0 1 -0.009 32.2519)"
          style={{ fill, fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif", fontWeight: 900, fontSize: '19.5815px' }}
        >
          HONGYU
        </text>
        <text
          transform="matrix(1 0 0 1 42.2355 12.5244)"
          style={{ fill, fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px' }}
        >
          MEDICAL
        </text>
        <path
          style={{ fill }}
          d="M94.4,0.1v5.8h-0.4c-0.4,0-0.8-0.4-0.8-0.8V1.2h-3.8c-0.5,0-0.8-0.4-0.8-0.8V0.1H94.4z"
        />
      </svg>
    </span>
  );
}
