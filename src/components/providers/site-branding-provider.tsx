'use client';

import { createContext, useContext } from 'react';

import type { StorefrontCompanyBranding } from '@/lib/storefront-company';

const EMPTY_BRANDING: StorefrontCompanyBranding = {
  companyName: '',
  positioning: '',
  copyright: '',
  website: '',
  icpNumber: '',
};

const SiteBrandingContext = createContext<StorefrontCompanyBranding>(EMPTY_BRANDING);

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
  return useContext(SiteBrandingContext);
}
