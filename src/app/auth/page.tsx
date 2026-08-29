'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthModal } from '@/components/providers/auth-modal-provider';

export default function AuthPage() {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    openAuthModal('login');
    router.replace('/');
  }, [openAuthModal, router]);

  return null;
}
