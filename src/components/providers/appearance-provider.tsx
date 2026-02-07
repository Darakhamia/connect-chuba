"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings-store";

const accentColors: Record<string, string> = {
  acid: "#39ff14",
  green: "#3ba55c",
  cyan: "#00e5ff",
  yellow: "#facc15",
  red: "#ff3c3c",
  pink: "#d946ef",
  purple: "#9b59b6",
  orange: "#e67e22",
};

const backgroundThemes: Record<string, {
  background: string;
  serverSidebar: string;
  channelSidebar: string;
  chatArea: string;
  userPanel: string;
  popover: string;
}> = {
  dark: {
    background: "#0a0a0a",
    serverSidebar: "#050505",
    channelSidebar: "#0a0a0a",
    chatArea: "#0e0e0e",
    userPanel: "#080808",
    popover: "#0e0e0e",
  },
  darker: {
    background: "#050505",
    serverSidebar: "#020202",
    channelSidebar: "#050505",
    chatArea: "#080808",
    userPanel: "#030303",
    popover: "#080808",
  },
  midnight: {
    background: "#0a0e1a",
    serverSidebar: "#04060e",
    channelSidebar: "#070b15",
    chatArea: "#0a0e1a",
    userPanel: "#050812",
    popover: "#070b15",
  },
  amoled: {
    background: "#000000",
    serverSidebar: "#000000",
    channelSidebar: "#050505",
    chatArea: "#000000",
    userPanel: "#000000",
    popover: "#050505",
  },
};

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, backgroundColor, fontSize } = useSettings();

  useEffect(() => {
    const color = accentColors[accentColor] || accentColors.acid;
    document.documentElement.style.setProperty("--accent-color", color);
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--ring", color);

    document.documentElement.style.setProperty("--chat-font-size", `${fontSize}px`);

    const theme = backgroundThemes[backgroundColor] || backgroundThemes.dark;
    document.documentElement.style.setProperty("--background", theme.background);
    document.documentElement.style.setProperty("--server-sidebar", theme.serverSidebar);
    document.documentElement.style.setProperty("--channel-sidebar", theme.channelSidebar);
    document.documentElement.style.setProperty("--chat-area", theme.chatArea);
    document.documentElement.style.setProperty("--user-panel", theme.userPanel);
    document.documentElement.style.setProperty("--popover", theme.popover);

  }, [accentColor, backgroundColor, fontSize]);

  return <>{children}</>;
}
