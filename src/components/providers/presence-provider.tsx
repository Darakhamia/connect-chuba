"use client";

import { useEffect } from "react";

interface PresenceProviderProps {
  children: React.ReactNode;
  profileId?: string;
}

export function PresenceProvider({ children, profileId }: PresenceProviderProps) {
  useEffect(() => {
    if (!profileId) return;

    // Set user as ONLINE on mount
    const setOnline = async () => {
      try {
        await fetch("/api/profile/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ONLINE" }),
        });
      } catch (error) {
        console.error("Failed to set online status:", error);
      }
    };

    // Set user as OFFLINE on unmount/leave
    const setOffline = async () => {
      try {
        await fetch("/api/profile/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "OFFLINE" }),
        });
      } catch (error) {
        console.error("Failed to set offline status:", error);
      }
    };

    setOnline();

    // Heartbeat to keep user online
    const heartbeat = setInterval(() => {
      setOnline();
    }, 60000); // Every 1 minute

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, set to IDLE
        fetch("/api/profile/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "IDLE" }),
        }).catch(console.error);
      } else {
        // Page is visible again, set to ONLINE
        setOnline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle beforeunload (leaving page)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status on page unload
      const blob = new Blob(
        [JSON.stringify({ status: "OFFLINE" })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/profile/status", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOffline();
    };
  }, [profileId]);

  return <>{children}</>;
}
