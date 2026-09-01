import { serverFetch } from '@/lib/api-client';
import type { StorefrontCompanyProfile } from '@/lib/storefront-company';

export async function getStorefrontCompanyProfile(locale?: string): Promise<StorefrontCompanyProfile> {
  return serverFetch<StorefrontCompanyProfile>('/api/front/company', { locale });
}
