"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings-store";

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  // Preview colors for the settings grid
  preview: {
    sidebar: string;
    main: string;
    accent: string;
  };
  // All CSS custom properties
  vars: {
    "accent-color": string;
    background: string;
    foreground: string;
    card: string;
    "card-foreground": string;
    popover: string;
    "popover-foreground": string;
    primary: string;
    "primary-foreground": string;
    secondary: string;
    "secondary-foreground": string;
    muted: string;
    "muted-foreground": string;
    accent: string;
    "accent-foreground": string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    "server-sidebar": string;
    "channel-sidebar": string;
    "chat-area": string;
    "chat-input": string;
    "user-panel": string;
    sidebar: string;
    "sidebar-foreground": string;
    "sidebar-primary": string;
    "sidebar-primary-foreground": string;
    "sidebar-accent": string;
    "sidebar-accent-foreground": string;
    "sidebar-border": string;
    "sidebar-ring": string;
    "chart-1": string;
    "chart-2": string;
    "chart-3": string;
    "chart-4": string;
    "chart-5": string;
  };
}

export const themes: ThemeDefinition[] = [
  {
    id: "acid",
    name: "Acid",
    description: "Кислотно-зелёный киберпанк",
    preview: { sidebar: "#050505", main: "#0e0e0e", accent: "#39ff14" },
    vars: {
      "accent-color": "#39ff14",
      background: "#0a0a0a",
      foreground: "#d4d4d4",
      card: "#111111",
      "card-foreground": "#d4d4d4",
      popover: "#0e0e0e",
      "popover-foreground": "#d4d4d4",
      primary: "#39ff14",
      "primary-foreground": "#000000",
      secondary: "#141414",
      "secondary-foreground": "#d4d4d4",
      muted: "#141414",
      "muted-foreground": "#525252",
      accent: "#39ff14",
      "accent-foreground": "#000000",
      destructive: "#ff3c3c",
      border: "#1a1a1a",
      input: "#111111",
      ring: "#39ff14",
      "server-sidebar": "#050505",
      "channel-sidebar": "#0a0a0a",
      "chat-area": "#0e0e0e",
      "chat-input": "#111111",
      "user-panel": "#080808",
      sidebar: "#0a0a0a",
      "sidebar-foreground": "#d4d4d4",
      "sidebar-primary": "#39ff14",
      "sidebar-primary-foreground": "#000000",
      "sidebar-accent": "#151515",
      "sidebar-accent-foreground": "#d4d4d4",
      "sidebar-border": "#1a1a1a",
      "sidebar-ring": "#39ff14",
      "chart-1": "#39ff14",
      "chart-2": "#00e5ff",
      "chart-3": "#facc15",
      "chart-4": "#d946ef",
      "chart-5": "#ff3c3c",
    },
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Фиолетовый призрак",
    preview: { sidebar: "#0c0514", main: "#120a1e", accent: "#a855f7" },
    vars: {
      "accent-color": "#a855f7",
      background: "#0e0815",
      foreground: "#d8d0e4",
      card: "#161022",
      "card-foreground": "#d8d0e4",
      popover: "#120a1e",
      "popover-foreground": "#d8d0e4",
      primary: "#a855f7",
      "primary-foreground": "#0e0815",
      secondary: "#1a1028",
      "secondary-foreground": "#d8d0e4",
      muted: "#1a1028",
      "muted-foreground": "#6b5f80",
      accent: "#a855f7",
      "accent-foreground": "#0e0815",
      destructive: "#ff4466",
      border: "#221838",
      input: "#161022",
      ring: "#a855f7",
      "server-sidebar": "#0c0514",
      "channel-sidebar": "#0e0815",
      "chat-area": "#120a1e",
      "chat-input": "#161022",
      "user-panel": "#0a0410",
      sidebar: "#0e0815",
      "sidebar-foreground": "#d8d0e4",
      "sidebar-primary": "#a855f7",
      "sidebar-primary-foreground": "#0e0815",
      "sidebar-accent": "#1a1028",
      "sidebar-accent-foreground": "#d8d0e4",
      "sidebar-border": "#221838",
      "sidebar-ring": "#a855f7",
      "chart-1": "#a855f7",
      "chart-2": "#e879f9",
      "chart-3": "#6366f1",
      "chart-4": "#38bdf8",
      "chart-5": "#ff4466",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Тёмно-красный и агрессивный",
    preview: { sidebar: "#0f0505", main: "#150808", accent: "#ef4444" },
    vars: {
      "accent-color": "#ef4444",
      background: "#0d0606",
      foreground: "#e0d0d0",
      card: "#1a0c0c",
      "card-foreground": "#e0d0d0",
      popover: "#150808",
      "popover-foreground": "#e0d0d0",
      primary: "#ef4444",
      "primary-foreground": "#0d0606",
      secondary: "#1e0e0e",
      "secondary-foreground": "#e0d0d0",
      muted: "#1e0e0e",
      "muted-foreground": "#7a5555",
      accent: "#ef4444",
      "accent-foreground": "#0d0606",
      destructive: "#ff6b6b",
      border: "#2a1515",
      input: "#1a0c0c",
      ring: "#ef4444",
      "server-sidebar": "#0a0404",
      "channel-sidebar": "#0d0606",
      "chat-area": "#110808",
      "chat-input": "#1a0c0c",
      "user-panel": "#080303",
      sidebar: "#0d0606",
      "sidebar-foreground": "#e0d0d0",
      "sidebar-primary": "#ef4444",
      "sidebar-primary-foreground": "#0d0606",
      "sidebar-accent": "#1e0e0e",
      "sidebar-accent-foreground": "#e0d0d0",
      "sidebar-border": "#2a1515",
      "sidebar-ring": "#ef4444",
      "chart-1": "#ef4444",
      "chart-2": "#f97316",
      "chart-3": "#facc15",
      "chart-4": "#fb7185",
      "chart-5": "#a855f7",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Глубокий океан, бирюзовые тона",
    preview: { sidebar: "#040e12", main: "#081418", accent: "#06b6d4" },
    vars: {
      "accent-color": "#06b6d4",
      background: "#06101a",
      foreground: "#cce4ec",
      card: "#0c1820",
      "card-foreground": "#cce4ec",
      popover: "#081418",
      "popover-foreground": "#cce4ec",
      primary: "#06b6d4",
      "primary-foreground": "#06101a",
      secondary: "#0e1c26",
      "secondary-foreground": "#cce4ec",
      muted: "#0e1c26",
      "muted-foreground": "#4a7080",
      accent: "#06b6d4",
      "accent-foreground": "#06101a",
      destructive: "#f43f5e",
      border: "#153040",
      input: "#0c1820",
      ring: "#06b6d4",
      "server-sidebar": "#040c14",
      "channel-sidebar": "#06101a",
      "chat-area": "#081418",
      "chat-input": "#0c1820",
      "user-panel": "#030a10",
      sidebar: "#06101a",
      "sidebar-foreground": "#cce4ec",
      "sidebar-primary": "#06b6d4",
      "sidebar-primary-foreground": "#06101a",
      "sidebar-accent": "#0e1c26",
      "sidebar-accent-foreground": "#cce4ec",
      "sidebar-border": "#153040",
      "sidebar-ring": "#06b6d4",
      "chart-1": "#06b6d4",
      "chart-2": "#22d3ee",
      "chart-3": "#2dd4bf",
      "chart-4": "#38bdf8",
      "chart-5": "#818cf8",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Тёплый закат, оранжевые оттенки",
    preview: { sidebar: "#100804", main: "#180e06", accent: "#f97316" },
    vars: {
      "accent-color": "#f97316",
      background: "#0e0a06",
      foreground: "#e4dcd0",
      card: "#1a1208",
      "card-foreground": "#e4dcd0",
      popover: "#140e06",
      "popover-foreground": "#e4dcd0",
      primary: "#f97316",
      "primary-foreground": "#0e0a06",
      secondary: "#201608",
      "secondary-foreground": "#e4dcd0",
      muted: "#201608",
      "muted-foreground": "#806840",
      accent: "#f97316",
      "accent-foreground": "#0e0a06",
      destructive: "#ef4444",
      border: "#302010",
      input: "#1a1208",
      ring: "#f97316",
      "server-sidebar": "#0a0604",
      "channel-sidebar": "#0e0a06",
      "chat-area": "#120c06",
      "chat-input": "#1a1208",
      "user-panel": "#080503",
      sidebar: "#0e0a06",
      "sidebar-foreground": "#e4dcd0",
      "sidebar-primary": "#f97316",
      "sidebar-primary-foreground": "#0e0a06",
      "sidebar-accent": "#201608",
      "sidebar-accent-foreground": "#e4dcd0",
      "sidebar-border": "#302010",
      "sidebar-ring": "#f97316",
      "chart-1": "#f97316",
      "chart-2": "#facc15",
      "chart-3": "#fb923c",
      "chart-4": "#ef4444",
      "chart-5": "#a3e635",
    },
  },
  {
    id: "frost",
    name: "Frost",
    description: "Ледяной холод, синие тона",
    preview: { sidebar: "#050810", main: "#0a0e18", accent: "#60a5fa" },
    vars: {
      "accent-color": "#60a5fa",
      background: "#080c16",
      foreground: "#d0dcea",
      card: "#0e1420",
      "card-foreground": "#d0dcea",
      popover: "#0a1018",
      "popover-foreground": "#d0dcea",
      primary: "#60a5fa",
      "primary-foreground": "#080c16",
      secondary: "#121a28",
      "secondary-foreground": "#d0dcea",
      muted: "#121a28",
      "muted-foreground": "#506880",
      accent: "#60a5fa",
      "accent-foreground": "#080c16",
      destructive: "#f43f5e",
      border: "#1a2840",
      input: "#0e1420",
      ring: "#60a5fa",
      "server-sidebar": "#050810",
      "channel-sidebar": "#080c16",
      "chat-area": "#0a1018",
      "chat-input": "#0e1420",
      "user-panel": "#04060c",
      sidebar: "#080c16",
      "sidebar-foreground": "#d0dcea",
      "sidebar-primary": "#60a5fa",
      "sidebar-primary-foreground": "#080c16",
      "sidebar-accent": "#121a28",
      "sidebar-accent-foreground": "#d0dcea",
      "sidebar-border": "#1a2840",
      "sidebar-ring": "#60a5fa",
      "chart-1": "#60a5fa",
      "chart-2": "#38bdf8",
      "chart-3": "#818cf8",
      "chart-4": "#22d3ee",
      "chart-5": "#a78bfa",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Розовый неон, мягкий и стильный",
    preview: { sidebar: "#100510", main: "#180a16", accent: "#ec4899" },
    vars: {
      "accent-color": "#ec4899",
      background: "#0e060c",
      foreground: "#e4d0dc",
      card: "#1a0c16",
      "card-foreground": "#e4d0dc",
      popover: "#140a12",
      "popover-foreground": "#e4d0dc",
      primary: "#ec4899",
      "primary-foreground": "#0e060c",
      secondary: "#200e1a",
      "secondary-foreground": "#e4d0dc",
      muted: "#200e1a",
      "muted-foreground": "#805070",
      accent: "#ec4899",
      "accent-foreground": "#0e060c",
      destructive: "#ef4444",
      border: "#301838",
      input: "#1a0c16",
      ring: "#ec4899",
      "server-sidebar": "#0a040a",
      "channel-sidebar": "#0e060c",
      "chat-area": "#120810",
      "chat-input": "#1a0c16",
      "user-panel": "#080308",
      sidebar: "#0e060c",
      "sidebar-foreground": "#e4d0dc",
      "sidebar-primary": "#ec4899",
      "sidebar-primary-foreground": "#0e060c",
      "sidebar-accent": "#200e1a",
      "sidebar-accent-foreground": "#e4d0dc",
      "sidebar-border": "#301838",
      "sidebar-ring": "#ec4899",
      "chart-1": "#ec4899",
      "chart-2": "#f472b6",
      "chart-3": "#a855f7",
      "chart-4": "#fb7185",
      "chart-5": "#e879f9",
    },
  },
  {
    id: "discord",
    name: "Discord",
    description: "Классический стиль Discord",
    preview: { sidebar: "#1e1f22", main: "#313338", accent: "#5865f2" },
    vars: {
      "accent-color": "#5865f2",
      background: "#313338",
      foreground: "#dbdee1",
      card: "#2b2d31",
      "card-foreground": "#dbdee1",
      popover: "#111214",
      "popover-foreground": "#dbdee1",
      primary: "#5865f2",
      "primary-foreground": "#ffffff",
      secondary: "#2b2d31",
      "secondary-foreground": "#dbdee1",
      muted: "#2b2d31",
      "muted-foreground": "#80848e",
      accent: "#5865f2",
      "accent-foreground": "#ffffff",
      destructive: "#da373c",
      border: "#3f4147",
      input: "#1e1f22",
      ring: "#5865f2",
      "server-sidebar": "#1e1f22",
      "channel-sidebar": "#2b2d31",
      "chat-area": "#313338",
      "chat-input": "#383a40",
      "user-panel": "#232428",
      sidebar: "#2b2d31",
      "sidebar-foreground": "#dbdee1",
      "sidebar-primary": "#5865f2",
      "sidebar-primary-foreground": "#ffffff",
      "sidebar-accent": "#35373c",
      "sidebar-accent-foreground": "#dbdee1",
      "sidebar-border": "#3f4147",
      "sidebar-ring": "#5865f2",
      "chart-1": "#5865f2",
      "chart-2": "#3ba55c",
      "chart-3": "#faa61a",
      "chart-4": "#eb459e",
      "chart-5": "#ed4245",
    },
  },
];

export function getThemeById(id: string): ThemeDefinition {
  return themes.find((t) => t.id === id) || themes[0];
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { theme, fontSize } = useSettings();

  useEffect(() => {
    const themeDef = getThemeById(theme);
    const root = document.documentElement;

    // Apply all CSS custom properties from the theme
    for (const [key, value] of Object.entries(themeDef.vars)) {
      root.style.setProperty(`--${key}`, value);
    }

    root.style.setProperty("--chat-font-size", `${fontSize}px`);
  }, [theme, fontSize]);

  return <>{children}</>;
}
