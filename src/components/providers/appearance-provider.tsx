"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings-store";

const accentColors: Record<string, string> = {
  indigo: "#5865f2",
  green: "#3ba55c",
  yellow: "#faa61a",
  red: "#ed4245",
  pink: "#eb459e",
  purple: "#9b59b6",
  cyan: "#00aff4",
  orange: "#e67e22",
};

// Background themes
const backgroundThemes: Record<string, {
  background: string;
  serverSidebar: string;
  channelSidebar: string;
  chatArea: string;
  userPanel: string;
  popover: string;
}> = {
  dark: {
    background: "#313338",
    serverSidebar: "#1e1f22",
    channelSidebar: "#2b2d31",
    chatArea: "#313338",
    userPanel: "#232428",
    popover: "#1e1f22",
  },
  darker: {
    background: "#1a1a1d",
    serverSidebar: "#0d0d0f",
    channelSidebar: "#141417",
    chatArea: "#1a1a1d",
    userPanel: "#101013",
    popover: "#0d0d0f",
  },
  midnight: {
    background: "#0e1525",
    serverSidebar: "#040810",
    channelSidebar: "#081020",
    chatArea: "#0e1525",
    userPanel: "#060c18",
    popover: "#040810",
  },
  amoled: {
    background: "#000000",
    serverSidebar: "#000000",
    channelSidebar: "#0a0a0a",
    chatArea: "#000000",
    userPanel: "#050505",
    popover: "#0a0a0a",
  },
};

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, backgroundColor, fontSize } = useSettings();

  useEffect(() => {
    // Apply accent color
    const color = accentColors[accentColor] || accentColors.indigo;
    document.documentElement.style.setProperty("--accent-color", color);
    
    // Apply to primary colors
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--ring", color);
    
    // Apply font size
    document.documentElement.style.setProperty("--chat-font-size", `${fontSize}px`);
    
    // Apply background theme
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
