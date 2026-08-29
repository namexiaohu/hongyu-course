'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { AuthModal } from '@/components/academy/auth-modal';

export type AuthModalMode = 'login' | 'register';

type AuthModalContextValue = {
  open: boolean;
  mode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>('login');

  const openAuthModal = useCallback((nextMode: AuthModalMode = 'login') => {
    setMode(nextMode);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      open,
      mode,
      openAuthModal,
      closeAuthModal,
      setAuthModalMode: setMode,
    }),
    [open, mode, openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
