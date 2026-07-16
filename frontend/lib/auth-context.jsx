"use client";

/**
 * lib/auth-context.jsx
 * Wraps the app to expose the current user + auth actions. On mount, if a
 * JWT exists in localStorage, silently refetches /users/me so a page
 * refresh doesn't log people out.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setToken } from "./api";
import { AuthApi } from "./endpoints";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await AuthApi.me();
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && window.localStorage.getItem("afrigigs_jwt");
    if (!hasToken) {
      setIsLoading(false);
      return;
    }
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (identifier, password) => {
    const res = await AuthApi.login(identifier, password);
    setToken(res.jwt);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await AuthApi.register(username, email, password);
    setToken(res.jwt);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
