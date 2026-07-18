"use client";

/**
 * lib/mode-context.jsx
 * Tracks whether the app is in "work" (find work) or "hire" (hire
 * someone) mode. Persisted to localStorage. Drives the active theme
 * color (green for work, orange for hire) and which dashboard/nav
 * content renders.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ModeContext = createContext(undefined);

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState("work"); // "work" | "hire"
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("afrigigs_mode") : null;
    if (stored === "hire" || stored === "work") setModeState(stored);
    setHydrated(true);
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    if (typeof window !== "undefined") window.localStorage.setItem("afrigigs_mode", m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "work" ? "hire" : "work";
      if (typeof window !== "undefined") window.localStorage.setItem("afrigigs_mode", next);
      return next;
    });
  }, []);

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode, hydrated }}>{children}</ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within a ModeProvider");
  return ctx;
}
