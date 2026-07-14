import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import apiClient, { AUTH_STORAGE_KEY } from '../api/client';

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  // Full login flow: authenticate against the same /auth/login endpoint the
  // customer site uses, then confirm admin access by calling an
  // admin-only endpoint. The backend has no separate "am I admin" check —
  // /api/admin/stats itself 403s for non-admins (see verify_admin in
  // admin_router.py) — so this reuses that as the authorization check
  // rather than inventing anything new.
  const login = useCallback(async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const loginRes = await apiClient.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, email: userEmail } = loginRes.data;

    try {
      await apiClient.get('/admin/stats', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error('This account does not have admin access.');
      }
      throw err;
    }

    const session = { token: access_token, email: userEmail };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  const value = useMemo(() => ({
    token: auth?.token || null,
    email: auth?.email || null,
    isAuthenticated: !!auth?.token,
    login,
    logout,
  }), [auth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
