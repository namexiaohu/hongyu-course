import type { ReactNode } from 'react';

import Link from 'next/link';

import { CertificateCatalogCard } from '@/components/academy/certificate-catalog-card';
import type { StorefrontAcademyCertificateListItem } from '@/lib/storefront-academy-certificates-api';

type Props = {
  title: ReactNode;
  countLabel: string;
  items: StorefrontAcademyCertificateListItem[];
  page: number;
  pageSize: number;
  total: number;
  pageHref: (page: number) => string;
  skillsPrefix: string;
};

export function CertificateCatalogView({
  title,
  countLabel,
  items,
  page,
  pageSize,
  total,
  pageHref,
  skillsPrefix,
}: Props) {
  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="container">
      <div className="catalog-header">
        <h1>{title}</h1>
        <p className="catalog-count">{countLabel}</p>
      </div>
      <div className="catalog-grid">
        {items.map((item) => (
          <CertificateCatalogCard
            key={item.slug}
            item={item}
            skillsPrefix={skillsPrefix}
          />
        ))}
      </div>
      {pageCount > 1 ? (
        <nav className="catalog-pagination" aria-label="Pagination">
          {page > 1 ? (
            <Link className="catalog-page-btn" href={pageHref(page - 1)} aria-label="Previous page">
              ‹
            </Link>
          ) : (
            <span className="catalog-page-btn is-disabled" aria-hidden>‹</span>
          )}
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <Link
              key={number}
              className={`catalog-page-btn${number === page ? ' is-active' : ''}`}
              href={pageHref(number)}
            >
              {number}
            </Link>
          ))}
          {page < pageCount ? (
            <Link className="catalog-page-btn" href={pageHref(page + 1)} aria-label="Next page">
              ›
            </Link>
          ) : (
            <span className="catalog-page-btn is-disabled" aria-hidden>›</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
