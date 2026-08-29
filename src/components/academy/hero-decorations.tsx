export function CertificateHeroDecoration() {
  return (
    <div className="hero-decoration" aria-hidden="true">
      <svg className="hero-geo-svg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#146ef5" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00d722" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="cg2" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffae13" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#146ef5" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <polygon points="200,40 340,120 340,280 200,360 60,280 60,120" fill="url(#cg1)" className="c-pulse" />
        <polygon points="200,80 310,140 310,260 200,320 90,260 90,140" fill="none" stroke="#146ef5" strokeWidth="1.5" opacity="0.12" className="c-rotate" />
        <polygon points="200,120 280,160 280,240 200,280 120,240 120,160" fill="url(#cg2)" className="c-pulse2" />
        <polygon points="200,160 250,185 250,215 200,240 150,215 150,185" fill="#146ef5" opacity="0.06" />
        <line x1="200" y1="40" x2="200" y2="360" stroke="#146ef5" strokeWidth="0.5" opacity="0.08" />
        <line x1="60" y1="120" x2="340" y2="280" stroke="#146ef5" strokeWidth="0.5" opacity="0.08" />
        <line x1="60" y1="280" x2="340" y2="120" stroke="#146ef5" strokeWidth="0.5" opacity="0.08" />
        <circle cx="200" cy="200" r="180" fill="none" stroke="#ffae13" strokeWidth="0.8" opacity="0.08" className="c-rotate-rev" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#146ef5" strokeWidth="0.6" opacity="0.06" />
        <circle cx="340" cy="80" r="4" fill="#146ef5" opacity="0.2" />
        <circle cx="60" cy="320" r="3" fill="#ffae13" opacity="0.15" />
        <circle cx="350" cy="300" r="2.5" fill="#00d722" opacity="0.15" />
        <circle cx="80" cy="100" r="2" fill="#146ef5" opacity="0.12" />
      </svg>
    </div>
  );
}

export function CourseHeroDecoration() {
  return (
    <div className="hero-decoration" aria-hidden="true">
      <svg className="hero-wave-svg" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="190" r="70" fill="#146ef5" opacity="0.12" />
        <circle cx="320" cy="260" r="48" fill="#146ef5" opacity="0.09" />
        <circle cx="270" cy="140" r="38" fill="#146ef5" opacity="0.08" />
        <circle cx="140" cy="290" r="32" fill="#146ef5" opacity="0.07" />
        <circle cx="370" cy="170" r="26" fill="#146ef5" opacity="0.06" />
        <circle cx="110" cy="160" r="22" fill="#146ef5" opacity="0.06" />
        <circle cx="350" cy="350" r="18" fill="#146ef5" opacity="0.05" />
        <circle cx="290" cy="80" r="16" fill="#146ef5" opacity="0.05" />
        <circle cx="100" cy="340" r="12" fill="#146ef5" opacity="0.04" />
        <circle cx="400" cy="280" r="10" fill="#146ef5" opacity="0.04" />
        <line x1="200" y1="190" x2="320" y2="260" stroke="#146ef5" strokeWidth="1.5" opacity="0.12" />
        <line x1="200" y1="190" x2="270" y2="140" stroke="#146ef5" strokeWidth="1.5" opacity="0.1" />
        <line x1="270" y1="140" x2="320" y2="260" stroke="#146ef5" strokeWidth="1.2" opacity="0.09" />
        <line x1="200" y1="190" x2="140" y2="290" stroke="#146ef5" strokeWidth="1.2" opacity="0.08" />
        <line x1="320" y1="260" x2="370" y2="170" stroke="#146ef5" strokeWidth="1" opacity="0.07" />
        <line x1="200" y1="190" x2="110" y2="160" stroke="#146ef5" strokeWidth="1" opacity="0.06" />
        <line x1="320" y1="260" x2="350" y2="350" stroke="#146ef5" strokeWidth="1" opacity="0.05" />
        <line x1="270" y1="140" x2="290" y2="80" stroke="#146ef5" strokeWidth="0.8" opacity="0.05" />
        <line x1="140" y1="290" x2="100" y2="340" stroke="#146ef5" strokeWidth="0.8" opacity="0.04" />
        <line x1="370" y1="170" x2="400" y2="280" stroke="#146ef5" strokeWidth="0.8" opacity="0.04" />
      </svg>
    </div>
  );
}
