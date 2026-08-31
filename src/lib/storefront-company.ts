export type StorefrontCompanyProfile = {
  locale: string;
  companyName: string;
  slogan: string;
  positioning: string;
  copyright: string;
  companyEmail: string;
  businessEmail: string;
  website: string;
  icpNumber: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  businessHotline: string;
  basicInfo: Array<{ label: string; value: string }>;
  managementTeam: Array<{
    id: string;
    level: 'executive' | 'manager' | 'staff';
    sortOrder: number;
    name: string;
    title: string;
    email: string;
    contact: string;
    region: string;
    avatarUrl: string;
    supervisorId: string;
  }>;
  offices: Array<{
    coverImage: string;
    name: string;
    location: string;
    phone: string;
    contactPerson: string;
    email: string;
  }>;
  publicFiles: Array<{ name: string; url: string }>;
};

export type StorefrontCompanyBranding = {
  companyName: string;
  positioning: string;
  copyright: string;
  website: string;
  icpNumber: string;
};

export const EMPTY_COMPANY_PROFILE: StorefrontCompanyProfile = {
  locale: '',
  companyName: '',
  slogan: '',
  positioning: '',
  copyright: '',
  companyEmail: '',
  businessEmail: '',
  website: '',
  icpNumber: '',
  contactPhone: '',
  address: '',
  businessHours: '',
  businessHotline: '',
  basicInfo: [],
  managementTeam: [],
  offices: [],
  publicFiles: [],
};

export function toStorefrontCompanyBranding(
  company: Pick<StorefrontCompanyProfile, 'companyName' | 'positioning' | 'copyright' | 'website' | 'icpNumber'>,
): StorefrontCompanyBranding {
  return {
    companyName: company.companyName.trim(),
    positioning: company.positioning.trim(),
    copyright: company.copyright.trim(),
    website: company.website.trim(),
    icpNumber: company.icpNumber.trim(),
  };
}
