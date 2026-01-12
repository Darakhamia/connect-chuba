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

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, fontSize } = useSettings();

  useEffect(() => {
    // Apply accent color
    const color = accentColors[accentColor] || accentColors.indigo;
    document.documentElement.style.setProperty("--accent-color", color);
    
    // Apply font size
    document.documentElement.style.setProperty("--chat-font-size", `${fontSize}px`);
  }, [accentColor, fontSize]);

  return <>{children}</>;
}
