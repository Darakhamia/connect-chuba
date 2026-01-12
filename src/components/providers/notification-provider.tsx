"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings-store";
import { toast } from "sonner";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { 
    desktopNotifications, 
    soundNotifications,
    mentionNotifications,
    dmNotifications,
    serverNotifications 
  } = useSettings();

  // Request notification permission on mount
  useEffect(() => {
    if (desktopNotifications && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [desktopNotifications]);

  // Function to show notification
  const showNotification = (title: string, body: string, icon?: string) => {
    if (!desktopNotifications) return;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
      });
    }

    // Always show toast
    toast.info(body, { description: title });

    // Play sound if enabled
    if (soundNotifications) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.value = 0.1;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  };

  // Make notification function available globally
  useEffect(() => {
    (window as any).showNotification = showNotification;
    
    return () => {
      delete (window as any).showNotification;
    };
  }, [desktopNotifications, soundNotifications]);

  return <>{children}</>;
}
