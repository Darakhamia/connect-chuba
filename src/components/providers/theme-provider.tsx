"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, useCallback } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

// Для определения mounting состояния
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "connect-chuba-theme",
}: ThemeProviderProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  // Инициализируем тему из localStorage или defaultTheme
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(storageKey) as Theme | null;
    return stored || defaultTheme;
  });

  // Применение темы к документу
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  }, [storageKey]);

  const value = { theme, setTheme };

  return (
    <ThemeProviderContext.Provider value={value}>
      <div className={mounted ? "" : "dark"}>
        {children}
      </div>
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
