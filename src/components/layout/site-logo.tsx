import Link from 'next/link';

import { HongyuLogo } from '@/components/layout/hongyu-logo';

type Props = {
  companyName?: string;
  className?: string;
};

export function SiteLogo({ companyName = '', className }: Props) {
  const label = companyName.trim() || 'HONGYU MEDICAL';

  return (
    <Link href="/" className={className ?? 'course-nav__logo'} aria-label={label}>
      <HongyuLogo />
    </Link>
  );
}
