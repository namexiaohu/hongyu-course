import { redirect } from 'next/navigation';

import { CertificateCatalogView } from '@/components/academy/certificate-catalog-view';
import { getPageTranslations, getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateList } from '@/lib/storefront-academy-certificates-api';

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: rawQ = '', page: rawPage } = await searchParams;
  const q = rawQ.trim();
  if (!q) redirect('/certificates');

  const page = parsePage(rawPage);
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['academy']);
  const list = await getStorefrontAcademyCertificateList({ locale, page, q });
  const titleTemplate = t('academy.catalog.resultsTitle');
  const [titleBefore, titleAfter] = titleTemplate.split('{query}');

  return (
    <CertificateCatalogView
      title={
        <>
          {titleBefore}
          <span>{q}</span>
          {titleAfter}
        </>
      }
      countLabel={t('academy.catalog.resultsCount', { count: list.total, query: q })}
      items={list.items}
      page={list.page}
      pageSize={list.pageSize}
      total={list.total}
      pageHref={(target) => {
        const params = new URLSearchParams({ q });
        if (target > 1) params.set('page', String(target));
        return `/search?${params.toString()}`;
      }}
      academyName={t('academy.certificate.academyName')}
      academyName={t('academy.certificate.academyName')}
      skillsPrefix={t('academy.certificate.skills')}
    />
  );
}
