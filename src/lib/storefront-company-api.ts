import { serverFetch } from '@/lib/api-client';
import { EMPTY_COMPANY_PROFILE, type StorefrontCompanyProfile } from '@/lib/storefront-company';

export async function getStorefrontCompanyProfile(locale?: string): Promise<StorefrontCompanyProfile> {
  try {
    return await serverFetch<StorefrontCompanyProfile>('/api/front/company', { locale });
  } catch {
    return { ...EMPTY_COMPANY_PROFILE, locale: locale ?? '' };
  }
}
