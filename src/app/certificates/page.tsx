import { CertificateCatalogView } from '@/components/academy/certificate-catalog-view';
import { getPageTranslations, getStorefrontLocaleContext } from '@/lib/i18n-server';
import { getStorefrontAcademyCertificateList } from '@/lib/storefront-academy-certificates-api';

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const { locale } = await getStorefrontLocaleContext();
  const { t } = await getPageTranslations(locale, ['academy']);
  const list = await getStorefrontAcademyCertificateList({ locale, page });

  return (
    <CertificateCatalogView
      title={t('academy.catalog.allTitle')}
      countLabel={t('academy.catalog.allCount', { count: list.total })}
      items={list.items}
      page={list.page}
      pageSize={list.pageSize}
      total={list.total}
      pageHref={(target) => (target <= 1 ? '/certificates' : `/certificates?page=${target}`)}
      skillsPrefix={t('academy.certificate.skills')}
    />
  );
}
