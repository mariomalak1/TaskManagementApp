import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthResponse, UserResponse } from '../types/api.types';

interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => tokenStorage.getUser());

  const setSession = useCallback((auth: AuthResponse) => {
    tokenStorage.setTokens(auth);
    tokenStorage.setUser(auth.user);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'Admin',
      setSession,
      logout,
    }),
    [user, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
}
