import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  badgeLabel?: string;
  skills?: string[];
  skillsPrefix: string;
};

export function CertificateCard({
  href,
  title,
  subtitle,
  coverImage,
  badgeLabel,
  skills = [],
  skillsPrefix,
}: Props) {
  return (
    <Link href={href} className="cert-card">
      <div className="cert-card-img">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" />
        ) : null}
        {badgeLabel ? <span className="cert-card-badge">{badgeLabel}</span> : null}
      </div>
      <div className="cert-card-body">
        <div className="cert-card-title">{title}</div>
        {subtitle ? <div className="cert-card-type">{subtitle}</div> : null}
        {skills.length ? (
          <>
            <p className="cert-card-skills-label">{skillsPrefix}</p>
            <div className="cert-card-tags">
              {skills.map((tag) => (
                <span key={tag} className="tag tag-accent">{tag}</span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Link>
  );
}
