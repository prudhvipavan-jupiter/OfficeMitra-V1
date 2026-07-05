"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AdminThemeMode = "normal" | "jupiter";

const STORAGE_KEY = "officemitra-admin-mode";

interface AdminThemeContextValue {
  mode: AdminThemeMode;
  setMode: (mode: AdminThemeMode) => void;
  toggleMode: () => void;
  isJupiter: boolean;
  ready: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AdminThemeMode>("jupiter");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "normal" || stored === "jupiter") setModeState(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setMode = useCallback((next: AdminThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "jupiter" ? "normal" : "jupiter");
  }, [mode, setMode]);

  return (
    <AdminThemeContext.Provider
      value={{ mode, setMode, toggleMode, isJupiter: mode === "jupiter", ready }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used within AdminThemeProvider");
  return ctx;
}
