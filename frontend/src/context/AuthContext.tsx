import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { fetchMe, updateMe, loginUser, registerUser, setAuthToken, setUnauthorizedHandler } from '../services/api';

interface AuthContextValue {
  user: User | null;
  /** True while restoring a session from localStorage on first load. */
  loading: boolean;
  /** Set when the backend rejected a request as unauthorized (expired/invalid token) — surfaced on the Login screen. */
  sessionExpiredMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; cooperative_name?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (input: { name?: string; cooperative_name?: string }) => Promise<void>;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // On mount: if a token was persisted from a previous visit, validate it
  // against /me and restore the session. If it's expired/invalid, fetchMe()
  // will 401, which the unauthorized handler below turns into a logout.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasToken = !!localStorage.getItem('hg_token');
      if (!hasToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        // handled by the unauthorized handler / fetchJson clearing the token
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Registered once — fires whenever any authenticated request comes back 401.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      setUser(null);
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setAuthToken(result.access_token);
    setUser(result.user);
    setSessionExpiredMessage(null);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; cooperative_name?: string }) => {
      const result = await registerUser(input);
      setAuthToken(result.access_token);
      setUser(result.user);
      setSessionExpiredMessage(null);
    },
    [],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: { name?: string; cooperative_name?: string }) => {
    const updated = await updateMe(input);
    setUser(updated);
  }, []);

  const clearSessionExpiredMessage = useCallback(() => setSessionExpiredMessage(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, sessionExpiredMessage, login, register, logout, updateProfile, clearSessionExpiredMessage }),
    [user, loading, sessionExpiredMessage, login, register, logout, updateProfile, clearSessionExpiredMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
