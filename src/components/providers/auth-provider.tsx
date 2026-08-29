'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  ACCESS_TOKEN_KEY,
  AUTH_TOKEN_CHANGED_EVENT,
  clearAccessToken,
  getAccessToken,
} from '@/lib/api-client';
import { fetchProfile, logout as authLogout, type UserProfile } from '@/lib/auth-client';

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: (options?: { silent?: boolean }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (options?: { silent?: boolean }) => {
    if (!getAccessToken()) {
      setUser(null);
      if (!options?.silent) {
        setIsLoading(false);
      }
      return;
    }

    if (!options?.silent) {
      setIsLoading(true);
    }

    const result = await fetchProfile();
    if (result.status === 'ok') {
      setUser(result.profile);
    } else if (result.status === 'unauthorized') {
      // Token invalid/expired — clear session.
      clearAccessToken();
      setUser(null);
    }
    // status === 'unavailable': keep token + existing user (admin restart / network blip).

    if (!options?.silent) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    function onTokenChanged() {
      void refreshProfile({ silent: true });
    }

    function onStorage(event: StorageEvent) {
      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        void refreshProfile({ silent: true });
      }
    }

    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, onTokenChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, onTokenChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshProfile]);

  // Retry profile when tab becomes visible again (recovers after admin restart).
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== 'visible') return;
      if (!getAccessToken()) return;
      void refreshProfile({ silent: true });
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refreshProfile]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshProfile,
      logout,
    }),
    [user, isLoading, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
