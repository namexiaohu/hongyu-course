import Link from 'next/link';

import { HongyuLogo } from '@/components/layout/hongyu-logo';

type Props = {
  companyName?: string;
  fallbackName?: string;
  className?: string;
};

export function SiteLogo({ companyName = '', fallbackName = 'HONGYU MEDICAL', className }: Props) {
  const label = companyName.trim() || fallbackName;

  return (
    <Link href="/" className={className ?? 'course-nav__logo'} aria-label={label}>
      <HongyuLogo />
    </Link>
  );
}
