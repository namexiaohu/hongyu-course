import Link from 'next/link';

import type { StorefrontAcademyCertificateListItem } from '@/lib/storefront-academy-certificates-api';

type Props = {
  item: StorefrontAcademyCertificateListItem;
  skillsPrefix: string;
};

export function CertificateCatalogCard({ item, skillsPrefix }: Props) {
  const skills = item.skills ?? [];

  return (
    <Link href={item.href} className="catalog-card">
      <div className="catalog-card-img">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImage} alt="" />
        ) : null}
        {item.badgeLabel ? <span className="cert-card-badge">{item.badgeLabel}</span> : null}
      </div>
      <div className="catalog-card-body">
        <div className="catalog-card-title">{item.title}</div>
        {item.subtitle ? <p className="catalog-card-type">{item.subtitle}</p> : null}
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
