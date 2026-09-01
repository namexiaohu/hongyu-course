'use client';

import { createContext, useContext } from 'react';

import type { StorefrontCompanyBranding } from '@/lib/storefront-company';

const SiteBrandingContext = createContext<StorefrontCompanyBranding | null>(null);

type Props = {
  branding: StorefrontCompanyBranding;
  children: React.ReactNode;
};

export function SiteBrandingProvider({ branding, children }: Props) {
  return (
    <SiteBrandingContext.Provider value={branding}>
      {children}
    </SiteBrandingContext.Provider>
  );
}

export function useSiteBranding() {
  const branding = useContext(SiteBrandingContext);
  if (!branding) {
    throw new Error('useSiteBranding must be used within SiteBrandingProvider');
  }
  return branding;
}
